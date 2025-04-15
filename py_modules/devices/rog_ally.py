import subprocess
import shutil
from time import sleep
import os
import decky_plugin
import bios_settings
import json
import device_utils

PLATFORM_PROFILE_PATH  = '/sys/firmware/acpi/platform_profile'

FAST_WMI_PATH  = '/sys/devices/platform/asus-nb-wmi/ppt_fppt'
SLOW_WMI_PATH  = '/sys/devices/platform/asus-nb-wmi/ppt_pl2_sppt'
STAPM_WMI_PATH = '/sys/devices/platform/asus-nb-wmi/ppt_pl1_spl'

ASUS_ARMORY_WMI_BASE = "/sys/class/firmware-attributes/asus-armoury/attributes"

ASUS_ARMORY_FAST_WMI_PATH = f"{ASUS_ARMORY_WMI_BASE}/ppt_fppt/current_value"
ASUS_ARMORY_SLOW_WMI_PATH = f"{ASUS_ARMORY_WMI_BASE}/ppt_pl2_sppt/current_value"
ASUS_ARMORY_STAPM_WMI_PATH = f"{ASUS_ARMORY_WMI_BASE}/ppt_pl1_spl/current_value"

UPDATED_ASUS_ARMORY_FAST_WMI_PATH = f"{ASUS_ARMORY_WMI_BASE}/ppt_pl3_fppt/current_value"

LEGACY_MCU_POWERSAVE_PATH = "/sys/devices/platform/asus-nb-wmi/mcu_powersave"
ASUS_ARMORY_MCU_POWERSAVE_PATH = f"{ASUS_ARMORY_WMI_BASE}/mcu_powersave"

def set_mcu_powersave(enabled):
  try:
    if os.path.exists(LEGACY_MCU_POWERSAVE_PATH):
        with open(LEGACY_MCU_POWERSAVE_PATH, 'w') as file:
          file.write('1' if enabled else '0')
          file.close()
    elif os.path.exists(ASUS_ARMORY_MCU_POWERSAVE_PATH):
        with open(ASUS_ARMORY_MCU_POWERSAVE_PATH, 'w') as file:
          file.write('1' if enabled else '0')
          file.close()
  except Exception as e:
    decky_plugin.logger.error(f"{__name__} mcu_powersave error {e}")

def supports_bios_wmi_tdp():
  tdp_methods = {"ppt_fppt", 'ppt_pl3_fppt', "ppt_pl2_sppt", "ppt_pl1_spl"}

  settings = bios_settings.get_bios_settings()
  filtered_data = [item for item in settings.get("BiosSettings") if item.get("Name") in tdp_methods]

  if len(filtered_data) == 3:
    return list(map(lambda x: x.get('Name'), filtered_data))

  return None

def supports_wmi_tdp():
  if bool(supports_bios_wmi_tdp()):
    return True

  if os.path.exists(FAST_WMI_PATH) and os.path.exists(SLOW_WMI_PATH) and os.path.exists(STAPM_WMI_PATH):
    return True
  elif (
    (
      os.path.exists(ASUS_ARMORY_FAST_WMI_PATH)
      or os.path.exists(UPDATED_ASUS_ARMORY_FAST_WMI_PATH)
    )
    and os.path.exists(ASUS_ARMORY_SLOW_WMI_PATH)
    and os.path.exists(ASUS_ARMORY_STAPM_WMI_PATH)
  ):
    return True
  return False

def set_platform_profile(tdp):
  command = 'quiet'
  if tdp < 13:
    command = 'quiet'
  elif tdp < 20:
    command = 'balanced'
  else:
    command = 'performance'
  try:
    with open(PLATFORM_PROFILE_PATH, 'w') as file:
      file.write(command)
  except Exception as e:
    decky_plugin.logger.error(f"{__name__} platform_profile error {e}")
        
  sleep(1.0)
  return True

def set_tdp(tdp):
  try:
    wmi_methods = supports_bios_wmi_tdp()
    if bool(wmi_methods):
      for wmi_method in wmi_methods:
        cmd = f'fwupdmgr set-bios-setting {wmi_method} {tdp}'
        subprocess.run(cmd, timeout=1, shell=True, check=True, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        sleep(0.1)
    elif (
      (
        os.path.exists(ASUS_ARMORY_FAST_WMI_PATH)
        or os.path.exists(UPDATED_ASUS_ARMORY_FAST_WMI_PATH)
      )
      and os.path.exists(ASUS_ARMORY_SLOW_WMI_PATH)
      and os.path.exists(ASUS_ARMORY_STAPM_WMI_PATH)
    ):
      # fast limit
      fast_limit_path = ASUS_ARMORY_FAST_WMI_PATH
      if (
        os.path.exists(UPDATED_ASUS_ARMORY_FAST_WMI_PATH)
      ):
        fast_limit_path = UPDATED_ASUS_ARMORY_FAST_WMI_PATH

      with open(fast_limit_path, 'w') as file:
        file.write(f'{tdp}')
      sleep(0.1)

      # slow limit
      with open(ASUS_ARMORY_SLOW_WMI_PATH, 'w') as file:
        file.write(f'{tdp}')
      sleep(0.1)

      # stapm limit
      with open(ASUS_ARMORY_STAPM_WMI_PATH, 'w') as file:
        file.write(f'{tdp}')
      sleep(0.1)

    else:
      # fast limit
      with open(FAST_WMI_PATH, 'w') as file:
        file.write(f'{tdp+2}')
      sleep(0.1)

      # slow limit
      with open(SLOW_WMI_PATH, 'w') as file:
        file.write(f'{tdp}')
      sleep(0.1)

      # stapm limit
      with open(STAPM_WMI_PATH, 'w') as file:
        file.write(f'{tdp}')
      sleep(0.1)
  except Exception as e:
    decky_plugin.logger.error(f"{__name__} asus wmi tdp error {e}")

def execute_bash_command(command, path):
  cmd = f"echo '{command}' | tee {path}"
  result = subprocess.run(cmd, timeout=1, shell=True, check=True, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
  return result

def is_bazzite_deck():
  IMAGE_INFO = "/usr/share/ublue-os/image-info.json"
  if os.path.exists(IMAGE_INFO):
    try:
      with open(IMAGE_INFO, 'r') as f:
        info = json.loads(f.read().strip())
        f.close()
        return info.get("image-name") == "bazzite-deck"
    except Exception as e:
      decky_plugin.logger.error(f'{__name__} error checking bazzite image {e}')
  return False

def supports_mcu_powersave():
  mc_path_exists = os.path.exists(LEGACY_MCU_POWERSAVE_PATH) or os.path.exists(ASUS_ARMORY_MCU_POWERSAVE_PATH)

  if mc_path_exists:
    # bazzite has it's own workaround for MCU
    if is_bazzite_deck():
      return True

    # check MCU version
    mc_version = get_mcu_version()

    if device_utils.is_rog_ally() and mc_version >= 319:
      return True
    if device_utils.is_rog_ally_x() and mc_version >= 314:
      return True

  return False

def get_mcu_version():
  command = "dmesg | grep -oP 'MCU version: \\K\\d+'"
  try:
    result = subprocess.run(command, shell=True, capture_output=True, text=True)

    version_str = str(result.stdout).strip()

    if (version_str == ''):
      return 0

    return int(version_str)
  except Exception as e:
    decky_plugin.logger.error(f'{__name__} error getting mcu version {e}')

    return 0
