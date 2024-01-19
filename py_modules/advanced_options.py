import os
import subprocess
import file_timeout
import decky_plugin
from plugin_settings import get_nested_setting
from enum import Enum

class Devices(Enum):
    LEGION_GO = "83E1"

class DefaultSettings(Enum):
    ENABLE_TDP_CONTROL = 'tdpControl'
    ENABLE_STEAM_PATCH = 'steamPatch'

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

    current_tdp_control_value = get_nested_setting(
        f'advanced.{DefaultSettings.ENABLE_TDP_CONTROL.value}'
    )

    enable_tdp_control_toggle = {
        'name': 'Enable TDP Control',
        'type': 'boolean',
        'defaultValue': True,
        'currentValue': current_tdp_control_value if isinstance(current_tdp_control_value, bool) else True,
        'statePath': DefaultSettings.ENABLE_TDP_CONTROL.value
    }

    enable_steam_patch = {
        'name': 'Enable Steam\'s TDP/GPU controls',
        'type': 'boolean',
        'defaultValue': False,
        'currentValue': get_nested_setting(
            f'advanced.{DefaultSettings.ENABLE_STEAM_PATCH.value}'
        ) or False,
        'statePath': DefaultSettings.ENABLE_STEAM_PATCH.value
    }

    options.append(enable_steam_patch)
    options.append(enable_tdp_control_toggle)

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

    return options