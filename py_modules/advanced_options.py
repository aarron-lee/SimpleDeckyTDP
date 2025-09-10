import os
import decky_plugin
from plugin_settings import get_nested_setting, get_saved_settings
from enum import Enum
from devices import rog_ally, lenovo
import device_utils
import ryzenadj
import charge_limit
from plugin_enums import ServerAPIMethods

PLATFORM_PROFILE_PATH = '/sys/firmware/acpi/platform_profile'

class AdvancedOptionsType(Enum):
  BOOLEAN = 'boolean'
  NUMBER_RANGE = 'number_range'
  BUTTON = 'button'

class DefaultSettings(Enum):
  ENABLE_TDP_CONTROL = 'enableTdpControl'
  ENABLE_GPU_CONTROL = 'enableGpuControl'
  ENABLE_APU_SLOW_LIMIT = 'enableApuSlowLimit'
  ENABLE_RYZENADJ_UNDERVOLT = 'enableRyzenadjUndervolt'
  RYZENADJ_UNDERVOLT = 'ryzenadjUndervolt'
  ENABLE_POWER_CONTROL = 'enablePowercontrol'
  ENABLE_BACKGROUND_POLLING = 'enableBackgroundPolling'
  ENABLE_AUTOMATIC_CPU_MANAGEMENT = 'enableAutomaticEppManagement'
  MAX_TDP_ON_RESUME = 'maxTdpOnResume'
  MAX_TDP_ON_GAME_PROFILE_CHANGE = 'maxTdpOnGameProfileChange'
  AC_POWER_PROFILES = 'acPowerProfiles'
  FORCE_DISABLE_TDP_ON_RESUME = 'forceDisableTdpOnResume'
  FORCE_DISABLE_SUSPEND_ACTIONS = 'forceDisableSuspendActions'
  ENABLE_CHARGE_LIMIT = 'enableChargeLimit'
  CHARGE_LIMIT = 'chargeLimit'
  ENABLE_SIMPLE_EPP_LABELS = 'enableSimpleEppLabels'

class RogAllySettings(Enum):
  USE_PLATFORM_PROFILE = 'platformProfile'
  USE_EXTREME_POWERSAVE = 'useExtremePowersave'
  USE_WMI = 'useWmi'

class LegionGoSettings(Enum):
  CUSTOM_TDP_MODE = 'lenovoCustomTdpMode'

class SteamDeckSettings(Enum):
  DECK_CUSTOM_TDP_LIMITS = 'deckCustomTdpLimits'
  DECK_CUSTOM_GPU_MAX_ENABLED = 'deckCustomGpuMaxEnabled'
  DECK_CUSTOM_GPU_MAX = 'deckCustomGpuMax'

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

  manual_cpu_controls = {
    'name': 'Enable manual CPU Controls',
    'type': AdvancedOptionsType.BOOLEAN.value,
    'defaultValue': True,
    'description': 'Enables manual CPU boost, SMT, Power Governor, and EPP controls',
    'currentValue': get_value(DefaultSettings.ENABLE_POWER_CONTROL, True),
    'statePath': DefaultSettings.ENABLE_POWER_CONTROL.value
  }

  options.append(manual_cpu_controls)

  if not device_utils.is_intel():
    simple_epp_labels = {
      'name': 'Enable simple Governor + Epp Labels',
      'type': AdvancedOptionsType.BOOLEAN.value,
      'defaultValue': True,
      'description': 'Enables more intuitive labels for EPP and Power Governor',
      'currentValue': get_value(DefaultSettings.ENABLE_SIMPLE_EPP_LABELS, True),
      'statePath': DefaultSettings.ENABLE_SIMPLE_EPP_LABELS.value,
      'disabled': {
        'ifFalsy': [DefaultSettings.ENABLE_POWER_CONTROL.value],
        'hideIfDisabled': True
      }
    }

    options.append(simple_epp_labels)

  enable_automatic_cpu_management = {
    'name': 'Enable Automatic CPU management',
    'type': AdvancedOptionsType.BOOLEAN.value,
    'defaultValue': False,
    'description': 'Enables automatic management of CPU Boost, EPP, SMT, and Governor',
    'currentValue': get_value(DefaultSettings.ENABLE_AUTOMATIC_CPU_MANAGEMENT, False),
    'statePath': DefaultSettings.ENABLE_AUTOMATIC_CPU_MANAGEMENT.value,
    'disabled': {
      'ifTruthy': [DefaultSettings.ENABLE_POWER_CONTROL.value],
      'hideIfDisabled': True
    }
  }

  options.append(enable_automatic_cpu_management)

  ac_power_profiles = {
    'name': 'Enable per-game AC power TDP profiles',
    'type': AdvancedOptionsType.BOOLEAN.value,
    'defaultValue': False,
    'description': 'When plugged into AC power, use a separate per-game TDP profile. Per-game profiles must be enabled',
    'currentValue': get_value(DefaultSettings.AC_POWER_PROFILES, False),
    'statePath': DefaultSettings.AC_POWER_PROFILES.value
  }

  options.append(ac_power_profiles)

  if charge_limit.supports_charge_limit():
    range, default_value, step = charge_limit.get_range_info()

    options.append({
      'name': 'Enable Battery Charge Limit',
      'type': AdvancedOptionsType.BOOLEAN.value,
      'defaultValue': False,
      'currentValue': get_value(DefaultSettings.ENABLE_CHARGE_LIMIT, False),
      'statePath': DefaultSettings.ENABLE_CHARGE_LIMIT.value
    })

    set_charge_limit_option = {
      'name': 'Set Battery Charge Limit',
      'type': AdvancedOptionsType.NUMBER_RANGE.value,
      'range': range,
      'defaultValue': default_value,
      'step': step,
      'valueSuffix': '%',
      'description': 'Sets max battery limit',
      'currentValue': get_number_value(DefaultSettings.CHARGE_LIMIT, default_value),
      'statePath': DefaultSettings.CHARGE_LIMIT.value,
      'disabled': {
        'ifFalsy': [DefaultSettings.ENABLE_CHARGE_LIMIT.value],
        'hideIfDisabled': True
      }
    }

    options.append(set_charge_limit_option)

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

  force_disable_suspend_actions = {
    'name': 'Force Disable Any Suspend actions',
    'type': AdvancedOptionsType.BOOLEAN.value,
    'defaultValue': False,
    'description': 'Disable any suspend-related changes, etc, when you suspend your device',
    'currentValue': get_value(DefaultSettings.FORCE_DISABLE_SUSPEND_ACTIONS, False),
    'statePath': DefaultSettings.FORCE_DISABLE_SUSPEND_ACTIONS.value,
    'disabled': {
      'ifFalsy': [DefaultSettings.ENABLE_TDP_CONTROL.value]
    }
  }

  options.append(force_disable_suspend_actions)

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
      'statePath': DefaultSettings.ENABLE_APU_SLOW_LIMIT.value,
      'disabled': {
          'ifTruthy': [RogAllySettings.USE_WMI.value, LegionGoSettings.CUSTOM_TDP_MODE.value],
          'hideIfDisabled': True
      }
    }

    options.append(enable_apu_slow_limit)

    try:
      settings = get_saved_settings()
      if settings.get('supportsRyzenadjCoall', False):
        enable_ryzenadj_undervolt = {
          'name': '(Experimental) Enable undervolting via ryzenadj',
          'type': AdvancedOptionsType.BOOLEAN.value,
          'defaultValue': False,
          'description': 'Enables the --set-coall value for ryzenadj',
          'currentValue': get_value(DefaultSettings.ENABLE_RYZENADJ_UNDERVOLT, False),
          'statePath': DefaultSettings.ENABLE_RYZENADJ_UNDERVOLT.value,
          'disabled': {
            'ifTruthy': [RogAllySettings.USE_WMI.value, LegionGoSettings.CUSTOM_TDP_MODE.value],
            'hideIfDisabled': True
          }
        }

        options.append(enable_ryzenadj_undervolt)

        ryzenadj_undervolt_slider = {
          'name': 'Ryzenadj undervolt',
          'type': AdvancedOptionsType.NUMBER_RANGE.value,
          'range': [0, 30],
          'defaultValue': 0,
          'step': 1,
          'valueSuffix': '',
          'description': 'Warning, use carefully. Value for the ryzenadj --set-coall flag',
          'currentValue': get_number_value(DefaultSettings.RYZENADJ_UNDERVOLT, 0),
          'statePath': DefaultSettings.RYZENADJ_UNDERVOLT.value,
          'disabled': {
            'ifFalsy': [DefaultSettings.ENABLE_RYZENADJ_UNDERVOLT.value],
            'hideIfDisabled': True
          }
        }

        options.append(ryzenadj_undervolt_slider)
    except Exception as e:
      decky_plugin.logger.error(f"{__name__} error while checking for ryzenadj undervolt {e}")

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

  options.append({
    'name': 'Reset Plugin Settings',
    'type': AdvancedOptionsType.BUTTON.value,
    'serverApiMethod': ServerAPIMethods.RESET_SETTINGS.value
  })

  return options


def get_advanced_options():
  options = get_default_options()

  if device_utils.is_legion_go() and lenovo.supports_wmi_tdp():
    options.append({
      'name': 'Lenovo Custom TDP Mode',
      'type': AdvancedOptionsType.BOOLEAN.value,
      'description': 'Use WMI for TDP control.',
      'defaultValue': True,
      'currentValue': get_value(LegionGoSettings.CUSTOM_TDP_MODE, True),
      'statePath': LegionGoSettings.CUSTOM_TDP_MODE.value,
      'disabled': {
        'ifFalsy': [DefaultSettings.ENABLE_TDP_CONTROL.value]
      }
    })
  if device_utils.is_rog_ally() or device_utils.is_rog_ally_x():
    rog_ally_advanced_options(options)
  if device_utils.is_steam_deck():
    steam_deck_advanced_options(options)

  return options

def steam_deck_advanced_options(options):
  options.append({
    'name': 'Enable TDP slider min/max adjustment',
    'type': AdvancedOptionsType.BOOLEAN.value,
    'description': 'Warning, this needs a custom bios on the Steam Deck',
    'defaultValue': False,
    'currentValue': get_value(SteamDeckSettings.DECK_CUSTOM_TDP_LIMITS, False),
    'statePath': SteamDeckSettings.DECK_CUSTOM_TDP_LIMITS.value,
    'disabled': {
      'ifFalsy': [DefaultSettings.ENABLE_TDP_CONTROL.value],
      "hideIfDisabled": True
    }
  })

  enable_deck_custom_gpu_clock = {
    'name': 'Enable custom GPU Max Clock',
    'type': AdvancedOptionsType.BOOLEAN.value,
    'defaultValue': False,
    'description': 'Warning, this needs a custom bios on the Steam Deck',
    'currentValue': get_value(SteamDeckSettings.DECK_CUSTOM_GPU_MAX_ENABLED, False),
    'statePath': SteamDeckSettings.DECK_CUSTOM_GPU_MAX_ENABLED.value,
    'disabled': {
      'ifFalsy': [DefaultSettings.ENABLE_GPU_CONTROL.value],
      'hideIfDisabled': True
    }
  }

  options.append(enable_deck_custom_gpu_clock)

  custom_gpu_clock = {
    'name': 'Custom GPU Max Clock',
    'type': AdvancedOptionsType.NUMBER_RANGE.value,
    'range': [1600, 2200],
    'defaultValue': 1600,
    'step': 50,
    'valueSuffix': 'MHz',
    'description': 'Requires Custom Bios',
    'currentValue': get_number_value(SteamDeckSettings.DECK_CUSTOM_GPU_MAX, 1600),
    'statePath': SteamDeckSettings.DECK_CUSTOM_GPU_MAX.value,
    'disabled': {
      'ifFalsy': [SteamDeckSettings.DECK_CUSTOM_GPU_MAX_ENABLED.value],
      'hideIfDisabled': True
    }
  }

  options.append(custom_gpu_clock)

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
  if rog_ally.supports_mcu_powersave():
    options.append({
      'name': 'Enable Asus extreme Powersave',
      'description': 'Reduces power consumption during suspend. WARNING, this requires updated MCU firmware and updated Asus-Linux kernel modules',
      'type': AdvancedOptionsType.BOOLEAN.value,
      'defaultValue': True,
      'currentValue': get_value(RogAllySettings.USE_EXTREME_POWERSAVE, True),
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
  if device_utils.is_rog_ally() or device_utils.is_rog_ally_x():
    if rog_ally.supports_mcu_powersave():
      powersave_enabled = new_values.get(RogAllySettings.USE_EXTREME_POWERSAVE.value, None)

      if isinstance(powersave_enabled, bool):
        rog_ally.set_mcu_powersave(powersave_enabled)
    if charge_limit.supports_charge_limit():
      new_charge_limit = new_values.get(DefaultSettings.CHARGE_LIMIT.value, None)
      if (isinstance(new_charge_limit, int)
        and new_charge_limit >= charge_limit.charge_limit_min()
        and new_charge_limit != charge_limit.get_current_charge_limit()
      ):
        charge_limit.set_charge_limit(new_charge_limit)

  new_undervolt_value = new_values.get(DefaultSettings.RYZENADJ_UNDERVOLT.value, 0)
  if (
      new_values.get(DefaultSettings.ENABLE_RYZENADJ_UNDERVOLT.value, False)
      and new_undervolt_value >= 0
    ):
    ryzenadj._set_ryzenadj_undervolt(new_undervolt_value)
