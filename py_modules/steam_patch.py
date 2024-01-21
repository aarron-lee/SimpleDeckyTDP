# import os
import decky_plugin
import plugin_update
import logging
import os
import file_timeout
import advanced_options
from plugin_settings import bootstrap_profile, set_all_tdp_profiles, get_saved_settings, get_tdp_profile, get_active_tdp_profile, set_setting as persist_setting
from cpu_utils import ryzenadj, set_cpu_boost, set_smt
from gpu_utils import get_gpu_frequency_range, set_gpu_frequency, set_gpu_frequency_range


def set_tdp_for_game_id(game_id):
    tdp_profile = get_tdp_profile(game_id)

    if tdp_profile.get('tdp'):
        try:
            with file_timeout.time_limit(3):
                ryzenadj(tdp_profile.get('tdp'))
        except Exception as e:
            logging.error(f'main#set_tdp_for_game_id timeout {e}')

def set_gpu_for_game_id(game_id):
    tdp_profile = get_tdp_profile(game_id)
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
            logging.error(f'main#set_tdp_for_game_id timeout {e}')


def save_steam_patch_tdp(tdp, game_id):
    bootstrap_profile(game_id)
    tdp_profile = {
        f"{game_id}": {
            "tdp": tdp
        }
    }
    set_all_tdp_profiles(tdp_profile)

    try:
        with file_timeout.time_limit(3):
            ryzenadj(tdp)
    except Exception as e:
        logging.error(f'main#set_steam_patch timeout {e}')


def save_steam_patch_gpu(minGpuFrequency, maxGpuFrequency, game_id):
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
    set_all_tdp_profiles(tdp_profile)

    try:
        with file_timeout.time_limit(3):
            set_gpu_frequency_range(minGpuFrequency, maxGpuFrequency)
    except Exception as e:
        logging.error(f'main#steam_patch_gpu error {e}')


def save_steam_patch_tdp_profile(tdp_profiles, game_id, advanced):
    try:
        set_all_tdp_profiles(tdp_profiles)
        persist_setting('advanced', advanced)
        steam_patch_enabled = advanced_options.get_setting(
            advanced_options.DefaultSettings.ENABLE_STEAM_PATCH.value
        )

        if steam_patch_enabled:
            tdp_profile = get_tdp_profile(game_id)
            smt = tdp_profile.get('smt', True)
            cpu_boost = tdp_profile.get('cpuBoost', True)
            try:
                with file_timeout.time_limit(3):
                    set_smt(smt)
                    set_cpu_boost(cpu_boost)
            except Exception as e:
                logging.error(f'main#save_tdp file timeout {e}')
    except Exception as e:
        logging.error(f'main#save_steam_patch_tdp error {e}')