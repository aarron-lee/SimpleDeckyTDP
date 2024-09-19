import { callable } from "@decky/api";
import { TdpProfiles } from "../redux-modules/settingsSlice";

export enum AdvancedOptionsEnum {
  ENABLE_TDP_CONTROL = "enableTdpControl",
  ENABLE_GPU_CONTROL = "enableGpuControl",
  STEAM_PATCH = "steamPatch",
  ENABLE_POWER_CONTROL = "enablePowercontrol",
  ENABLE_BACKGROUND_POLLING = "enableBackgroundPolling",
  MAX_TDP_ON_RESUME = "maxTdpOnResume",
  AC_POWER_PROFILES = "acPowerProfiles",
  FORCE_DISABLE_TDP_ON_RESUME = "forceDisableTdpOnResume",
  USE_PLATFORM_PROFILE = "platformProfile",
}

export enum RogAllyAdvancedOptions {
  USE_PLATFORM_PROFILE = "platformProfile",
  USE_WMI = "useWmi",
}

export enum LegionGoAdvancedOptions {
  CUSTOM_TDP_MODE = "lenovoCustomTdpMode",
}

export const DesktopAdvancedOptions = [
  AdvancedOptionsEnum.ENABLE_TDP_CONTROL,
  AdvancedOptionsEnum.ENABLE_GPU_CONTROL,
  AdvancedOptionsEnum.ENABLE_POWER_CONTROL,
  AdvancedOptionsEnum.AC_POWER_PROFILES,
  AdvancedOptionsEnum.FORCE_DISABLE_TDP_ON_RESUME,
  AdvancedOptionsEnum.ENABLE_BACKGROUND_POLLING,
  LegionGoAdvancedOptions.CUSTOM_TDP_MODE,
  RogAllyAdvancedOptions.USE_PLATFORM_PROFILE,
  RogAllyAdvancedOptions.USE_WMI,
] as string[];

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
  ON_SUSPEND = "on_suspend",
  PERSIST_CPU_BOOST = "persist_cpu_boost",
  SET_VALUES_FOR_GAME_ID = "set_values_for_game_id",
  SET_STEAM_PATCH_VALUES_FOR_GAME_ID = "set_steam_patch_values_for_game_id",
  SET_POWER_GOVERNOR = "set_power_governor",
  SET_EPP = "set_epp",
  GET_POWER_CONTROL_INFO = "get_power_control_info",
  GET_IS_STEAM_RUNNING = "is_steam_running",
  GET_SUPPORTS_CUSTOM_AC_POWER_MANAGEMENT = "supports_custom_ac_power_management",
  GET_CURRENT_AC_POWER_STATUS = "get_ac_power_status",
  SET_MAX_TDP = "set_max_tdp",
}

export const getSettings = callable<[], any>(ServerAPIMethods.GET_SETTINGS);
export const setSetting = callable<[{ name: String; value: any }], void>(
  ServerAPIMethods.SET_SETTING
);
export const onSuspend = callable<[], any>(ServerAPIMethods.ON_SUSPEND);

export const setMaxTdp = callable<[], void>(ServerAPIMethods.SET_MAX_TDP);
export const isSteamRunning = callable<[], boolean>(
  ServerAPIMethods.GET_IS_STEAM_RUNNING
);

export const createSaveTdp = () => async (gameId: string, tdp: number) => {
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
  () =>
  async (tdpProfiles: TdpProfiles, currentGameId: string, advanced: any) => {
    return await serverAPI.callPluginMethod(ServerAPIMethods.SAVE_TDP, {
      tdpProfiles,
      currentGameId,
      advanced,
    });
  };

export const createPollTdp = () => async (currentGameId: string) => {
  return await serverAPI.callPluginMethod(ServerAPIMethods.POLL_TDP, {
    currentGameId,
  });
};

export const getLatestVersionNum = async () => {
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

export const otaUpdate = async () => {
  return serverApi.callPluginMethod("ota_update", {});
};

export const createServerApiHelpers = () => {
  // export const is_paused = callable<[pid: number], boolean>("is_paused");
  return {
    logInfo: callable<[{ info: any }], any>(ServerAPIMethods.LOG_INFO),
    saveTdp: createSaveTdp(serverAPI),
    setPollTdp: createPollTdp(serverAPI),
    saveTdpProfiles: createSaveTdpProfiles(serverAPI),
  };
};

let serverApi: undefined | any;

export const saveServerApi = (s: any) => {
  serverApi = s;
};

export const getLogInfo = () => {
  return callable<[{ info: any }], any>(ServerAPIMethods.LOG_INFO);
};

export const getPowerControlInfo = () => {
  return serverApi?.callPluginMethod(
    ServerAPIMethods.GET_POWER_CONTROL_INFO,
    {}
  );
};

export const getSupportsCustomAcPower = () => {
  return serverApi?.callPluginMethod(
    ServerAPIMethods.GET_SUPPORTS_CUSTOM_AC_POWER_MANAGEMENT,
    {}
  );
};

export const getCurrentAcPowerStatus = () => {
  return serverApi?.callPluginMethod(
    ServerAPIMethods.GET_CURRENT_AC_POWER_STATUS,
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
    const logger = getLogInfo();
    logger(info);
  }
};
