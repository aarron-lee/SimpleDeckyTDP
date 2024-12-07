from enum import Enum
import os
import re
import subprocess
import shutil
import decky_plugin
import file_timeout
import advanced_options
from time import sleep
from advanced_options import LegionGoSettings, RogAllySettings
from devices import legion_go, rog_ally
import device_utils

RYZENADJ_PATH = None
if not device_utils.is_intel():
  RYZENADJ_PATH = shutil.which('ryzenadj')
AMD_PSTATE_PATH="/sys/devices/system/cpu/amd_pstate/status"

INTEL_PSTATE_PATH="/sys/devices/system/cpu/intel_pstate/status"
INTEL_CPU_BOOST_PATH = '/sys/devices/system/cpu/intel_pstate/no_turbo'

SMT_PATH= "/sys/devices/system/cpu/smt/control"

INTEL_TDP_PATH = None
INTEL_TDP_PREFIX="/sys/devices/virtual/powercap/intel-rapl-mmio/intel-rapl-mmio:0"
INTEL_LEGACY_TDP_PREFIX="/sys/devices/virtual/powercap/intel-rapl/intel-rapl:0"

class ScalingDrivers(Enum):
  INTEL_CPUFREQ = "intel_cpufreq"
  INTEL_PSTATE = "intel_pstate"
  PSTATE_EPP = "amd-pstate-epp"
  PSTATE = "amd-pstate"
  ACPI_CPUFREQ = "acpi-cpufreq"

def use_legacy_intel_tdp():

  if os.path.exists(INTEL_TDP_PREFIX):
    return False
  elif os.path.exists(INTEL_LEGACY_TDP_PREFIX):
    return True

  decky_plugin.logger.info("Warning: /sys endpoint for intel tdp not found")
  return False

def intel_tdp_path():
  global INTEL_TDP_PATH

  if INTEL_TDP_PATH:
    return INTEL_TDP_PATH

  if use_legacy_intel_tdp():
    INTEL_TDP_PATH = f'{INTEL_LEGACY_TDP_PREFIX}/constraint_*_power_limit_uw'
  else:
    INTEL_TDP_PATH = f'{INTEL_TDP_PREFIX}/constraint_*_power_limit_uw'

  return INTEL_TDP_PATH

def set_tdp(tdp: int):
  if not advanced_options.tdp_control_enabled():
    return

  if device_utils.is_intel():
    tdp_path = intel_tdp_path()

    if not tdp_path:
      # TDP not supported on this intel chipset, no known path to set TDP
      decky_plugin.logger.info("No Known Path for to set TDP on this Intel chipset")
      return

    tdp_microwatts = tdp * 1000000
    try:
      cmd = f"echo '{tdp_microwatts}' | sudo tee {tdp_path}"
      result = subprocess.run(cmd, shell=True, check=True, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
      return result
    except Exception as e:
      decky_plugin.logger.error(f'{__name__} Error: set_tdp intel {e}')
  else:
    return set_amd_tdp(tdp)

def set_amd_tdp(tdp: int):
  try:
    with file_timeout.time_limit(4):
      if device_utils.is_legion_go() and advanced_options.get_setting(
        LegionGoSettings.CUSTOM_TDP_MODE.value
      ):
        return legion_go.set_tdp(tdp)
      elif device_utils.is_rog_ally():
        if advanced_options.get_setting(RogAllySettings.USE_PLATFORM_PROFILE.value):
          rog_ally.set_platform_profile(tdp)
        if advanced_options.get_setting(RogAllySettings.USE_WMI.value) and rog_ally.supports_wmi_tdp():
          return rog_ally.set_tdp(tdp)

    tdp = tdp*1000

    if RYZENADJ_PATH:
      commands = [
        RYZENADJ_PATH,
        '--stapm-limit', f"{tdp}",
        '--fast-limit', f"{tdp}",
        '--slow-limit', f"{tdp}",
        '--tctl-temp', f"95",
        '--apu-skin-temp', f"95",
        '--dgpu-skin-temp', f"95"
      ]

      if advanced_options.get_setting(
        advanced_options.DefaultSettings.ENABLE_APU_SLOW_LIMIT.value
      ):
        commands.append('--apu-slow-limit')
        commands.append(f"{tdp}")

      decky_plugin.logger.info(f'setting TDP via ryzenadj with args {commands}')

      results = subprocess.call(commands)
      return results
  except Exception as e:
    decky_plugin.logger.error(e)

def get_cpb_boost_paths():
  cpu_nums = get_online_cpus()

  cpb_cpu_boost_paths = list(map(
    lambda cpu_num: f'/sys/devices/system/cpu/cpufreq/policy{cpu_num}/boost',
    cpu_nums
  ))

  return cpb_cpu_boost_paths

def set_cpb_boost(enabled):
  if device_utils.is_intel():
    if os.path.exists(INTEL_CPU_BOOST_PATH):
      try:
        with open(INTEL_CPU_BOOST_PATH, 'w') as file:
          # sys endpoint is named 'no_turbo'
          # so no_turbo == 0 == cpu boost on
          # no_turbo == 1 == cpu boost off
          file.write("0" if enabled else "1")
          file.close()
          sleep(0.1)
      except Exception as e:
        decky_plugin.logger.error(e)
  else:
    # AMD CPU boost global cpb boost toggle doesn't exist, fallback to setting it per-cpu
    paths = get_cpb_boost_paths()
    try:
      with file_timeout.time_limit(4):
        for p in paths:
          try:
            with open(p, 'w') as file:
              file.write("1" if enabled else "0")
              file.close()
              sleep(0.1)
          except Exception as e:
            decky_plugin.logger.error(e)
            continue
    except Exception as e:
      decky_plugin.logger.error(e)

def supports_cpu_boost():
  try:
    with file_timeout.time_limit(4):
      cpu_boost_paths = get_cpb_boost_paths()
      if len(cpu_boost_paths) > 0 and os.path.exists(cpu_boost_paths[0]):
        return True
      if os.path.exists(INTEL_CPU_BOOST_PATH):
        return True
  except Exception as e:
    decky_plugin.logger.error(e)

  return False

def set_cpu_boost(enabled = True):
  try:
    with file_timeout.time_limit(3):
      set_cpb_boost(enabled)
  except Exception as e:
    decky_plugin.logger.error(e)
    return False

def supports_smt():
  if os.path.exists(SMT_PATH):
    return True

  return False

def set_smt(enabled = True):
  try:
    # SMT_PATH is identical for both AMD and Intel
    if os.path.exists(SMT_PATH):
      with open(SMT_PATH, 'w') as file:
        if enabled:
          file.write('on')
        else:
          file.write('off')
        file.close()

    return True
  except Exception as e:
    decky_plugin.logger.error(e)
    return False

def get_pstate_status():
  try:
    if os.path.exists(AMD_PSTATE_PATH):
      with open(AMD_PSTATE_PATH, 'r') as file:
        pstate = file.read()
        file.close()
        return pstate.strip()
    if os.path.exists(INTEL_PSTATE_PATH):
      with open(INTEL_PSTATE_PATH, 'r') as file:
        pstate = file.read()
        file.close()
        return pstate.strip()
  except Exception as e:
    decky_plugin.logger.error(f'{__name__} get_pstate_status {e}')
    return False
  return None

def set_pstate_active():
  if os.path.exists(AMD_PSTATE_PATH):
    with open(AMD_PSTATE_PATH, 'w') as file:
      file.write('active')
      file.close()
  if os.path.exists(INTEL_PSTATE_PATH):
    with open(INTEL_PSTATE_PATH, 'w') as file:
      file.write('active')
      file.close()

def get_online_cpus():
  try:
    with open('/sys/devices/system/cpu/online', 'r') as file:
      online_cpus = file.read().strip()
      file.close()
      # example online_cpus:
      # 0-2,3,4,5,6-8,10
      # 0-15
      # 0-1,3-15
      parts = online_cpus.split(',')

      result = []
      for part in parts:
        if '-' in part:
          # Handle range
          start, end = map(int, part.split('-'))
          result.extend(range(start, end + 1))
        else:
          # Handle single value
          result.append(int(part))
      return result
  except Exception as e:
    decky_plugin.logger.error(f'{__name__} error while getting online_cpus {e}')

  # cpu 0 is always online
  return [0]


def get_epp_paths():
  cpu_nums = get_online_cpus()

  epp_paths = list(map(
    lambda cpu_num: f'/sys/devices/system/cpu/cpu{cpu_num}/cpufreq/energy_performance_preference',
    cpu_nums
  ))

  return epp_paths

def get_epp_option_paths():
  cpu_nums = get_online_cpus()

  epp_options_paths = list(map(
    lambda cpu_num: f'/sys/devices/system/cpu/cpu{cpu_num}/cpufreq/energy_performance_available_preferences',
    cpu_nums
  ))

  return epp_options_paths

def get_power_governor_paths():
  cpu_nums = get_online_cpus()

  power_governor_paths = list(map(
    lambda cpu_num: f'/sys/devices/system/cpu/cpu{cpu_num}/cpufreq/scaling_governor',
    cpu_nums
  ))

  return power_governor_paths

def get_power_governor_option_paths():
  cpu_nums = get_online_cpus()

  power_governor_option_paths = list(map(
    lambda cpu_num: f'/sys/devices/system/cpu/cpu{cpu_num}/cpufreq/scaling_available_governors',
    cpu_nums
  ))

  return power_governor_option_paths

def get_scaling_driver_devices():
  cpu_nums = get_online_cpus()

  scaling_driver_paths = list(map(
    lambda cpu_num: f'/sys/devices/system/cpu/cpufreq/policy{cpu_num}/scaling_driver',
    cpu_nums
  ))

  return scaling_driver_paths

def get_scaling_driver():
  SCALING_DRIVER_DEVICES = get_scaling_driver_devices()
  try:
    with file_timeout.time_limit(1):
      if os.path.exists(SCALING_DRIVER_DEVICES[0]):
        with open(SCALING_DRIVER_DEVICES[0], 'r') as file:
          scaling_driver = file.read().strip()
          file.close()
          return scaling_driver
  except Exception as e:
    decky_plugin.logger.error(f'{__name__} get_scaling_driver {e}')
    return ''

def get_intel_tdp_limits():
  # while there is a max TDP provided by intel, there is no min
  min_tdp = 4
  MAX_TDP_PATH = f'{INTEL_LEGACY_TDP_PREFIX if use_legacy_intel_tdp() else INTEL_TDP_PREFIX}/constraint_0_max_power_uw'

  try:
    with file_timeout.time_limit(1):
      if os.path.exists(MAX_TDP_PATH):
        with open(MAX_TDP_PATH, 'r') as file:
          max_tdp = int(file.read().strip()) / 1000000
          file.close()

          return [min_tdp, max_tdp]
  except Exception as e:
    decky_plugin.logger.error(f'{__name__} error: get_intel_tdp_limits {e}')

  # default to reasonably safe value for TDP limits
  return [min_tdp, 15]
