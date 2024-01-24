import logging
import file_timeout
from time import sleep
import advanced_options
from plugin_settings import bootstrap_profile, merge_tdp_profiles, get_tdp_profile, set_setting as persist_setting
from cpu_utils import ryzenadj, set_cpu_boost, set_smt
from gpu_utils import set_gpu_frequency_range
import power_utils


def set_values_for_game_id(game_id):
    tdp_profile = get_tdp_profile(game_id)
    if tdp_profile:
        set_values_for_tdp_profile(tdp_profile)

def set_values_for_tdp_profile(tdp_profile, set_tdp = True, set_gpu = True, set_governor = True):
    if set_tdp:
        set_tdp_for_tdp_profile(tdp_profile)
    if set_gpu:
        set_gpu_for_tdp_profile(tdp_profile)
    set_cpu_boost_for_tdp_profile(tdp_profile)
    set_smt_for_tdp_profile(tdp_profile)
    if set_governor:
        # must be set AFTER smt
        sleep(0.2)
        set_power_governor_for_tdp_profile(tdp_profile)

def set_power_governor_for_tdp_profile(tdp_profile):
    governor = tdp_profile.get('powerGovernor', power_utils.RECOMMENDED_GOVERNOR)
    power_utils.set_power_governor(governor)

    if governor != power_utils.PowerGovernorOptions.PERFORMANCE.value:
        # epp is automatically changed to `performance` when governor is performance
        # this is to handle for all other governor options
        sleep(0.2)
        set_epp_for_tdp_profile(tdp_profile)

def set_epp_for_tdp_profile(tdp_profile):
    epp = tdp_profile.get('epp', power_utils.RECOMMENDED_EPP)

    power_utils.set_epp(epp)

def set_smt_for_tdp_profile(tdp_profile):
    smt = tdp_profile.get('smt', False)

    set_smt(smt)

def set_cpu_boost_for_tdp_profile(tdp_profile):
    cpu_boost = tdp_profile.get('cpuBoost', False)

    if not power_utils.supports_epp():
        # only set cpu boost if no pstate/epp available
        set_cpu_boost(cpu_boost)

def set_tdp_for_tdp_profile(tdp_profile):
    if tdp_profile.get('tdp'):
        try:
            with file_timeout.time_limit(3):
                ryzenadj(tdp_profile.get('tdp'))
        except Exception as e:
            logging.error(f'main#set_tdp_for_tdp_profile timeout {e}')

def set_gpu_for_tdp_profile(tdp_profile):
    gpu_mode = tdp_profile.get('gpuMode')
    fixed_frequency = tdp_profile.get('fixedGpuFrequency')
    min_frequency = tdp_profile.get('minGpuFrequency')
    max_frequency = tdp_profile.get('maxGpuFrequency')


    if gpu_mode:
        try:
            with file_timeout.time_limit(3):
                if gpu_mode == 'DEFAULT':
                    set_gpu_frequency_range(0, 0)
                    return True
                elif gpu_mode == 'FIXED' and fixed_frequency:
                    set_gpu_frequency_range(fixed_frequency, fixed_frequency)
                    return True
                elif gpu_mode == 'RANGE' and min_frequency and max_frequency:
                    set_gpu_frequency_range(min_frequency, max_frequency)
                    return True
                return False
        except Exception as e:
            logging.error(f'main#set_gpu_for_game_id timeout {e}')


def persist_tdp(tdp, game_id):
    bootstrap_profile(game_id)
    tdp_profile = {
        f"{game_id}": {
            "tdp": tdp
        }
    }
    merge_tdp_profiles(tdp_profile)

    try:
        with file_timeout.time_limit(3):
            ryzenadj(tdp)
    except Exception as e:
        logging.error(f'main#set_steam_patch timeout {e}')


def persist_gpu(minGpuFrequency, maxGpuFrequency, game_id):
    bootstrap_profile(game_id)
    gpu_mode = None

    profile_contents = {}

    if minGpuFrequency == 0 and maxGpuFrequency == 0:
        gpu_mode = 'DEFAULT'
    elif minGpuFrequency == maxGpuFrequency:
        gpu_mode = 'FIXED'
        profile_contents["fixedGpuFrequency"] = maxGpuFrequency
    elif minGpuFrequency < maxGpuFrequency:
        gpu_mode = 'RANGE'
        profile_contents["minGpuFrequency"] = minGpuFrequency
        profile_contents["maxGpuFrequency"] = maxGpuFrequency
    else:
        # invalid, return
        return
    profile_contents['gpuMode'] = gpu_mode

    tdp_profile = {
        f"{game_id}": profile_contents
    }
    merge_tdp_profiles(tdp_profile)

    try:
        with file_timeout.time_limit(3):
            set_gpu_frequency_range(minGpuFrequency, maxGpuFrequency)
    except Exception as e:
        logging.error(f'main#steam_patch_gpu error {e}')


def save_steam_patch_tdp_profile(tdp_profiles, game_id, advanced):
    try:
        merge_tdp_profiles(tdp_profiles)
        persist_setting('advanced', advanced)
        steam_patch_enabled = advanced_options.get_setting(
            advanced_options.DefaultSettings.ENABLE_STEAM_PATCH.value
        )

        if steam_patch_enabled:
            tdp_profile = get_tdp_profile(game_id)
            try:
                with file_timeout.time_limit(3):
                    set_values_for_tdp_profile(tdp_profile)
            except Exception as e:
                logging.error(f'main#save_tdp file timeout {e}')
    except Exception as e:
        logging.error(f'main#save_steam_patch_tdp_profile error {e}')