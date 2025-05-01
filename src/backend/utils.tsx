import { callable, call } from "@decky/api";
import { IS_DESKTOP } from "../components/atoms/DeckyFrontendLib";

export enum Devices {
  LEGION_GO = "83E1",
  ROG_ALLY = "ROG Ally RC71",
  ROG_ALLY_X = "ROG Ally X RC72",
  MINISFORUM_V3 = "V3",
  GPD_WM2 = "G1619-04",
  GPD_WIN4 = "G1618-04",
  ASUS_FLOW_Z13 = "ROG Flow Z13 GZ302EA_GZ302EA",
  ASUS_FLOW_Z13_SHORT = "ROG Flow Z13 GZ302",
}

export enum AdvancedOptionsEnum {
  ENABLE_TDP_CONTROL = "enableTdpControl",
  ENABLE_GPU_CONTROL = "enableGpuControl",
  ENABLE_APU_SLOW_LIMIT = "enableApuSlowLimit",
  ENABLE_RYZENADJ_UNDERVOLT = "enableRyzenadjUndervolt",
  RYZENADJ_UNDERVOLT = "ryzenadjUndervolt",
  STEAM_PATCH = "steamPatch",
  ENABLE_POWER_CONTROL = "enablePowercontrol",
  ENABLE_BACKGROUND_POLLING = "enableBackgroundPolling",
  ENABLE_AUTOMATIC_CPU_MANAGEMENT = "enableAutomaticEppManagement",
  MAX_TDP_ON_RESUME = "maxTdpOnResume",
  MAX_TDP_ON_GAME_PROFILE_CHANGE = "maxTdpOnGameProfileChange",
  AC_POWER_PROFILES = "acPowerProfiles",
  FORCE_DISABLE_TDP_ON_RESUME = "forceDisableTdpOnResume",
  USE_PLATFORM_PROFILE = "platformProfile",
}

export enum AdvancedOptionsType {
  BOOLEAN = "boolean",
  NUMBER_RANGE = "number_range",
}

export enum RogAllyAdvancedOptions {
  USE_PLATFORM_PROFILE = "platformProfile",
  USE_WMI = "useWmi",
  USE_EXTREME_POWERSAVE = "useExtremePowersave",
}

export enum LegionGoAdvancedOptions {
  CUSTOM_TDP_MODE = "lenovoCustomTdpMode",
}

export const DesktopAdvancedOptions = [
  AdvancedOptionsEnum.ENABLE_TDP_CONTROL,
  AdvancedOptionsEnum.ENABLE_GPU_CONTROL,
  AdvancedOptionsEnum.ENABLE_APU_SLOW_LIMIT,
  AdvancedOptionsEnum.ENABLE_POWER_CONTROL,
  AdvancedOptionsEnum.ENABLE_RYZENADJ_UNDERVOLT,
  AdvancedOptionsEnum.RYZENADJ_UNDERVOLT,
  AdvancedOptionsEnum.AC_POWER_PROFILES,
  AdvancedOptionsEnum.FORCE_DISABLE_TDP_ON_RESUME,
  AdvancedOptionsEnum.ENABLE_BACKGROUND_POLLING,
  AdvancedOptionsEnum.ENABLE_AUTOMATIC_CPU_MANAGEMENT,
  LegionGoAdvancedOptions.CUSTOM_TDP_MODE,
  RogAllyAdvancedOptions.USE_PLATFORM_PROFILE,
  RogAllyAdvancedOptions.USE_WMI,
  RogAllyAdvancedOptions.USE_EXTREME_POWERSAVE,
] as string[];

export enum GpuModes {
  BATTERY = "BATTERY",
  BALANCE = "BALANCE",
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
  GET_LATEST_VERSION_NUM = "get_latest_version_num",
}

export const getSettings = callable<[], any>(ServerAPIMethods.GET_SETTINGS);
export const setSetting = ({ name, value }: { name: string; value: any }) => {
  if (IS_DESKTOP) {
    return call(ServerAPIMethods.SET_SETTING, { name, value });
  }

  return call(ServerAPIMethods.SET_SETTING, name, value);
};
export const onSuspend = callable(ServerAPIMethods.ON_SUSPEND);

export const setPollTdp = ({ currentGameId }: { currentGameId: string }) => {
  if (IS_DESKTOP) {
    return call(ServerAPIMethods.POLL_TDP, { currentGameId });
  }

  return call(ServerAPIMethods.POLL_TDP, currentGameId);
};
export const setMaxTdp = callable(ServerAPIMethods.SET_MAX_TDP);
export const isSteamRunning = callable(ServerAPIMethods.GET_IS_STEAM_RUNNING);

export const logInfo = ({ info }: { info: any }) => {
  return call(ServerAPIMethods.LOG_INFO, { info });
};

export const saveTdpProfiles = ({
  tdpProfiles,
  currentGameId,
  advanced,
}: {
  tdpProfiles: any;
  currentGameId: any;
  advanced: any;
}) => {
  if (IS_DESKTOP) {
    return call(ServerAPIMethods.SAVE_TDP, {
      tdpProfiles,
      currentGameId,
      advanced,
    });
  }
  return call(ServerAPIMethods.SAVE_TDP, tdpProfiles, currentGameId, advanced);
};

export const getLatestVersionNum = callable(
  ServerAPIMethods.GET_LATEST_VERSION_NUM,
);

export const otaUpdate = callable(ServerAPIMethods.OTA_UPDATE);

export const getPowerControlInfo = callable(
  ServerAPIMethods.GET_POWER_CONTROL_INFO,
);

export const getSupportsCustomAcPower = callable(
  ServerAPIMethods.GET_SUPPORTS_CUSTOM_AC_POWER_MANAGEMENT,
);

export const getCurrentAcPowerStatus = callable(
  ServerAPIMethods.GET_CURRENT_AC_POWER_STATUS,
);

export const setPowerGovernor = ({
  powerGovernorInfo,
  gameId,
}: {
  powerGovernorInfo: any;
  gameId: string;
}) => {
  if (IS_DESKTOP) {
    return call(ServerAPIMethods.SET_POWER_GOVERNOR, {
      powerGovernorInfo,
      gameId,
    });
  }

  return call(ServerAPIMethods.SET_POWER_GOVERNOR, powerGovernorInfo, gameId);
};

export const setEpp = ({
  eppInfo,
  gameId,
}: {
  eppInfo: any;
  gameId: string;
}) => {
  if (IS_DESKTOP) {
    return call(ServerAPIMethods.SET_EPP, { eppInfo, gameId });
  }

  return call(ServerAPIMethods.SET_EPP, eppInfo, gameId);
};

export const persistTdp = ({
  tdp,
  gameId,
}: {
  tdp: number;
  gameId: string;
}) => {
  if (IS_DESKTOP) {
    return call(ServerAPIMethods.PERSIST_TDP, { tdp, gameId });
  }

  return call(ServerAPIMethods.PERSIST_TDP, tdp, gameId);
};

export const setValuesForGameId = ({ gameId }: { gameId: string }) => {
  if (IS_DESKTOP) {
    return call(ServerAPIMethods.SET_VALUES_FOR_GAME_ID, { gameId });
  }

  return call(ServerAPIMethods.SET_VALUES_FOR_GAME_ID, gameId);
};

export const setSteamPatchValuesForGameId = ({
  gameId,
}: {
  gameId: string;
}) => {
  if (IS_DESKTOP) {
    return call(ServerAPIMethods.SET_STEAM_PATCH_VALUES_FOR_GAME_ID, {
      gameId,
    });
  }

  return call(ServerAPIMethods.SET_STEAM_PATCH_VALUES_FOR_GAME_ID, gameId);
};

export const persistGpu = ({
  minGpuFrequency,
  maxGpuFrequency,
  gameId,
}: {
  minGpuFrequency: number;
  maxGpuFrequency: number;
  gameId: string;
}) => {
  if (IS_DESKTOP) {
    return call(ServerAPIMethods.PERSIST_GPU, {
      minGpuFrequency,
      maxGpuFrequency,
      gameId,
    });
  }

  return call<
    [minGpuFrequency: number, maxGpuFrequency: number, gameId: string],
    any
  >(ServerAPIMethods.PERSIST_GPU, minGpuFrequency, maxGpuFrequency, gameId);
};

export const persistSmt = ({
  smt,
  gameId,
}: {
  smt: boolean;
  gameId: string;
}) => {
  if (IS_DESKTOP) {
    return call(ServerAPIMethods.PERSIST_SMT, {
      smt,
      gameId,
    });
  }

  return call(ServerAPIMethods.PERSIST_SMT, smt, gameId);
};

export const persistCpuBoost = ({
  cpuBoost,
  gameId,
}: {
  cpuBoost: boolean;
  gameId: string;
}) => {
  if (IS_DESKTOP) {
    return call(ServerAPIMethods.PERSIST_CPU_BOOST, { cpuBoost, gameId });
  }

  return call(ServerAPIMethods.PERSIST_CPU_BOOST, cpuBoost, gameId);
};
