import logging
import os
from settings import SettingsManager

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

def set_all_tdp_profiles(tdp_profiles):
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

