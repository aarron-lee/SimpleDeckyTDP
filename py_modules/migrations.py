import decky_plugin
import power_utils
from plugin_settings import merge_tdp_profiles, get_saved_settings, set_setting

def migrate_smt():
  try:
    settings = get_saved_settings()
    if not settings.get('tdpProfiles'):
      settings['tdpProfiles'] = {}
    tdp_profiles = settings.get('tdpProfiles')

    for game_id in tdp_profiles:
      profile = tdp_profiles[game_id]

      smt = profile.get('smt', None)

      if not isinstance(smt, bool):
        profile['smt'] = True
    
    merge_tdp_profiles(tdp_profiles)
  except Exception as e:
    decky_plugin.logger.error(f"{__name__} error while setting default smt values {e}")

def disable_steam_patch():
  try:
    settings = get_saved_settings()
    if settings.get('advanced', {}).get('steamPatch', False):
      advanced_settings = settings.get('advanced')
      advanced_settings['steamPatch'] = False
      set_setting('advanced', advanced_settings)
  except Exception as e:
    decky_plugin.logger.error(f"{__name__} error while disabling steam patch {e}")

def migrate_gpu_mode():
  try:
    settings = get_saved_settings()
    if not settings.get('tdpProfiles'):
      settings['tdpProfiles'] = {}
    tdp_profiles = settings.get('tdpProfiles')

    for game_id in tdp_profiles:
      profile = tdp_profiles[game_id]

      mode = profile.get('gpuMode', None)

      if mode == 'DEFAULT':
        profile['gpuMode'] = 'BALANCE'

    merge_tdp_profiles(tdp_profiles)
  except Exception as e:
    decky_plugin.logger.error(f"{__name__} error while setting default smt values {e}")
