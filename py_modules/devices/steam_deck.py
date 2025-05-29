import advanced_options
import subprocess
import decky_plugin

STEAM_DECK_TDP_PATH="/sys/class/hwmon/hwmon*/power*_cap"

def set_tdp(tdp: int):
  return _execute_tdp_command(tdp, STEAM_DECK_TDP_PATH)

def get_gpu_range():
  # Steam Deck pp_od_clk_voltage is empty, so min/max values can't be automatically detected
  GPU_FREQUENCY_RANGE = [200, 1600]

  custom_max_enabled = advanced_options.get_setting(
    advanced_options.SteamDeckSettings.DECK_CUSTOM_GPU_MAX_ENABLED.value
  )

  if custom_max_enabled:
    custom_max = advanced_options.get_setting(
      advanced_options.SteamDeckSettings.DECK_CUSTOM_GPU_MAX.value
    )

    if isinstance(custom_max, int):
      return [200, custom_max or 1600]

  return GPU_FREQUENCY_RANGE


def _execute_tdp_command(tdp, tdp_path):
  tdp_microwatts = tdp * 1000000
  try:
    cmd = f"echo '{tdp_microwatts}' | tee {tdp_path}"
    result = subprocess.run(cmd, shell=True, check=True, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    return result
  except Exception as e:
    decky_plugin.logger.error(f'{__name__} Error: execute_tdp_command {e}')
