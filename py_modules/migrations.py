import decky_plugin
from plugin_settings import merge_tdp_profiles, get_saved_settings, set_setting
import device_utils
import ryzenadj

def check_ryzenadj_coall_support(force_check=False):
  if not device_utils.is_intel():
    try:
      settings = get_saved_settings()
      if force_check or settings.get('supportsRyzenadjCoall', None) == None:
        undervolt_supported = bool(ryzenadj._set_ryzenadj_undervolt(0))

        set_setting('supportsRyzenadjCoall', undervolt_supported)
    except Exception as e:
      decky_plugin.logger.error(f"{__name__} error while checking undervolt support {e}")

# def migrate_smt():
#   try:
#     settings = get_saved_settings()
#     if not settings.get('tdpProfiles'):
#       settings['tdpProfiles'] = {}
#     tdp_profiles = settings.get('tdpProfiles')

#     for game_id in tdp_profiles:
#       profile = tdp_profiles[game_id]

#       smt = profile.get('smt', None)

#       if not isinstance(smt, bool):
#         profile['smt'] = True

#     merge_tdp_profiles(tdp_profiles)
#   except Exception as e:
#     decky_plugin.logger.error(f"{__name__} error while setting default smt values {e}")

# def migrate_gpu_mode():
#   try:
#     settings = get_saved_settings()
#     if not settings.get('tdpProfiles'):
#       settings['tdpProfiles'] = {}
#     tdp_profiles = settings.get('tdpProfiles')

#     for game_id in tdp_profiles:
#       profile = tdp_profiles[game_id]

#       mode = profile.get('gpuMode', None)

#       if mode == 'PERFORMANCE':
#         profile['gpuMode'] = 'BALANCE'

#     merge_tdp_profiles(tdp_profiles)
#   except Exception as e:
#     decky_plugin.logger.error(f"{__name__} error while setting default smt values {e}")
