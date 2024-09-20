import { callable, fetchNoCors } from "@decky/api";
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
  OTA_UPDATE = "ota_update",
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
export const setSetting = callable<[name: String, value: any], void>(
  ServerAPIMethods.SET_SETTING
);
export const onSuspend = callable<[], any>(ServerAPIMethods.ON_SUSPEND);

export const setPollTdp = callable<[{ currentGameId: string }], void>(
  ServerAPIMethods.POLL_TDP
);
export const setMaxTdp = callable<[], void>(ServerAPIMethods.SET_MAX_TDP);
export const isSteamRunning = callable<[], boolean>(
  ServerAPIMethods.GET_IS_STEAM_RUNNING
);

export const logInfo = (info: any) => {
  const logger = callable<[{ info: any }], any>(ServerAPIMethods.LOG_INFO);
  logger(info);
};
export const saveTdp = async (gameId: string, tdp: number) => {
  const tdpProfiles = {
    [gameId]: {
      tdp,
    },
  };

  const save = callable<[{ tdpProfiles: any; currentGameId: any }], any>(
    ServerAPIMethods.SAVE_TDP
  );

  return await save({
    tdpProfiles,
    currentGameId: gameId,
  });
};

export const saveTdpProfiles = callable<
  [{ tdpProfiles: any; currentGameId: any; advanced: any }, void]
>(ServerAPIMethods.SAVE_TDP);

export const getLatestVersionNum = async () => {
  try {
    const result = await fetchNoCors(
      "https://raw.githubusercontent.com/aarron-lee/SimpleDeckyTDP/main/package.json",
      { method: "GET" }
    );

    if (result.ok) {
      return (await result.json())["version"];
    } else {
      return "";
    }
  } catch (e) {
    console.log("Error fetching latest version", e);
    return "";
  }
};

export const otaUpdate = callable<[], void>(ServerAPIMethods.OTA_UPDATE);

export const getPowerControlInfo = callable(
  ServerAPIMethods.GET_POWER_CONTROL_INFO
);

export const getSupportsCustomAcPower = callable(
  ServerAPIMethods.GET_SUPPORTS_CUSTOM_AC_POWER_MANAGEMENT
);

export const getCurrentAcPowerStatus = callable(
  ServerAPIMethods.GET_CURRENT_AC_POWER_STATUS
);

export const setPowerGovernor = (powerGovernorInfo: any, gameId: string) => {
  const setter = callable<[{ powerGovernorInfo: any; gameId: string }], any>(
    ServerAPIMethods.SET_POWER_GOVERNOR
  );
  setter({
    powerGovernorInfo,
    gameId,
  });
};

export const setEpp = (eppInfo: any, gameId: string) => {
  const setter = callable<[{ eppInfo: any; gameId: string }], any>(
    ServerAPIMethods.SET_EPP
  );
  setter({
    eppInfo,
    gameId,
  });
};

export const persistTdp = (tdp: number, gameId: string) => {
  const setter = callable<[{ tdp: number; gameId: string }], any>(
    ServerAPIMethods.PERSIST_TDP
  );
  setter({
    tdp,
    gameId,
  });
};

export const setValuesForGameId = (gameId: string) => {
  const setter = callable<[{ gameId: string }], any>(
    ServerAPIMethods.SET_VALUES_FOR_GAME_ID
  );
  setter({
    gameId,
  });
};

export const setSteamPatchValuesForGameId = (gameId: string) => {
  const setter = callable<[{ gameId: string }], any>(
    ServerAPIMethods.SET_STEAM_PATCH_VALUES_FOR_GAME_ID
  );
  setter({
    gameId,
  });
};

export const persistGpu = (
  minGpuFrequency: number,
  maxGpuFrequency: number,
  gameId: string
) => {
  const setter = callable<
    [{ minGpuFrequency: number; maxGpuFrequency: number; gameId: string }],
    any
  >(ServerAPIMethods.PERSIST_GPU);
  setter({
    minGpuFrequency,
    maxGpuFrequency,
    gameId,
  });
};

export const persistSmt = (smt: boolean, gameId: string) => {
  const setter = callable<[{ smt: boolean; gameId: string }], any>(
    ServerAPIMethods.PERSIST_SMT
  );
  setter({
    smt,
    gameId,
  });
};

export const persistCpuBoost = (cpuBoost: boolean, gameId: string) => {
  const setter = callable<[{ cpuBoost: boolean; gameId: string }], any>(
    ServerAPIMethods.PERSIST_CPU_BOOST
  );
  setter({
    cpuBoost,
    gameId,
  });
};
