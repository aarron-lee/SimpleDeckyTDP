import os
import shutil
import subprocess
import decky_plugin
from plugin_settings import get_nested_setting
from enum import Enum
from devices import rog_ally
import device_utils
import json

PLATFORM_PROFILE_PATH = '/sys/firmware/acpi/platform_profile'

class AdvancedOptionsType(Enum):
  BOOLEAN = 'boolean'
  NUMBER_RANGE = 'number_range'


class DefaultSettings(Enum):
  ENABLE_TDP_CONTROL = 'enableTdpControl'
  ENABLE_GPU_CONTROL = 'enableGpuControl'
  ENABLE_APU_SLOW_LIMIT = 'enableApuSlowLimit'
  ENABLE_STEAM_PATCH = 'steamPatch'
  ENABLE_POWER_CONTROL = 'enablePowercontrol'
  ENABLE_BACKGROUND_POLLING = 'enableBackgroundPolling'
  MAX_TDP_ON_RESUME = 'maxTdpOnResume'
  MAX_TDP_ON_GAME_PROFILE_CHANGE = 'maxTdpOnGameProfileChange'
  AC_POWER_PROFILES = 'acPowerProfiles'
  FORCE_DISABLE_TDP_ON_RESUME = 'forceDisableTdpOnResume'

class RogAllySettings(Enum):
  USE_PLATFORM_PROFILE = 'platformProfile'
  USE_WMI = 'useWmi'
  USE_EXTREME_POWERSAVE = 'useExtremePowersave'

class LegionGoSettings(Enum):
  CUSTOM_TDP_MODE = 'lenovoCustomTdpMode'

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

def modprobe_acpi_call():
  # legion go currently requires acpi_call for using WMI to set TDP
  # using WMI to set TDP is safer on the Legion Go, ryzenadj is dangerous on the LGO
  # there is upstream work to formally add the wmi calls to a /sys endpoint, but it's not available yet
  if device_utils.is_legion_go():
    os.system("modprobe acpi_call")
    result = subprocess.run(["modprobe", "acpi_call"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

    if result.stderr:
      decky_plugin.logger.error(f"modprobe_acpi_call error: {result.stderr}")
      return False
    return True
  return False

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

def get_number_value(setting, default_value):
  current_val = get_nested_setting(
    f'advanced.{setting.value}'
  )

  if isinstance(current_val, int):
    return current_val
  else:
    return default_value

def get_default_options():
  options = []

  # enable_steam_patch = {
  #   'name': 'Fix Steam Hardware Controls (Experimental)',
  #   'type': AdvancedOptionsType.BOOLEAN.value,
  #   'defaultValue': False,
  #   'description': 'Fixes Steam TDP Slider (and GPU Slider on some distros). Note, cannot be used with per-game AC profiles',
  #   'currentValue': get_value(DefaultSettings.ENABLE_STEAM_PATCH),
  #   'statePath': DefaultSettings.ENABLE_STEAM_PATCH.value
  # }

  # options.append(enable_steam_patch)

  enable_tdp_control = {
    'name': 'Enable TDP Controls',
    'type': AdvancedOptionsType.BOOLEAN.value,
    'defaultValue': True,
    'description': 'Enables TDP Sliders, and other advanced options',
    'currentValue': get_value(DefaultSettings.ENABLE_TDP_CONTROL, True),
    'statePath': DefaultSettings.ENABLE_TDP_CONTROL.value
  }

  options.append(enable_tdp_control)

  if not device_utils.is_intel():
    # GPU controls on AMD only
    enable_gpu_control = {
      'name': 'Enable GPU Controls',
      'type': AdvancedOptionsType.BOOLEAN.value,
      'defaultValue': True,
      'description': 'Enables GPU Slider',
      'currentValue': get_value(DefaultSettings.ENABLE_GPU_CONTROL, True),
      'statePath': DefaultSettings.ENABLE_GPU_CONTROL.value
    }

    options.append(enable_gpu_control)

  manual_cpu_controls_default = True if device_utils.is_intel() else False

  manual_cpu_controls = {
    'name': 'Enable manual CPU Controls',
    'type': AdvancedOptionsType.BOOLEAN.value,
    'defaultValue': manual_cpu_controls_default,
    'description': 'Enables manual CPU boost, SMT, Power Governor, and EPP controls',
    'currentValue': get_value(DefaultSettings.ENABLE_POWER_CONTROL, manual_cpu_controls_default),
    'statePath': DefaultSettings.ENABLE_POWER_CONTROL.value
  }

  options.append(manual_cpu_controls)

  ac_power_profiles = {
    'name': 'Enable per-game AC power TDP profiles',
    'type': AdvancedOptionsType.BOOLEAN.value,
    'defaultValue': False,
    'description': 'When plugged into AC power, use a separate per-game TDP profile. Per-game profiles must be enabled',
    'currentValue': get_value(DefaultSettings.AC_POWER_PROFILES, False),
    'statePath': DefaultSettings.AC_POWER_PROFILES.value
  }

  options.append(ac_power_profiles)

  enable_background_polling = {
    'name': 'Enable Background Polling',
    'type': AdvancedOptionsType.BOOLEAN.value,
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
    'type': AdvancedOptionsType.BOOLEAN.value,
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
    'type': AdvancedOptionsType.BOOLEAN.value,
    'defaultValue': True,
    'description': 'After resume from suspend, temporarily sets TDP to max value. This sometimes helps clear audio glitches',
    'currentValue': get_value(DefaultSettings.MAX_TDP_ON_RESUME, True),
    'statePath': DefaultSettings.MAX_TDP_ON_RESUME.value,
    'disabled': {
      'ifFalsy': [DefaultSettings.ENABLE_TDP_CONTROL.value]
    }
  }

  options.append(max_tdp_on_resume)


  if not device_utils.is_intel():
    # enable apu-slow-limit control
    enable_apu_slow_limit = {
      'name': 'Enable APU Slow Limit',
      'type': AdvancedOptionsType.BOOLEAN.value,
      'defaultValue': False,
      'description': 'Enables the --apu-slow-limit value for ryzenadj',
      'currentValue': get_value(DefaultSettings.ENABLE_APU_SLOW_LIMIT, False),
      'statePath': DefaultSettings.ENABLE_APU_SLOW_LIMIT.value
    }

    options.append(enable_apu_slow_limit)

    max_tdp_on_game_profile_change = {
      'name': 'Temp Max TDP Profile',
      'type': AdvancedOptionsType.NUMBER_RANGE.value,
      'range': [0, 20],
      'defaultValue': 0,
      'step': 1,
      'valueSuffix': 's',
      'description': 'When you start a game, temporarily sets TDP to max value for X seconds.',
      'currentValue': get_number_value(DefaultSettings.MAX_TDP_ON_GAME_PROFILE_CHANGE, 0),
      'statePath': DefaultSettings.MAX_TDP_ON_GAME_PROFILE_CHANGE.value,
      'disabled': {
        'ifFalsy': [DefaultSettings.ENABLE_TDP_CONTROL.value]
      }
    }

    options.append(max_tdp_on_game_profile_change)

  return options


def get_advanced_options():
  options = get_default_options()
  supports_acpi_call = modprobe_acpi_call()

  if device_utils.is_legion_go() and supports_acpi_call:
    options.append({
      'name': 'Lenovo Custom TDP Mode',
      'type': AdvancedOptionsType.BOOLEAN.value,
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
      'type': AdvancedOptionsType.BOOLEAN.value,
      'defaultValue': True,
      'currentValue': get_value(RogAllySettings.USE_PLATFORM_PROFILE, True),
      'statePath': RogAllySettings.USE_PLATFORM_PROFILE.value,
      'disabled': {
        'ifFalsy': [DefaultSettings.ENABLE_TDP_CONTROL.value]
      }
    })
  if rog_ally.supports_mcu_powersave() and is_bazzite_deck():
    options.append({
      'name': 'Enable Asus Extreme Powersave',
      'description': 'Reduces power consumption during suspend',
      'type': AdvancedOptionsType.BOOLEAN.value,
      'defaultValue': False,
      'currentValue': get_value(RogAllySettings.USE_EXTREME_POWERSAVE, False),
      'statePath': RogAllySettings.USE_EXTREME_POWERSAVE.value,
    })
  if rog_ally.supports_wmi_tdp():
    options.append({
      'name': 'Use Asus WMI for TDP',
      'type': AdvancedOptionsType.BOOLEAN.value,
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

def handle_advanced_option_change(new_values):
  if device_utils.is_rog_ally():
    if rog_ally.supports_mcu_powersave():
      powersave_enabled = new_values.get(RogAllySettings.USE_EXTREME_POWERSAVE.value, None)

      if isinstance(powersave_enabled, bool):
        rog_ally.set_mcu_powersave(powersave_enabled)