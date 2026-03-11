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

def set_tdp(tdp, max_retries=3):
  for attempt in range(max_retries):
    profile_ok = set_platform_profile("custom")
    if not profile_ok and attempt < max_retries - 1:
      delay = 0.3 * (attempt + 1)
      decky_plugin.logger.warning(f"{__name__} platform profile failed, retrying in {delay}s (attempt {attempt + 1}/{max_retries})")
      sleep(delay)
      continue

    if (
      os.path.exists(LENOVO_WMI_FAST_PATH)
      and os.path.exists(LENOVO_WMI_SLOW_PATH)
      and os.path.exists(LENOVO_WMI_STAPM_PATH)
    ):
      decky_plugin.logger.info(f"{__name__} Setting Lenovo WMI TDP {tdp}")

      sleep(0.3)
      ok_fast = set_suffix_tdp(tdp, FAST_SUFFIX)
      sleep(0.3)
      ok_slow = set_suffix_tdp(tdp, SLOW_SUFFIX)
      sleep(0.3)
      ok_stapm = set_suffix_tdp(tdp, STAPM_SUFFIX)

      if ok_fast and ok_slow and ok_stapm:
        return True

      if attempt < max_retries - 1:
        delay = 0.3 * (attempt + 1)
        decky_plugin.logger.warning(f"{__name__} TDP write incomplete, retrying in {delay}s (attempt {attempt + 1}/{max_retries})")
        sleep(delay)
        continue

    decky_plugin.logger.error(f"{__name__} WMI TDP paths not found (attempt {attempt + 1}/{max_retries})")
    if attempt < max_retries - 1:
      delay = 0.3 * (attempt + 1)
      sleep(delay)

  decky_plugin.logger.error(f"{__name__} Failed to set TDP {tdp} after {max_retries} attempts")
  return False

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

def set_platform_profile(profile: str) -> bool:
  try:
    profile_base = get_platform_profile_path()
    if not profile_base:
      decky_plugin.logger.error(f"{__name__} Platform profile path not found")
      return False
    set_profile_path = os.path.join(profile_base, "profile")
    if os.path.exists(set_profile_path):
      decky_plugin.logger.info(f'setting profile {profile} to path {set_profile_path}')
      with open(set_profile_path, "w") as f:
        f.write(profile)
      return True
    else:
      decky_plugin.logger.error(f"{__name__} Profile path does not exist: {set_profile_path}")
      return False
  except Exception as e:
    decky_plugin.logger.error(f"{__name__} Failed to set platform profile {profile}: {e}")
    return False

def set_suffix_tdp(tdp: int, suffix: str) -> bool:
  suffix_path = f'{LENOVO_WMI_PATH}/{suffix}/current_value'

  try:
    with open(suffix_path, "w") as f:
      min, max = get_tdp_limit(suffix)

      tdp_value = tdp

      if min and tdp_value < min:
        tdp_value = min
      if max and tdp_value > max:
        tdp_value = max

      f.write(str(tdp_value))
      decky_plugin.logger.info(f'set {suffix} WMI TDP {tdp_value}')
    return True
  except Exception as e:
    decky_plugin.logger.error(f"{__name__} Failed to write {suffix} TDP: {e}")
    return False

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

def invalidate_platform_profile_cache():
  global PLATFORM_PROFILE_PATH
  PLATFORM_PROFILE_PATH = None
  decky_plugin.logger.info(f"{__name__} Invalidated platform profile cache")

def wait_for_wmi_ready(timeout_seconds=10):
  elapsed = 0
  interval = 0.5
  while elapsed < timeout_seconds:
    if supports_wmi_tdp():
      decky_plugin.logger.info(f"{__name__} WMI ready after {elapsed}s")
      return True
    sleep(interval)
    elapsed += interval
  decky_plugin.logger.warning(f"{__name__} WMI not ready after {timeout_seconds}s timeout")
  return False