import logging
import glob
import re
from plugin_enums import GpuModes, GpuRange
from plugin_settings import get_saved_settings

GPU_DEVICE_PATH = glob.glob("/sys/class/drm/card?/device")[0]
GPU_FREQUENCY_PATH = f"{GPU_DEVICE_PATH}/pp_od_clk_voltage"
GPU_LEVEL_PATH = f"{GPU_DEVICE_PATH}/power_dpm_force_performance_level"

GPU_FREQUENCY_RANGE = None

def get_gpu_frequency_range():
    global GPU_FREQUENCY_RANGE
    if GPU_FREQUENCY_RANGE:
        return GPU_FREQUENCY_RANGE
    try:
        freq_string = open(GPU_FREQUENCY_PATH,"r").read()
        od_sclk_matches = re.findall(r"OD_RANGE:\s*SCLK:\s*(\d+)Mhz\s*(\d+)Mhz", freq_string)

        if od_sclk_matches:
            frequency_range = [int(od_sclk_matches[0][0]), int(od_sclk_matches[0][1])]
            GPU_FREQUENCY_RANGE = frequency_range
            return frequency_range
    except Exception as e:
        logging.error(e)

def set_gpu_frequency(current_game_id):
    settings = get_saved_settings()
    gpu_mode = GpuModes.DEFAULT.value
    tdp_profile = settings.get("tdpProfiles").get("default")

    if settings.get("enableTdpProfiles"):
        current_tdp_profile = settings.get("tdpProfiles").get(current_game_id)
        if current_tdp_profile:
            tdp_profile = current_tdp_profile
    if tdp_profile.get("gpuMode"):
        gpu_mode = tdp_profile.get("gpuMode")

    if gpu_mode == GpuModes.DEFAULT.value:
        try:
            # change back to auto
            open(GPU_LEVEL_PATH,'w').write("auto")
            return True
        except Exception as e:
            logging.error(f"set_gpu_frequency default mode error {e}")
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
    try:
        min, max = get_gpu_frequency_range()

        if not (new_min >= min and new_max <= max and new_min <= new_max):
            # invalid values, just change back to auto
            open(GPU_LEVEL_PATH,'w').write("auto")
            return True
        
        open(GPU_LEVEL_PATH,'w').write("manual")
        open(GPU_FREQUENCY_PATH,'w').write(f"s 0 {new_min}")
        open(GPU_FREQUENCY_PATH,'w').write(f"s 1 {new_max}")
        open(GPU_FREQUENCY_PATH,'w').write("c")
        return True
    except Exception as e:
        logging.error(f"set_gpu_frequency_range {new_min} {new_max} error {e}")
        return False