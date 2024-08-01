from enum import Enum
import os
import re
import subprocess
import shutil
import decky_plugin
import file_timeout
import logging
import plugin_settings
import advanced_options
from time import sleep
from advanced_options import LegionGoSettings, Devices, RogAllySettings
import glob
from devices import legion_go, rog_ally

RYZENADJ_PATH = shutil.which('ryzenadj')
BOOST_PATH="/sys/devices/system/cpu/cpufreq/boost"
PSTATE_BOOST_PATH="/sys/devices/system/cpu/amd_pstate/cpb_boost"
AMD_PSTATE_PATH="/sys/devices/system/cpu/amd_pstate/status"
AMD_SMT_PATH="/sys/devices/system/cpu/smt/control"

class ScalingDrivers(Enum):
  PSTATE_EPP = "amd-pstate-epp"
  PSTATE = "amd-pstate"
  ACPI_CPUFREQ = "acpi-cpufreq"

def modprobe_acpi_call():
  os.system("modprobe acpi_call")
  result = subprocess.run(["modprobe", "acpi_call"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

  if result.stderr:
    logging.error(f"modprobe_acpi_call error: {result.stderr}")
    return False
  return True

def ryzenadj(tdp: int):
  if not advanced_options.tdp_control_enabled():
    return

  try:
    with file_timeout.time_limit(4):
      device_name = advanced_options.get_device_name()

      if device_name == Devices.LEGION_GO.value and advanced_options.get_setting(
        LegionGoSettings.CUSTOM_TDP_MODE.value
      ):
        return legion_go.ryzenadj(tdp)
      elif Devices.ROG_ALLY.value in device_name or Devices.ROG_ALLY_X.value in device_name:
        if advanced_options.get_setting(RogAllySettings.USE_PLATFORM_PROFILE.value):
          rog_ally.set_platform_profile(tdp)
        #   if advanced_options.get_setting(RogAllySettings.USE_ASUSCTL.value):
        #     rog_ally.set_asusctl_platform_profile(tdp)
        #   else:
        #     rog_ally.set_platform_profile(tdp)
        if advanced_options.get_setting(RogAllySettings.USE_WMI.value):
          return rog_ally.ryzenadj(tdp)

    fast_tdp = (tdp+2)*1000
    tdp = tdp*1000

    if RYZENADJ_PATH:
      commands = [
        RYZENADJ_PATH,
        '--stapm-limit', f"{tdp}",
        '--fast-limit', f"{fast_tdp}",
        '--slow-limit', f"{tdp}",
        '--apu-slow-limit', f"{tdp}"
      ]

      results = subprocess.call(commands)
      return results
  except Exception as e:
    logging.error(e)

def get_cpb_boost_paths():
  cpu_nums = get_online_cpus()

  cpb_cpu_boost_paths = list(map(
    lambda cpu_num: f'/sys/devices/system/cpu/cpu{cpu_num}/cpufreq/boost',
    cpu_nums
  ))

  return cpb_cpu_boost_paths

def set_cpb_boost(enabled):
  if os.path.exists(PSTATE_BOOST_PATH):
    try:
      with open(PSTATE_BOOST_PATH, "w") as f:
        f.write("enabled" if enabled else "disabled")
    except Exception:
      with open(PSTATE_BOOST_PATH, "w") as f:
        f.write("1" if enabled else "0")
  else:
    # global cpb boost toggle doesn't exist, fallback to setting it per-cpu
    paths = get_cpb_boost_paths()
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

def supports_cpu_boost():
  if os.path.exists(PSTATE_BOOST_PATH) or os.path.exists(BOOST_PATH):
    return True

  cpu_boost_paths = get_cpb_boost_paths()
  if len(cpu_boost_paths) > 0 and os.path.exists(cpu_boost_paths[0]):
    return True

  return False

def set_cpu_boost(enabled = True):
  try:
    set_cpb_boost(enabled)
  
    # legacy boost path for acpi cpufreq
    if os.path.exists(BOOST_PATH):
      with open(BOOST_PATH, 'w') as file:
        if enabled:
          file.write('1')
        else:
          file.write('0')
        file.close()

    return True
  except Exception as e:
    logging.error(e)
    return False

def set_smt(enabled = True):
  try:
    # logging.debug(f"set_smt to {enabled}")

    if os.path.exists(AMD_SMT_PATH):
      with open(AMD_SMT_PATH, 'w') as file:
        if enabled:
          file.write('on')
        else:
          file.write('off')
        file.close()

    return True
  except Exception as e:
    logging.error(e)
    return False

def get_pstate_status():
  try:
    if os.path.exists(AMD_PSTATE_PATH):
      with open(AMD_PSTATE_PATH, 'r') as file:
        pstate = file.read()
        file.close()
        return pstate.strip()
  except Exception as e:
    logging.error(f'{__name__} get_pstate_status {e}')
    return False
  return None

def set_amd_pstate_active():
  if os.path.exists(AMD_PSTATE_PATH):
    with open(AMD_PSTATE_PATH, 'w') as file:
      file.write('active')
      file.close()

def check_cpu_online(cpu_id):
    cpu_path = f"/sys/devices/system/cpu/cpu{cpu_id}/online"
    if os.path.exists(cpu_path):
        with open(cpu_path, 'r') as f:
            status = f.read().strip()
            return status == '1'
    else:
        return False

def get_online_cpus():
  # cpu0 is always online
  online_cpus = ['0']
  cpu_path = '/sys/devices/system/cpu/'
  cpu_pattern = re.compile(r'^cpu(\d+)$')

  for cpu_dir in os.listdir(cpu_path):
    match = cpu_pattern.match(cpu_dir)
    if match:
      cpu_id = match.group(1)
      if check_cpu_online(cpu_id):
        online_cpus.append(cpu_id)
  
  online_cpus.sort()

  return online_cpus

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
    logging.error(f'{__name__} get_scaling_driver {e}')
    return ''