import decky_plugin
import power_utils
from plugin_settings import merge_tdp_profiles, get_saved_settings

def migrate_power_control():
  try:
    settings = get_saved_settings()
    if not settings.get('tdpProfiles'):
      settings['tdpProfiles'] = {}
    tdp_profiles = settings.get('tdpProfiles')

    for game_id in tdp_profiles:
      profile = tdp_profiles[game_id]
      if not profile.get('epp'):
        profile['epp'] = power_utils.RECOMMENDED_EPP
      if not profile.get('powerGovernor'):
        profile['powerGovernor'] = power_utils.RECOMMENDED_GOVERNOR
    
    merge_tdp_profiles(tdp_profiles)
  except Exception as e:
    decky_plugin.logger.error(f"{__name__} error while setting default power control values {e}")