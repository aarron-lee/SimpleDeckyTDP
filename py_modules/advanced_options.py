import os
import shutil
import subprocess
import file_timeout
import decky_plugin
from plugin_settings import get_nested_setting
from enum import Enum
from devices import rog_ally
import device_utils

ASUSCTL_PATH = shutil.which('asusctl')
PLATFORM_PROFILE_PATH = '/sys/firmware/acpi/platform_profile'


class DefaultSettings(Enum):
  ENABLE_TDP_CONTROL = 'enableTdpControl'
  ENABLE_GPU_CONTROL = 'enableGpuControl'
  ENABLE_STEAM_PATCH = 'steamPatch'
  ENABLE_POWER_CONTROL = 'enablePowercontrol'
  ENABLE_BACKGROUND_POLLING = 'enableBackgroundPolling'
  MAX_TDP_ON_RESUME = 'maxTdpOnResume'
  AC_POWER_PROFILES = 'acPowerProfiles'
  FORCE_DISABLE_TDP_ON_RESUME = 'forceDisableTdpOnResume'

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

  # enable_steam_patch = {
  #   'name': 'Fix Steam Hardware Controls (Experimental)',
  #   'type': 'boolean',
  #   'defaultValue': False,
  #   'description': 'Fixes Steam TDP Slider (and GPU Slider on some distros). Note, cannot be used with per-game AC profiles',
  #   'currentValue': get_value(DefaultSettings.ENABLE_STEAM_PATCH),
  #   'statePath': DefaultSettings.ENABLE_STEAM_PATCH.value
  # }

  # options.append(enable_steam_patch)

  enable_tdp_control = {
    'name': 'Enable TDP Controls',
    'type': 'boolean',
    'defaultValue': True,
    'description': 'Enables TDP Sliders, and other advanced options',
    'currentValue': get_value(DefaultSettings.ENABLE_TDP_CONTROL, True),
    'statePath': DefaultSettings.ENABLE_TDP_CONTROL.value
  }

  options.append(enable_tdp_control)

  enable_gpu_control = {
    'name': 'Enable GPU Controls',
    'type': 'boolean',
    'defaultValue': True,
    'description': 'Enables GPU Slider',
    'currentValue': get_value(DefaultSettings.ENABLE_GPU_CONTROL, True),
    'statePath': DefaultSettings.ENABLE_GPU_CONTROL.value
  }

  options.append(enable_gpu_control)

  ac_power_profiles = {
    'name': 'Enable per-game AC power TDP profiles',
    'type': 'boolean',
    'defaultValue': False,
    'description': 'When plugged into AC power, use a separate per-game TDP profile. Per-game profiles must be enabled',
    'currentValue': get_value(DefaultSettings.AC_POWER_PROFILES, False),
    'statePath': DefaultSettings.AC_POWER_PROFILES.value
  }

  options.append(ac_power_profiles)

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
    'statePath': DefaultSettings.ENABLE_BACKGROUND_POLLING.value,
    'disabled': {
      'ifFalsy': [DefaultSettings.ENABLE_TDP_CONTROL.value]
    }
  }

  options.append(enable_background_polling)

  force_disable_tdp_on_resume = {
    'name': 'Force Disable Setting TDP on Resume',
    'type': 'boolean',
    'defaultValue': False,
    'description': 'Disable automatically setting TDP, etc, on resume',
    'currentValue': get_value(DefaultSettings.FORCE_DISABLE_TDP_ON_RESUME, False),
    'statePath': DefaultSettings.FORCE_DISABLE_TDP_ON_RESUME.value,
    'disabled': {
      'ifFalsy': [DefaultSettings.ENABLE_TDP_CONTROL.value]
    }
  }

  options.append(force_disable_tdp_on_resume)

  max_tdp_on_resume = {
    'name': 'Temporarily Set Max TDP on Resume',
    'type': 'boolean',
    'defaultValue': True,
    'description': 'After resume from suspend, temporarily sets TDP to max value. This sometimes helps clear audio glitches',
    'currentValue': get_value(DefaultSettings.MAX_TDP_ON_RESUME, True),
    'statePath': DefaultSettings.MAX_TDP_ON_RESUME.value,
    'disabled': {
      'ifFalsy': [DefaultSettings.ENABLE_TDP_CONTROL.value]
    }
  }

  options.append(max_tdp_on_resume)

  return options


def get_advanced_options():
  options = get_default_options()
  supports_acpi_call = modprobe_acpi_call()

  if device_utils.is_legion_go() and supports_acpi_call:
    options.append({
      'name': 'Lenovo Custom TDP Mode',
      'type': 'boolean',
      'description': 'Use WMI for TDP control. Requires Bios with TDP fixes (Bios version v29.1 or newer)',
      'defaultValue': True,
      'currentValue': get_value(LegionGoSettings.CUSTOM_TDP_MODE, True),
      'statePath': LegionGoSettings.CUSTOM_TDP_MODE.value,
      'disabled': {
        'ifFalsy': [DefaultSettings.ENABLE_TDP_CONTROL.value]
      }
    })
  if device_utils.is_rog_ally():
    rog_ally_advanced_options(options)


  return options

def rog_ally_advanced_options(options):
  if os.path.exists(PLATFORM_PROFILE_PATH):
    options.append({
      'name': 'Enable Asus Platform Profile management',
      'type': 'boolean',
      'defaultValue': True,
      'currentValue': get_value(RogAllySettings.USE_PLATFORM_PROFILE, True),
      'statePath': RogAllySettings.USE_PLATFORM_PROFILE.value,
      'disabled': {
        'ifFalsy': [DefaultSettings.ENABLE_TDP_CONTROL.value]
      }
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
  if rog_ally.supports_wmi_tdp():
    options.append({
      'name': 'Use Asus WMI for TDP',
      'type': 'boolean',
      'description': 'Use Asus WMI calls instead of ryzenadj',
      'defaultValue': True,
      'currentValue': get_value(RogAllySettings.USE_WMI, True),
      'statePath': RogAllySettings.USE_WMI.value,
      'disabled': {
        'ifFalsy': [DefaultSettings.ENABLE_TDP_CONTROL.value]
      }
    })

def tdp_control_enabled():
  return get_setting(DefaultSettings.ENABLE_TDP_CONTROL.value)

def gpu_control_enabled():
  return get_setting(DefaultSettings.ENABLE_GPU_CONTROL.value)