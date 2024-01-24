import logging
import os
from settings import SettingsManager
from collections import deque 

try:
    LOG_LOCATION = f"/tmp/simpleTDP.log"
    logging.basicConfig(
        level = logging.INFO,
        filename = LOG_LOCATION,
        format="[%(asctime)s | %(filename)s:%(lineno)s:%(funcName)s] %(levelname)s: %(message)s",
        filemode = 'w',
        force = True)
except Exception as e:
    logging.error(f"exception|{e}")

settings_directory = os.environ["DECKY_PLUGIN_SETTINGS_DIR"]
settings_path = os.path.join(settings_directory, 'settings.json')
setting_file = SettingsManager(name="settings", settings_directory=settings_directory)
setting_file.read()

def deep_merge(origin, destination):
    for k, v in origin.items():
        if isinstance(v, dict):
            n = destination.setdefault(k, {})
            deep_merge(v, n)
        else:
            destination[k] = v

    return destination    

def get_saved_settings():
    setting_file.read()
    return setting_file.settings

def set_setting(name: str, value):
    return setting_file.setSetting(name, value)

def merge_tdp_profiles(tdp_profiles):
    settings = get_saved_settings()

    if not settings.get('tdpProfiles'):
        settings['tdpProfiles'] = {}
    profiles = settings['tdpProfiles']
    deep_merge(tdp_profiles, profiles)

    setting_file.settings['tdpProfiles'] = profiles
    setting_file.commit()

def get_tdp_profile(gameId):
    settings = get_saved_settings()

    if not settings.get('tdpProfiles'):
        settings['tdpProfiles'] = {}
    profiles = settings['tdpProfiles']
    return profiles.get(gameId, {})

def bootstrap_profile(game_id):
    settings = get_saved_settings()
    profiles = settings.get('tdpProfiles', {})
    
    default_profile = profiles.get('default')
    tdp_profile = profiles.get(game_id)

    if not tdp_profile and default_profile:
        merge_tdp_profiles({
            f"{game_id}": default_profile
        })

def per_game_profiles_enabled():
    settings = get_saved_settings()

    return settings.get("enableTdpProfiles", False)

def get_active_tdp_profile(gameId):
    settings = get_saved_settings()

    if settings.get("enableTdpProfiles", False):
        return get_tdp_profile(gameId)
    else:
        return get_tdp_profile('default')

def get_nested_setting(path):
    if not path:
        return None

    settings = get_saved_settings()
    pathValues = deque(path.split('.'))

    result = settings

    while len(pathValues) > 0 and result:
        result = result.get(pathValues.popleft())
    
    return result