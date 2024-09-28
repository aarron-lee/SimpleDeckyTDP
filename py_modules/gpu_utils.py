import decky_plugin
import device_utils
import glob
import re
import os
import time
import subprocess
import advanced_options
from plugin_enums import GpuModes, GpuRange
from plugin_settings import get_saved_settings

GPU_FREQUENCY_PATH = None
GPU_LEVEL_PATH = None

if not device_utils.is_intel():
  GPU_FREQUENCY_PATH = glob.glob("/sys/class/drm/card?/device/pp_od_clk_voltage")[0]
  GPU_LEVEL_PATH = glob.glob("/sys/class/drm/card?/device/power_dpm_force_performance_level")[0]

GPU_FREQUENCY_RANGE = None

def get_gpu_frequency_range():
  global GPU_FREQUENCY_RANGE
  if GPU_FREQUENCY_RANGE:
    return GPU_FREQUENCY_RANGE

  if device_utils.is_intel():
      GPU_FREQUENCY_RANGE = get_intel_gpu_clocks()
      return GPU_FREQUENCY_RANGE
  else:
    try:
      freq_string = open(GPU_FREQUENCY_PATH,"r").read()
      od_sclk_matches = re.findall(r"OD_RANGE:\s*SCLK:\s*(\d+)Mhz\s*(\d+)Mhz", freq_string)

      if od_sclk_matches:
        frequency_range = [int(od_sclk_matches[0][0]), int(od_sclk_matches[0][1])]
        GPU_FREQUENCY_RANGE = frequency_range
        return frequency_range
      else:
        frequency_range = [-2, -2]
        GPU_FREQUENCY_RANGE = frequency_range
        return frequency_range
    except Exception as e:
      decky_plugin.logger.error(e)

def set_gpu_frequency(current_game_id):
  if device_utils.is_intel():
    return
    # set_intel_gpu_frequency(current_game_id)
  else:
    set_amd_gpu_frequency(current_game_id)

def set_intel_gpu_frequency(current_game_id):
  settings = get_saved_settings()
  tdp_profile = settings.get("tdpProfiles").get("default")
  if settings.get("enableTdpProfiles"):
    current_tdp_profile = settings.get("tdpProfiles").get(current_game_id)
    if current_tdp_profile:
      tdp_profile = current_tdp_profile
  min, max = get_intel_gpu_clocks()
  new_min = tdp_profile.get(GpuRange.MIN.value, min)
  new_max = tdp_profile.get(GpuRange.MAX.value, max)

  set_intel_gpu_frequency_range(new_min, new_max)

def set_intel_gpu_frequency_range(new_min, new_max):
  # intel only supports setting GPU clocks, no auto/high/low
  max_cmd = 'ls /sys/class/drm/card*/gt_RP0_freq_mhz'
  max_result = subprocess.run(max_cmd, shell=True, check=True, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
  max_gpu_filepath = max_result.stdout.strip()

  min_cmd = 'ls /sys/class/drm/card*/gt_RPn_freq_mhz'
  min_result = subprocess.run(min_cmd, shell=True, check=True, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
  min_gpu_filepath = min_result.stdout.strip()

  try:
    with open(max_gpu_filepath, 'w') as file:
      file.write(new_max)
      file.close()
    with open(min_gpu_filepath, 'w') as file:
      file.write(new_min)
      file.close()
  except Exception as e:
    decky_plugin.logger.error(f'{__name__}: {e}')

def set_amd_gpu_frequency(current_game_id):
  settings = get_saved_settings()
  gpu_mode = GpuModes.BALANCE.value
  tdp_profile = settings.get("tdpProfiles").get("default")

  if settings.get("enableTdpProfiles"):
    current_tdp_profile = settings.get("tdpProfiles").get(current_game_id)
    if current_tdp_profile:
      tdp_profile = current_tdp_profile
  if tdp_profile.get("gpuMode"):
    gpu_mode = tdp_profile.get("gpuMode")

  # decky_plugin.logger.info(f'{__name__} {current_game_id} {gpu_mode} {tdp_profile}')

  if gpu_mode == GpuModes.BALANCE.value:
    try:
      # change back to auto
      decky_plugin.logger.error(f"{__name__} set balance")
      with open(GPU_LEVEL_PATH,'w') as f:
        f.write("auto")
        f.close()
      return True
    except Exception as e:
      decky_plugin.logger.error(f"{__name__} balance mode error {e}")
      return False
  elif gpu_mode == GpuModes.PERFORMANCE.value:
    try:
      decky_plugin.logger.error(f"{__name__} set performance")
      with open(GPU_LEVEL_PATH,'w') as f:
        f.write("high")
        f.close()
      return True
    except Exception as e:
      decky_plugin.logger.error(f"{__name__} performance mode error {e}")
      return False
  elif gpu_mode == GpuModes.BATTERY.value:
    try:
      decky_plugin.logger.error(f"{__name__} set battery")
      with open(GPU_LEVEL_PATH,'w') as f:
        f.write("low")
        f.close()
      return True
    except Exception as e:
      decky_plugin.logger.error(f"{__name__} power mode error {e}")
      return False
  elif gpu_mode == GpuModes.RANGE.value:
    new_min = tdp_profile.get(GpuRange.MIN.value, 0)
    new_max = tdp_profile.get(GpuRange.MAX.value, 0)
    return set_gpu_frequency_range(new_min, new_max)
  elif gpu_mode == GpuModes.FIXED.value:
    new_freq = tdp_profile.get(GpuRange.FIXED.value, 0)
    return set_gpu_frequency_range(new_freq, new_freq)
  return True

def set_gpu_frequency_range(new_min: int, new_max: int):
  if not advanced_options.gpu_control_enabled():
    decky_plugin.logger.info('gpu controls disabled, exiting set_gpu_frequency_range')
    return

  if device_utils.is_intel():
    # set_intel_gpu_frequency_range(new_min, new_max)

    # intel doesn't support manual GPU clocks on iGPU
    return False
  else:
    return set_amd_gpu_frequency_range(new_min, new_max)

def set_amd_gpu_frequency_range(new_min, new_max):
    try:
      min, max = get_gpu_frequency_range()

      # decky_plugin.logger.info(f'{new_min} {new_max}')
      # decky_plugin.logger.info(f'{min} {max}')

      if not (new_min >= min and new_max <= max and new_min <= new_max):
        decky_plugin.logger.info(f'gpu switch')
        if (new_min == 0 and new_max == 0):
          decky_plugin.logger.info(f"Set balance mode")
          with open(GPU_LEVEL_PATH,'w') as f:
            f.write("auto")
            f.close()
          return True
        elif (new_min == -1 and new_max == 0):
          decky_plugin.logger.info(f"Set perform mode")
          with open(GPU_LEVEL_PATH,'w') as f:
            f.write("high")
            f.close()
          return True
        elif (new_min == -1 and new_max == -1):
          decky_plugin.logger.info(f"Set power mode")
          with open(GPU_LEVEL_PATH,'w') as f:
            f.write("low")
            f.close()
          return True
      # decky_plugin.logger.info(f'manual')

      with open(GPU_LEVEL_PATH,'w') as file:
        file.write("manual")
        file.close()
      time.sleep(0.1)
      try:
        execute_gpu_frequency_command(f"s 0 {new_min}")
        execute_gpu_frequency_command(f"s 1 {new_max}")
        execute_gpu_frequency_command("c")
      except Exception as e:
        decky_plugin.logger.error(f"{__name__} error while trying to write frequency range")
      # decky_plugin.logger.info(f'gpu freq range end')

      return True
    except Exception as e:
      decky_plugin.logger.error(f"set_gpu_frequency_range {new_min} {new_max} error {e}")
      return False

def get_intel_gpu_clocks():
    try:
        max_cmd = 'cat /sys/class/drm/card?/gt_max_freq_mhz'
        max_result = subprocess.run(max_cmd, shell=True, check=True, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        max_gpu_clock = int(max_result.stdout.strip())

        min_cmd = 'cat /sys/class/drm/card?/gt_min_freq_mhz'
        min_result = subprocess.run(min_cmd, shell=True, check=True, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        min_gpu_clock = int(min_result.stdout.strip())

        return [min_gpu_clock, max_gpu_clock]
    except Exception as e:
        decky_plugin.logger.error('error while getting intel gpu clocks')
        return [None, None]


def execute_gpu_frequency_command(command):
  cmd = f"echo '{command}' | tee {GPU_FREQUENCY_PATH}"
  result = subprocess.run(cmd, shell=True, check=True, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
