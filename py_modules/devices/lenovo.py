import decky_plugin
import os
from time import sleep

PLATFORM_PROFILE_PATH  = '/sys/class/platform_profile'

LENOVO_WMI_PATH = "/sys/class/firmware-attributes/lenovo-wmi-other-0/attributes/"
LENOVO_WMI_FAST_PATH = f"{LENOVO_WMI_PATH}/ppt_pl3_fppt/current_value"
LENOVO_WMI_SLOW_PATH = f"{LENOVO_WMI_PATH}/ppt_pl2_sppt/current_value"
LENOVO_WMI_STAPM_PATH = f"{LENOVO_WMI_PATH}/ppt_pl1_spl/current_value"

# credit: https://github.com/mengmeet/PowerControl/blob/main/py_modules/devices/lenovo/lenovo_device.py

def set_tdp(tdp):
    set_custom_platform_profile()
    if (
        os.path.exists(LENOVO_WMI_FAST_PATH)
        and os.path.exists(LENOVO_WMI_SLOW_PATH)
        and os.path.exists(LENOVO_WMI_STAPM_PATH)
    ):
        decky_plugin.logger.info(f"{__name__} Setting Lenovo WMI TDP {tdp}")

        with open(LENOVO_WMI_FAST_PATH, "w") as f:
            f.write(str(tdp+2))
        sleep(0.1)
        with open(LENOVO_WMI_SLOW_PATH, "w") as f:
            f.write(str(tdp))
        sleep(0.1)
        with open(LENOVO_WMI_STAPM_PATH, "w") as f:
            f.write(str(tdp))
        sleep(0.1)

def supports_wmi_tdp():
    if (
        os.path.exists(LENOVO_WMI_FAST_PATH)
        and os.path.exists(LENOVO_WMI_SLOW_PATH)
        and os.path.exists(LENOVO_WMI_STAPM_PATH)
    ):
        return True
    return False

def set_custom_platform_profile():
  if os.path.exists(PLATFORM_PROFILE_PATH):
    decky_plugin.logger.info(f"{__name__} Setting Lenovo custom platform profile")
    try:
        with open(PLATFORM_PROFILE_PATH, 'w') as file:
            file.write('custom')
    except Exception as e:
        decky_plugin.logger.error(f"{__name__} platform_profile error {e}")
        sleep(1.0)
  return True