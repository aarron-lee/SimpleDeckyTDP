import os
import shutil
import subprocess
import file_timeout
import decky_plugin
from plugin_settings import get_nested_setting
from enum import Enum

ASUSCTL_PATH = shutil.which('asusctl')
PLATFORM_PROFILE_PATH = '/sys/firmware/acpi/platform_profile'

class Devices(Enum):
  LEGION_GO = "83E1"
  ROG_ALLY = "ROG Ally RC71L_RC71L"

class DefaultSettings(Enum):
  ENABLE_STEAM_PATCH = 'steamPatch'
  ENABLE_POWER_CONTROL = 'enablePowercontrol'
  ENABLE_BACKGROUND_POLLING = 'enableBackgroundPolling'

class RogAllySettings(Enum):
  USE_ASUSCTL = 'useAsusCtl'
  USE_PLATFORM_PROFILE = 'platformProfile'
  USE_WMI = 'useWmi'

class LegionGoSettings(Enum):
  CUSTOM_TDP_MODE = 'lenovoCustomTdpMode'

def modprobe_acpi_call():
  os.system("modprobe acpi_call")
  result = subprocess.run(["modprobe", "acpi_call"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

  if result.stderr:
    decky_plugin.logger.error(f"modprobe_acpi_call error: {result.stderr}")
    return False
  return True

# e.g. get_setting(LegionGoSettings.CUSTOM_TDP_MODE.value)
def get_setting(setting_name = ''):
  return get_nested_setting(f'advanced.{setting_name}')

def get_device_name():
  try:
    with file_timeout.time_limit(2):
      with open("/sys/devices/virtual/dmi/id/product_name", "r") as file:
        device_name = file.read().strip()
        file.close()

        return device_name
  except Exception as e:
    decky_plugin.logger.error(f'{__name__} error while trying to read device name')
    return ''

def get_value(setting, default_value = False):
  current_val = get_nested_setting(
    f'advanced.{setting.value}'
  )

  if isinstance(current_val, bool):
    return current_val
  else:
    return default_value

def get_default_options():
  options = []

  enable_steam_patch = {
    'name': 'Fix Steam Hardware Controls (Experimental)',
    'type': 'boolean',
    'defaultValue': False,
    'description': 'Fixes Steam TDP Slider (and GPU Slider on some distros)',
    'currentValue': get_value(DefaultSettings.ENABLE_STEAM_PATCH),
    'statePath': DefaultSettings.ENABLE_STEAM_PATCH.value
  }

  options.append(enable_steam_patch)

  enable_power_control = {
    'name': 'Enable CPU Controls',
    'type': 'boolean',
    'defaultValue': True,
    'description': 'Enables Power Governor and EPP controls',
    'currentValue': get_value(DefaultSettings.ENABLE_POWER_CONTROL, True),
    'statePath': DefaultSettings.ENABLE_POWER_CONTROL.value
  }

  options.append(enable_power_control)

  enable_background_polling = {
    'name': 'Enable Background Polling',
    'type': 'boolean',
    'defaultValue': False,
    'description': 'Polling will set TDP every few seconds',
    'currentValue': get_value(DefaultSettings.ENABLE_BACKGROUND_POLLING, False),
    'statePath': DefaultSettings.ENABLE_BACKGROUND_POLLING.value
  }

  options.append(enable_background_polling)

  return options


def get_advanced_options():
  options = get_default_options()
  device_name = get_device_name()
  supports_acpi_call = modprobe_acpi_call()

  if device_name == Devices.LEGION_GO.value and supports_acpi_call:
    options.append({
      'name': 'Lenovo Custom TDP Mode',
      'type': 'boolean',
      'description': 'Requires Bios with TDP fixes (Bios version N3CN29WW_TDP02 or newer)',
      'defaultValue': False,
      'currentValue': get_value(LegionGoSettings.CUSTOM_TDP_MODE),
      'statePath': LegionGoSettings.CUSTOM_TDP_MODE.value
    })
  if device_name == Devices.ROG_ALLY.value:
    rog_ally_advanced_options(options)


  return options

def rog_ally_advanced_options(options):
  if os.path.exists(PLATFORM_PROFILE_PATH):
    options.append({
      'name': 'Enable Asus Platform Profile management',
      'type': 'boolean',
      'defaultValue': True,
      'currentValue': get_value(RogAllySettings.USE_PLATFORM_PROFILE, True),
      'statePath': RogAllySettings.USE_PLATFORM_PROFILE.value
    })
  # if ASUSCTL_PATH:
  #   options.append({
  #     'name': 'Use asusctl for platform profile management',
  #     'type': 'boolean',
  #     'description': 'This is ignored if you disable platform profile management',
  #     'defaultValue': True,
  #     'currentValue': get_value(RogAllySettings.USE_ASUSCTL, True),
  #     'statePath': RogAllySettings.USE_ASUSCTL.value
  #   })
  # if supports_asus_wmi_tdp():
  #   options.append({
  #     'name': 'Use Asus WMI for TDP',
  #     'type': 'boolean',
  #     'description': 'Use Asus WMI calls instead of ryzenadj',
  #     'defaultValue': False,
  #     'currentValue': get_value(RogAllySettings.USE_WMI, False),
  #     'statePath': RogAllySettings.USE_WMI.value
  #   })

FAST_WMI_PATH ='/sys/devices/platform/asus-nb-wmi/ppt_fppt'
SLOW_WMI_PATH = '/sys/devices/platform/asus-nb-wmi/ppt_pl2_sppt'
STAPM_WMI_PATH = '/sys/devices/platform/asus-nb-wmi/ppt_pl1_spl'

def supports_asus_wmi_tdp():
  if os.path.exists(FAST_WMI_PATH) and os.path.exists(SLOW_WMI_PATH) and os.path.exists(STAPM_WMI_PATH):
    return True
  return False