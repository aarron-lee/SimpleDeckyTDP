import os
import glob
import decky_plugin
import subprocess
import file_timeout
import time
from enum import Enum
import cpu_utils

RECOMMENDED_EPP = 'power'
RECOMMENDED_GOVERNOR = 'powersave'

# ENERGY_PERFORMANCE_PREFERENCE_PATH
EPP_DEVICES = glob.glob('/sys/devices/system/cpu/cpu*/cpufreq/energy_performance_preference')
EPP_OPTION_PATHS = glob.glob('/sys/devices/system/cpu/cpu*/cpufreq/energy_performance_available_preferences')
EPP_PATH ='/sys/devices/system/cpu/cpu*/cpufreq/energy_performance_preference'

POWER_GOVERNOR_PATH = '/sys/devices/system/cpu/cpu*/cpufreq/scaling_governor'
POWER_GOVERNOR_OPTION_PATHS = '/sys/devices/system/cpu/cpu0/cpufreq/scaling_available_governors'
POWER_GOVERNOR_DEVICES = glob.glob(POWER_GOVERNOR_PATH)

class PowerGovernorOptions(Enum):
    POWER_SAVE = 'powersave'
    PERFORMANCE = 'performance'

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
    cmd = f"echo {command} | tee {path}"
    decky_plugin.logger.info(cmd)
    # result = subprocess.run(cmd, timeout=1, shell=True, text=True, check=True)
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE, shell=True)
    time.sleep(0.2)
    # process hangs if not manually killed
    p.kill()
    # return result
