import os
import glob
from time import sleep
import decky_plugin
import subprocess
import file_timeout
from enum import Enum
import cpu_utils

# ENERGY_PERFORMANCE_PREFERENCE_PATH
EPP_PATH ='/sys/devices/system/cpu/cpu*/cpufreq/energy_performance_preference'
EPP_OPTION_PATHS = glob.glob('/sys/devices/system/cpu/cpu*/cpufreq/energy_performance_available_preferences')
EPP_DEVICES = glob.glob(EPP_PATH)

POWER_GOVERNOR_PATH = '/sys/devices/system/cpu/cpu*/cpufreq/scaling_governor'
POWER_GOVERNOR_OPTION_PATHS = glob.glob('/sys/devices/system/cpu/cpu*/cpufreq/scaling_available_governors')
POWER_GOVERNOR_DEVICES = glob.glob(POWER_GOVERNOR_PATH)

class PowerGovernorOptions(Enum):
    POWER_SAVE = 'powersave'
    PERFORMANCE = 'performance'

class EppOptions(Enum):
    PERFORMANCE = 'performance'
    BALANCE_PERFORMANCE = 'balance_performance'
    BALANCE_POWER = 'balance_power'
    POWER_SAVE = 'power'

RECOMMENDED_EPP = EppOptions.POWER_SAVE.value
RECOMMENDED_GOVERNOR = PowerGovernorOptions.POWER_SAVE.value

def set_recommended_options():
    set_power_governor(RECOMMENDED_GOVERNOR)
    sleep(0.1)
    set_epp(RECOMMENDED_EPP)

def set_power_governor(governor_option):
    try:
        option = PowerGovernorOptions(governor_option).value

        if len(POWER_GOVERNOR_DEVICES) > 0:
            # return execute_bash_command(option, POWER_GOVERNOR_PATH)
            return execute_bash_command(option, POWER_GOVERNOR_DEVICES)
    except Exception as e:
        decky_plugin.logger.error(f'{__name__} error setting power governor {e}')

def get_available_epp_options():
    try:
        if len(EPP_OPTION_PATHS) > 0:
            path = EPP_OPTION_PATHS[0]
            with open(path, 'r') as file:
                available_options = file.read().strip().split(' ')
                available_options
                file.close()
                # available_options.remove('default')
                return available_options
    except Exception as e:
        decky_plugin.logger.error(f'{__name__} error getting epp options {e}')

    return []

def get_available_governor_options():
    try:
        if len(POWER_GOVERNOR_OPTION_PATHS) > 0:
            path = POWER_GOVERNOR_OPTION_PATHS[0]
            with open(path, 'r') as file:
                available_options = file.read().strip().split(' ')
                available_options
                file.close()
                return available_options
    except Exception as e:
        decky_plugin.logger.error(f'{__name__} error getting power governor options {e}')

    return []

def set_epp(epp_option):
    try:
        if epp_option not in get_available_epp_options():
            return
        if len(EPP_DEVICES) > 0:
            # return execute_bash_command(epp_option, EPP_PATH)
            return execute_bash_command(epp_option, EPP_DEVICES)

    except Exception as e:
        decky_plugin.logger.error(f'{__name__} error setting epp {e}')

def supports_epp():
    # enables PSTATE if it exists
    cpu_utils.set_cpu_boost(True)

    sleep(0.2)

    current_pstate = cpu_utils.get_pstate_status()
    available_epp_options = get_available_epp_options()

    if current_pstate == 'active' and len(available_epp_options) > 0:
        return True
    return False

def execute_bash_command(command, paths):
    for p in paths:
        with file_timeout.time_limit(1):
            try:
                with open(p, 'w') as file:
                    file.write(f'{command}')
                    file.close()
            except Exception as e:
                decky_plugin.logger.error(e)
    # cmd = f"echo {command} | tee {path}"
    # # result = subprocess.run(cmd, timeout=1, shell=True, text=True, check=True)
    # p = subprocess.Popen(cmd, stdout=subprocess.PIPE, shell=True)
    # sleep(0.2)
    # # process hangs if not manually killed
    # p.kill()
    # # return result

