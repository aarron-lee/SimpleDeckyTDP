import subprocess
import shutil
from time import sleep
import os
import decky_plugin
import bios_settings
import json
import device_utils

PLATFORM_PROFILE_PATH  = '/sys/firmware/acpi/platform_profile'

CHARGE_LIMIT_PATH = '/sys/class/power_supply/BAT0/charge_control_end_threshold'

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

PLATFORM_PROFILE_CHOICES_PATH = '/sys/firmware/acpi/platform_profile_choices'

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
  if bios_settings.has_fwupdmgr() == False:
    return False

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
  platform_profile_choices = get_platform_profile_options()

  command = platform_profile_choices[0]
  if tdp < 13:
    command = platform_profile_choices[0]
  elif tdp < 20:
    command =  platform_profile_choices[1]
  else:
    command =  platform_profile_choices[2]
  try:
    with open(PLATFORM_PROFILE_PATH, 'w') as file:
      file.write(command)
  except Exception as e:
    decky_plugin.logger.error(f"{__name__} platform_profile {command} error {e}")
        
  sleep(1.0)
  return True

def set_tdp(tdp):
  try:
    if (
      (
        os.path.exists(ASUS_ARMORY_FAST_WMI_PATH)
        or os.path.exists(UPDATED_ASUS_ARMORY_FAST_WMI_PATH)
      )
      and os.path.exists(ASUS_ARMORY_SLOW_WMI_PATH)
      and os.path.exists(ASUS_ARMORY_STAPM_WMI_PATH)
    ):
      set_tdp_via_asus_armoury(tdp)
    elif bool(supports_bios_wmi_tdp()):
      set_tdp_via_fwupdmgr(tdp)
    else:
      decky_plugin.logger.info(f"{__name__} Setting TDP {tdp} via Legacy WMI")
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
    decky_plugin.logger.error(f"{__name__} asus wmi tdp {tdp} error {e}")

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

def set_tdp_via_fwupdmgr(tdp):
  wmi_methods = supports_bios_wmi_tdp()

  if not wmi_methods:
    return False

  fast_tdp, slow_tdp, stapm_tdp = get_asus_armoury_tdp_values(tdp)

  decky_plugin.logger.info(f"{__name__} Setting TDP via fwupdmgr WMI - fast {fast_tdp} slow {slow_tdp} stapm {stapm_tdp}")

  methods_to_tdp = {
    'ppt_pl3_fppt': fast_tdp,
    'ppt_fppt': fast_tdp,
    'ppt_pl2_sppt': slow_tdp,
    'ppt_pl1_spl': stapm_tdp
  }

  for wmi_method in wmi_methods:
    wmi_method_tdp = methods_to_tdp.get(wmi_method, tdp)
    decky_plugin.logger.info(f'set fwupdmgr tdp {wmi_method} {wmi_method_tdp}')
    cmd = f'sudo fwupdmgr set-bios-setting {wmi_method} {wmi_method_tdp}'
    subprocess.run(cmd, timeout=1, shell=True, check=True, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    sleep(0.1)


def set_tdp_via_asus_armoury(tdp):
  # fast limit
  fast_limit_path = ASUS_ARMORY_FAST_WMI_PATH
  if (
    os.path.exists(UPDATED_ASUS_ARMORY_FAST_WMI_PATH)
  ):
    fast_limit_path = UPDATED_ASUS_ARMORY_FAST_WMI_PATH

  fast_tdp, slow_tdp, stapm_tdp = get_asus_armoury_tdp_values(tdp)

  decky_plugin.logger.info(f"{__name__} Setting TDP via Asus Armoury WMI - fast {fast_tdp} slow {slow_tdp} stapm {stapm_tdp}")

  with open(fast_limit_path, 'w') as file:
    file.write(f'{fast_tdp}')
  sleep(0.1)

  # slow limit
  with open(ASUS_ARMORY_SLOW_WMI_PATH, 'w') as file:
    file.write(f'{slow_tdp}')
  sleep(0.1)

  # stapm limit
  with open(ASUS_ARMORY_STAPM_WMI_PATH, 'w') as file:
    file.write(f'{stapm_tdp}')
  sleep(0.1)

def get_asus_armoury_tdp_values(tdp):
  fast_tdp = tdp
  slow_tdp = tdp
  stapm_tdp = tdp

  platform_profile_choices = get_platform_profile_options()

  if 'low-power' in platform_profile_choices:
    # newer asus armoury enforces different min/max values
    if fast_tdp < 15:
      fast_tdp = 15
    if slow_tdp < 15:
      slow_tdp = 15
    if stapm_tdp < 7:
      stapm_tdp = 7

    if fast_tdp > 53:
      fast_tdp = 53
    if slow_tdp > 43:
      slow_tdp = 43
    if stapm_tdp > 30:
      stapm_tdp = 30
  
  return [fast_tdp, slow_tdp, stapm_tdp]

def get_platform_profile_options():
  try:
    if os.path.exists(PLATFORM_PROFILE_CHOICES_PATH):
      with open(PLATFORM_PROFILE_CHOICES_PATH, 'r') as file:
        available_options = file.read().strip().split(' ') or []
        file.close()
        return available_options
  except Exception as e:
    decky_plugin.logger.error(f'error getting platform_profile_choices {e}')
  return []

def supports_charge_limit():
  return os.path.exists(CHARGE_LIMIT_PATH)

def set_charge_limit(limit: int):
  try:
    if os.path.exists(CHARGE_LIMIT_PATH):
      decky_plugin.logger.info(f"Setting charge limit to {limit} %.")
      with open(
          CHARGE_LIMIT_PATH, "w"
      ) as f:
          f.write(f"{limit}\n")
          f.close()
      return True
    else:
      decky_plugin.logger.info(f'{__name__} rog_ally charge limit path doesnt exist')
      return False
  except Exception as e:
      decky_plugin.logger.error(f"Failed to write charge limit with error:\n{e}")
      return False

def get_current_charge_limit():
  try:
    if os.path.exists(CHARGE_LIMIT_PATH):
      with open(
          CHARGE_LIMIT_PATH, "r"
      ) as f:
          limit = int(f.read().strip())
          decky_plugin.logger.info(f"current charge limit {limit}%")
          f.close()
          return limit
      return None
    else:
      decky_plugin.logger.info(f'{__name__} rog_ally charge limit path doesnt exist')
      return None
  except Exception as e:
      decky_plugin.logger.error(f"Failed to get charge limit with error:\n{e}")
      return None