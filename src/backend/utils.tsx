import { ServerAPI } from "decky-frontend-lib";
import { TdpProfiles } from "../redux-modules/settingsSlice";
import { extractCurrentGameId } from "../utils/constants";

export enum AdvancedOptionsEnum {
  STEAM_PATCH = "steamPatch",
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
  SAVE_STEAM_PATCH_TDP = "save_steam_patch_tdp",
  SAVE_STEAM_PATCH_GPU = "save_steam_patch_gpu",
  SAVE_STEAM_PATCH_TDP_PROFILE = "save_steam_patch_tdp_profile",
  SET_VALUES_FOR_GAME_ID = "set_values_for_game_id",
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

export const setSteamPatchTDP = (tdp: number, gameId: string) => {
  if (serverApi) {
    serverApi.callPluginMethod(ServerAPIMethods.SAVE_STEAM_PATCH_TDP, {
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

export const setSteamPatchGPU = (
  minGpuFrequency: number,
  maxGpuFrequency: number,
  gameId: string
) => {
  if (serverApi) {
    serverApi.callPluginMethod(ServerAPIMethods.SAVE_STEAM_PATCH_GPU, {
      minGpuFrequency,
      maxGpuFrequency,
      gameId,
    });
  }
};

export const saveSteamPatchTdpProfiles = (tdpProfiles: any, advanced: any) => {
  const gameId = extractCurrentGameId();
  if (serverApi) {
    serverApi.callPluginMethod(ServerAPIMethods.SAVE_STEAM_PATCH_TDP_PROFILE, {
      tdpProfiles,
      gameId,
      advanced,
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
