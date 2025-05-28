import decky_plugin
import os
from time import sleep

LENOVO_WMI_PATH = "/sys/class/firmware-attributes/lenovo-wmi-other-0/attributes"

FAST_SUFFIX = "ppt_pl3_fppt"
SLOW_SUFFIX = "ppt_pl2_sppt"
STAPM_SUFFIX = "ppt_pl1_spl"

LENOVO_WMI_FAST_PATH = f"{LENOVO_WMI_PATH}/{FAST_SUFFIX}/current_value"
LENOVO_WMI_SLOW_PATH = f"{LENOVO_WMI_PATH}/{SLOW_SUFFIX}/current_value"
LENOVO_WMI_STAPM_PATH = f"{LENOVO_WMI_PATH}/{STAPM_SUFFIX}/current_value"

# credit:
# https://github.com/mengmeet/PowerControl/blob/main/py_modules/devices/lenovo/lenovo_device.py


PLATFORM_PROFILE_PATH = None

def find_sysdir(prefix: str, name: str) -> str:
  for dir in os.listdir(prefix):
    base_path = os.path.join(prefix, dir)
    if os.path.exists(os.path.join(base_path, "name")):
      with open(os.path.join(base_path, "name"), "r") as f:
        if f.read().strip() == name:
          return base_path
  return None

def get_platform_profile_path():
  global PLATFORM_PROFILE_PATH

  if not PLATFORM_PROFILE_PATH:
    PLATFORM_PROFILE_PATH = find_sysdir("/sys/class/platform-profile", "lenovo-wmi-gamezone")

  return PLATFORM_PROFILE_PATH

def set_tdp(tdp):
  set_platform_profile("custom")
  if (
    os.path.exists(LENOVO_WMI_FAST_PATH)
    and os.path.exists(LENOVO_WMI_SLOW_PATH)
    and os.path.exists(LENOVO_WMI_STAPM_PATH)
  ):
    decky_plugin.logger.info(f"{__name__} Setting Lenovo WMI TDP {tdp}")

    sleep(0.1)
    set_suffix_tdp(tdp, FAST_SUFFIX)
    sleep(0.1)
    set_suffix_tdp(tdp, SLOW_SUFFIX)
    sleep(0.1)
    set_suffix_tdp(tdp, STAPM_SUFFIX)

def supports_wmi_tdp():
  if (
    os.path.exists(LENOVO_WMI_FAST_PATH)
    and os.path.exists(LENOVO_WMI_SLOW_PATH)
    and os.path.exists(LENOVO_WMI_STAPM_PATH)
    and get_platform_profile_path() != None
    and os.path.exists(get_platform_profile_path())
  ):
    return True
  return False

def set_platform_profile(profile: str) -> None:
  set_profile_path = os.path.join(get_platform_profile_path(), "profile")
  if os.path.exists(set_profile_path):
    decky_plugin.logger.info(f'setting profile {profile} to path {set_profile_path}')
    try:
      with open(set_profile_path, "w") as f:
        f.write(profile)
    except Exception as e:
      decky_plugin.logger.error(f"{__name__} Failed to set platform profile {profile}: {e}")

def set_suffix_tdp(tdp: int, suffix: str):
  suffix_path = f'{LENOVO_WMI_PATH}/{suffix}/current_value'

  with open(suffix_path, "w") as f:
    min, max = get_tdp_limit(suffix)

    tdp_value = tdp

    if min and tdp_value < min:
      tdp_value = min
    if max and tdp_value > max:
      tdp_value = max

    f.write(str(tdp_value))
    decky_plugin.logger.info(f'set {suffix} WMI TDP {tdp_value}')

def get_tdp_limit(suffix: str):
  min = get_min_tdp(suffix)
  max = get_max_tdp(suffix)

  return [min, max]

def get_min_tdp(suffix: str):
  min_tdp = None
  if os.path.exists(f"{LENOVO_WMI_PATH}/{suffix}/min_value"):
    with open(f"{LENOVO_WMI_PATH}/{suffix}/min_value", "r") as f:
      min_tdp = int(f.read())
  return min_tdp

def get_max_tdp(suffix: str):
  max_tdp = None
  if os.path.exists(f"{LENOVO_WMI_PATH}/{suffix}/max_value"):
    with open(f"{LENOVO_WMI_PATH}/{suffix}/max_value", "r") as f:
      max_tdp = int(f.read())
  return max_tdp