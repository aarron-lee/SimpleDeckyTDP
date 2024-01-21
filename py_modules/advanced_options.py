import os
import shutil
import subprocess
import file_timeout
import decky_plugin
from plugin_settings import get_nested_setting
from enum import Enum

PLATFORM_PROFILE_PATH = '/sys/firmware/acpi/platform_profile'

class Devices(Enum):
    LEGION_GO = "83E1"
    ROG_ALLY = "ROG Ally RC71L_RC71L"

class DefaultSettings(Enum):
    ENABLE_STEAM_PATCH = 'steamPatch'

class RogAllySettings(Enum):
    USE_ASUSCTL_TDP = 'useAsusCtlTdp'
    USE_PLATFORM_PROFILE_TDP = 'platformProfileTdp'

class LegionGoSettings(Enum):
    CUSTOM_TDP_MODE = 'lenovoCustomTdpMode'

def modprobe_acpi_call():
    os.system("modprobe acpi_call")
    result = subprocess.run(["modprobe", "acpi_call"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

    if result.stderr:
        decky_plugin.logger.error(f"modprobe_acpi_call error: {result.stderr}")
        return False
    return True

# e.g. get_setting(LegionGoSettings.CUSTOM_TDP_MODE.value)
def get_setting(setting_name = ''):
    return get_nested_setting(f'advanced.{setting_name}')

def get_device_name():
    try:
        with file_timeout.time_limit(2):
            with open("/sys/devices/virtual/dmi/id/product_name", "r") as file:
                device_name = file.read().strip()
                file.close()

                return device_name
    except Exception as e:
        decky_plugin.logger.error(f'{__name__} error while trying to read device name')
        return ''

def get_default_options():
    options = []

    enable_steam_patch = {
        'name': 'Fix Steam Hardware Controls',
        'type': 'boolean',
        'defaultValue': False,
        'description': 'Fixes Steam TDP Slider (and GPU Slider on some distros)',
        'currentValue': get_nested_setting(
            f'advanced.{DefaultSettings.ENABLE_STEAM_PATCH.value}'
        ) or False,
        'statePath': DefaultSettings.ENABLE_STEAM_PATCH.value
    }

    options.append(enable_steam_patch)

    return options


def get_advanced_options():
    options = get_default_options()
    device_name = get_device_name()
    supports_acpi_call = modprobe_acpi_call()

    if device_name == Devices.LEGION_GO.value and supports_acpi_call:
        current_val = get_nested_setting(
                f'advanced.{LegionGoSettings.CUSTOM_TDP_MODE.value}'
            )
        defaultValue = True
        options.append({
            'name': 'Lenovo Custom TDP Mode',
            'type': 'boolean',
            'defaultValue': defaultValue,
            'currentValue': current_val if isinstance(current_val, bool) else defaultValue,
            'statePath': LegionGoSettings.CUSTOM_TDP_MODE.value
        })
    if device_name == Devices.ROG_ALLY.value:
        defaultValue = True
        if os.path.exists(PLATFORM_PROFILE_PATH):
            current_val = get_nested_setting(
                    f'advanced.{RogAllySettings.USE_PLATFORM_PROFILE_TDP.value}'
                )
            options.append({
                'name': 'Enable Asus Platform Profile',
                'type': 'boolean',
                'description': 'Sets Quiet, Balanced, or Performance based on TDP',
                'defaultValue': defaultValue,
                'currentValue': current_val if isinstance(current_val, bool) else defaultValue,
                'statePath': RogAllySettings.USE_PLATFORM_PROFILE_TDP.value
            })

    return options