import decky_plugin
import os
from time import sleep

LENOVO_WMI_PATH = "/sys/class/firmware-attributes/lenovo-wmi-other-0/attributes/"
LENOVO_WMI_FAST_PATH = f"{LENOVO_WMI_PATH}/ppt_pl3_fppt/current_value"
LENOVO_WMI_SLOW_PATH = f"{LENOVO_WMI_PATH}/ppt_pl2_sppt/current_value"
LENOVO_WMI_STAPM_PATH = f"{LENOVO_WMI_PATH}/ppt_pl1_spl/current_value"

# credit:
# https://github.com/mengmeet/PowerControl/blob/main/py_modules/devices/lenovo/lenovo_device.py


PLATFORM_PROFILE_PATH = None

def find_sysdir(prefix: str, name: str) -> str:
    for dir in os.listdir(prefix):
        base_path = os.path.join(prefix, dir)
        if os.path.exists(os.path.join(base_path, "name")):
            with open(os.path.join(base_path, "name"), "r") as f:
                if f.read().strip() == name:
                    return base_path
    return None

def get_platform_profile_path():
    global PLATFORM_PROFILE_PATH

    if not PLATFORM_PROFILE_PATH:
        PLATFORM_PROFILE_PATH = find_sysdir("/sys/class/platform-profile", "lenovo-wmi-gamezone")

    return PLATFORM_PROFILE_PATH

def set_tdp(tdp):
    set_platform_profile("custom")
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
        and get_platform_profile_path() != None
        and os.path.exists(get_platform_profile_path())
    ):
        return True
    return False

def set_platform_profile(profile: str) -> None:
    if os.path.exists(os.path.join(get_platform_profile_path(), "profile")):
        try:
            with open(os.path.join(get_platform_profile_path(), "profile"), "w") as f:
                f.write(profile)
        except Exception as e:
            decky_plugin.logger.error(f"{__name__} Failed to set platform profile {profile}: {e}")
