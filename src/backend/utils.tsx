import { ServerAPI } from "decky-frontend-lib";
import { TdpProfiles } from "../redux-modules/settingsSlice";
import { extractCurrentGameId } from "../utils/constants";

export enum AdvancedOptionsEnum {
  STEAM_PATCH = "steamPatch",
  ENABLE_POWER_CONTROL = "enablePowercontrol",
  ENABLE_BACKGROUND_POLLING = "enableBackgroundPolling",
  MAX_TDP_ON_RESUME = "maxTdpOnResume",
}

export enum GpuModes {
  DEFAULT = "DEFAULT",
  RANGE = "RANGE",
  FIXED = "FIXED",
}

export enum ServerAPIMethods {
  SET_SETTING = "set_setting",
  GET_SETTINGS = "get_settings",
  LOG_INFO = "log_info",
  SET_TDP = "set_tdp",
  SAVE_TDP = "save_tdp",
  POLL_TDP = "poll_tdp",
  PERSIST_TDP = "persist_tdp",
  PERSIST_GPU = "persist_gpu",
  PERSIST_SMT = "persist_smt",
  PERSIST_CPU_BOOST = "persist_cpu_boost",
  SET_VALUES_FOR_GAME_ID = "set_values_for_game_id",
  SET_STEAM_PATCH_VALUES_FOR_GAME_ID = "set_steam_patch_values_for_game_id",
  SET_POWER_GOVERNOR = "set_power_governor",
  SET_EPP = "set_epp",
  GET_POWER_CONTROL_INFO = "get_power_control_info",
}

export const createLogInfo = (serverAPI: ServerAPI) => async (info: any) => {
  await serverAPI.callPluginMethod(ServerAPIMethods.LOG_INFO, {
    info,
  });
};

export const createSetSetting =
  (serverAPI: ServerAPI) =>
  async ({ fieldName, fieldValue }: { fieldName: string; fieldValue: any }) =>
    await serverAPI.callPluginMethod(ServerAPIMethods.SET_SETTING, {
      name: fieldName,
      value: fieldValue,
    });

export const createGetSettings = (serverAPI: ServerAPI) => async () => {
  return await serverAPI.callPluginMethod(ServerAPIMethods.GET_SETTINGS, {});
};

export const createSaveTdp =
  (serverAPI: ServerAPI) => async (gameId: string, tdp: number) => {
    const tdpProfiles = {
      [gameId]: {
        tdp,
      },
    };

    return await serverAPI.callPluginMethod(ServerAPIMethods.SAVE_TDP, {
      tdpProfiles,
      currentGameId: gameId,
    });
  };

export const createSaveTdpProfiles =
  (serverAPI: ServerAPI) =>
  async (tdpProfiles: TdpProfiles, currentGameId: string, advanced: any) => {
    return await serverAPI.callPluginMethod(ServerAPIMethods.SAVE_TDP, {
      tdpProfiles,
      currentGameId,
      advanced,
    });
  };

export const createPollTdp =
  (serverAPI: ServerAPI) => async (currentGameId: string) => {
    return await serverAPI.callPluginMethod(ServerAPIMethods.POLL_TDP, {
      currentGameId,
    });
  };

export const getLatestVersionNum = async (serverApi: ServerAPI) => {
  const { result } = await serverApi.fetchNoCors(
    "https://raw.githubusercontent.com/aarron-lee/SimpleDeckyTDP/main/package.json",
    { method: "GET" }
  );

  //@ts-ignore
  const body = result.body as string;
  if (body && typeof body === "string") {
    return JSON.parse(body)["version"];
  }
  return "";
};

export const otaUpdate = async (serverApi: ServerAPI) => {
  return serverApi.callPluginMethod("ota_update", {});
};

export const createServerApiHelpers = (serverAPI: ServerAPI) => {
  return {
    getSettings: createGetSettings(serverAPI),
    setSetting: createSetSetting(serverAPI),
    logInfo: createLogInfo(serverAPI),
    saveTdp: createSaveTdp(serverAPI),
    setPollTdp: createPollTdp(serverAPI),
    saveTdpProfiles: createSaveTdpProfiles(serverAPI),
  };
};

let serverApi: undefined | ServerAPI;

export const saveServerApi = (s: ServerAPI) => {
  serverApi = s;
};

export const getServerApi = () => {
  return serverApi;
};

export const getLogInfo = () => {
  if (serverApi) {
    const logInfo = createLogInfo(serverApi);
    return logInfo;
  } else {
    return () => {};
  }
};

export const getPowerControlInfo = () => {
  return serverApi?.callPluginMethod(
    ServerAPIMethods.GET_POWER_CONTROL_INFO,
    {}
  );
};

export const setPowerGovernor = (powerGovernorInfo: any, gameId: string) => {
  if (serverApi) {
    serverApi.callPluginMethod(ServerAPIMethods.SET_POWER_GOVERNOR, {
      powerGovernorInfo,
      gameId,
    });
  }
};

export const setEpp = (eppInfo: any, gameId: string) => {
  if (serverApi) {
    serverApi.callPluginMethod(ServerAPIMethods.SET_EPP, {
      eppInfo,
      gameId,
    });
  }
};

export const setPollTdp = (gameId: string) => {
  if (serverApi) {
    const pollTdp = createPollTdp(serverApi);
    pollTdp(gameId);
  }
};

export const persistTdp = (tdp: number, gameId: string) => {
  if (serverApi) {
    serverApi.callPluginMethod(ServerAPIMethods.PERSIST_TDP, {
      tdp,
      gameId,
    });
  }
};

export const setValuesForGameId = (gameId: string) => {
  if (serverApi) {
    serverApi.callPluginMethod(ServerAPIMethods.SET_VALUES_FOR_GAME_ID, {
      gameId,
    });
  }
};

export const setSteamPatchValuesForGameId = (gameId: string) => {
  if (serverApi) {
    serverApi.callPluginMethod(
      ServerAPIMethods.SET_STEAM_PATCH_VALUES_FOR_GAME_ID,
      {
        gameId,
      }
    );
  }
};

export const persistGpu = (
  minGpuFrequency: number,
  maxGpuFrequency: number,
  gameId: string
) => {
  if (serverApi) {
    serverApi.callPluginMethod(ServerAPIMethods.PERSIST_GPU, {
      minGpuFrequency,
      maxGpuFrequency,
      gameId,
    });
  }
};

export const persistSmt = (smt: boolean, gameId: string) => {
  if (serverApi) {
    serverApi.callPluginMethod(ServerAPIMethods.PERSIST_SMT, {
      smt,
      gameId,
    });
  }
};

export const persistCpuBoost = (cpuBoost: boolean, gameId: string) => {
  if (serverApi) {
    serverApi.callPluginMethod(ServerAPIMethods.PERSIST_CPU_BOOST, {
      cpuBoost,
      gameId,
    });
  }
};

export const logInfo = (info: any) => {
  if (serverApi) {
    const logger = createLogInfo(serverApi);
    const s = getServerApi();
    s && logger(info);
  }
};
