from enum import Enum

class GpuModes(Enum):
  BATTERY = "BATTERY"
  BALANCE = "BALANCE"
  RANGE = "RANGE"
  FIXED = "FIXED"

class GpuRange(Enum):
  MIN = "minGpuFrequency"
  MAX = "maxGpuFrequency"
  FIXED = "fixedGpuFrequency"

class ServerAPIMethods(Enum):
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
  SET_POWER_GOVERNOR = "set_power_governor",
  SET_EPP = "set_epp",
  GET_POWER_CONTROL_INFO = "get_power_control_info",
  GET_IS_STEAM_RUNNING = "is_steam_running",
  GET_SUPPORTS_CUSTOM_AC_POWER_MANAGEMENT = "supports_custom_ac_power_management",
  GET_CURRENT_AC_POWER_STATUS = "get_ac_power_status",
  SET_MAX_TDP = "set_max_tdp",
  GET_LATEST_VERSION_NUM = "get_latest_version_num",
  RESET_SETTINGS = "reset_settings"