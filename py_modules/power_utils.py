import os
import glob
from time import sleep
import decky_plugin
import subprocess
import advanced_options
import file_timeout
from enum import Enum
import cpu_utils

# ENERGY_PERFORMANCE_PREFERENCE_PATH
EPP_PATH ='/sys/devices/system/cpu/cpu*/cpufreq/energy_performance_preference'
EPP_OPTION_PATHS = glob.glob('/sys/devices/system/cpu/cpu*/cpufreq/energy_performance_available_preferences')
EPP_DEVICES = glob.glob(EPP_PATH)

POWER_GOVERNOR_PATH = '/sys/devices/system/cpu/cpu*/cpufreq/scaling_governor'
POWER_GOVERNOR_OPTION_PATHS = glob.glob('/sys/devices/system/cpu/cpu*/cpufreq/scaling_available_governors')
POWER_GOVERNOR_DEVICES = glob.glob(POWER_GOVERNOR_PATH)

class PowerGovernorOptions(Enum):
  POWER_SAVE = 'powersave'
  BALANCED = 'schedutil'
  PERFORMANCE = 'performance'

class EppOptions(Enum):
  PERFORMANCE = 'performance'
  BALANCE_PERFORMANCE = 'balance_performance'
  BALANCE_POWER = 'balance_power'
  POWER_SAVE = 'power'

RECOMMENDED_DEFAULTS = {
  'amd-pstate-epp': {
    'epp': EppOptions.PERFORMANCE.value,
    'powerGovernor': PowerGovernorOptions.POWER_SAVE.value
  },
  'amd-pstate': {
    'powerGovernor': PowerGovernorOptions.POWER_SAVE.value
  },
  'acpi-cpufreq': {
    'powerGovernor': PowerGovernorOptions.POWER_SAVE.value
  }
}

def set_power_governor(governor_option):
  try:
    option = PowerGovernorOptions(governor_option).value

    if len(POWER_GOVERNOR_DEVICES) > 0:
      # return execute_bash_command(option, POWER_GOVERNOR_PATH)
      return execute_bash_command(option, POWER_GOVERNOR_DEVICES)
  except Exception as e:
    decky_plugin.logger.error(f'{__name__} error setting power governor {e}')

def get_available_epp_options():
  try:
    if len(EPP_OPTION_PATHS) > 0:
      path = EPP_OPTION_PATHS[0]
      if os.path.exists(path):
        with open(path, 'r') as file:
          available_options = file.read().strip().split(' ') or []
          available_options.reverse()
          if available_options and 'default' in available_options:
            available_options.remove('default')
          file.close()
          # available_options.remove('default')
          return available_options
  except Exception as e:
    decky_plugin.logger.error(f'{__name__} error getting epp options {e}')

  return []

def get_available_governor_options():
  try:
    if not power_controls_enabled():
      return
    if len(POWER_GOVERNOR_OPTION_PATHS) > 0:
      path = POWER_GOVERNOR_OPTION_PATHS[0]
      if os.path.exists(path):
        with open(path, 'r') as file:
          available_options = file.read().strip().split(' ') or []
          available_options.reverse()
          file.close()
          return available_options
  except Exception as e:
    decky_plugin.logger.error(f'{__name__} error getting power governor options {e}')

  return []

def set_epp(epp_option):
  try:
    if not power_controls_enabled():
      return
    if epp_option not in get_available_epp_options():
      return
    if len(EPP_DEVICES) > 0:
      # return execute_bash_command(epp_option, EPP_PATH)
      return execute_bash_command(epp_option, EPP_DEVICES)

  except Exception as e:
    decky_plugin.logger.error(f'{__name__} error setting epp {e}')

def execute_bash_command(command, paths):
  with file_timeout.time_limit(2):
    for p in paths:
      try:
        with open(p, 'w') as file:
          file.write(f'{command}')
          file.close()
      except OSError as e:
        if e.errno == 16:
          # Handle the [Errno 16] Device or resource busy error
          decky_plugin.logger.error(f'Error: {str(e)}. The device or resource is busy.')
        continue
      except Exception as e:
        decky_plugin.logger.error(e)
        continue

def power_controls_enabled():
  with file_timeout.time_limit(1):
    return advanced_options.get_setting(
      advanced_options.DefaultSettings.ENABLE_POWER_CONTROL.value
    )
