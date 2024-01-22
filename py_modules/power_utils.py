import os
import glob
import decky_plugin
import subprocess
from enum import Enum
import cpu_utils

RECOMMENDED_EPP = 'power'
RECOMMENDED_GOVERNOR = 'powersave'

# ENERGY_PERFORMANCE_PREFERENCE_PATH
EPP_DEVICES = glob.glob('/sys/devices/system/cpu/cpu*/cpufreq/energy_performance_preference')
EPP_OPTION_PATHS = glob.glob('/sys/devices/system/cpu/cpu*/cpufreq/energy_performance_available_preferences')
EPP_PATH ='/sys/devices/system/cpu/cpu*/cpufreq/energy_performance_preference'

POWER_GOVERNOR_PATH = '/sys/devices/system/cpu/cpu*/cpufreq/scaling_governor'
POWER_GOVERNOR_DEVICES = glob.glob(POWER_GOVERNOR_PATH)

class PowerGovernorOptions(Enum):
    POWER_SAVE = 'powersave'
    PERFORMANCE = 'performance'
    BALANCED = 'schedutil'

class EppOptions(Enum):
    PERFORMANCE = 'performance'
    BALANCE_PERFORMANCE = 'balance_performance'
    BALANCE_POWER = 'balance_power'
    POWER_SAVE = 'power'
def set_power_governor(governor_option):
    try:
        option = PowerGovernorOptions(governor_option).value

        if len(POWER_GOVERNOR_DEVICES) > 0:
            return execute_bash_command(option, POWER_GOVERNOR_PATH)
    except Exception as e:
        decky_plugin.logger.error(f'{__name__} error setting power governor {e}')

def get_available_epp_options():
    try:
        if len(EPP_OPTION_PATHS) > 0:
            path = EPP_OPTION_PATHS[0]
            with open(path, 'r') as file:
                available_options = file.read().strip().split(' ')
                file.close()
                return available_options
    except Exception as e:
        decky_plugin.logger.error(f'{__name__} error getting epp options {e}')

    return []

def set_epp(epp_option):
    try:
        if epp_option not in get_available_epp_options():
            return
        if len(EPP_DEVICES) > 0:
            return execute_bash_command(epp_option, EPP_PATH)

    except Exception as e:
        decky_plugin.logger.error(f'{__name__} error setting epp {e}')

def supports_epp():
    # enables PSTATE if it exists
    cpu_utils.set_cpu_boost(True)

    current_pstate = cpu_utils.get_pstate_status()
    available_epp_options = get_available_epp_options()

    if current_pstate and len(available_epp_options) > 0 and RECOMMENDED_EPP in available_epp_options:
        return True
    return False

def execute_bash_command(command, path):
    cmd = f"echo '{command}' | tee {path}"
    result = subprocess.run(cmd, shell=True, check=True, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    return result
