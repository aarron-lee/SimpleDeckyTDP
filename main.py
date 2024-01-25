import decky_plugin
import plugin_update
import logging
import file_timeout
import advanced_options
import power_utils
import cpu_utils
from plugin_settings import merge_tdp_profiles, get_saved_settings, get_tdp_profile, get_active_tdp_profile, per_game_profiles_enabled, set_setting as persist_setting
from gpu_utils import get_gpu_frequency_range
import steam_patch
import migrations

class Plugin:

  async def log_info(self, info):
    logging.info(info)

  async def get_power_control_info(self):
    response = {
      'powerControlsEnabled': False,
      'supportsEpp': False,
      "eppOptions": [],
      "powerGovernorOptions": [],
      "scalingDriver": '',
    }
    try:
      with file_timeout.time_limit(5):
        response['scalingDriver'] = cpu_utils.get_scaling_driver()
        response['powerControlsEnabled'] = power_utils.power_controls_enabled()
        pstate_status = cpu_utils.get_pstate_status()
        if pstate_status:
          response['pstateStatus'] = pstate_status
        if response['powerControlsEnabled']:
          supports_epp = power_utils.supports_epp()
          if supports_epp:
            response['supportsEpp'] = True
            # eppOptions aren't available on performance governor
            power_utils.set_recommended_options()
            response['eppOptions'] = power_utils.get_available_epp_options()

          response['powerGovernorOptions'] = power_utils.get_available_governor_options()
    except Exception as e:
      decky_plugin.logger.error(f'{__name__} get_power_control_info {e}')
    return response

  async def get_settings(self):
    try:
      settings = get_saved_settings()
      try:
        with file_timeout.time_limit(5):
          settings['advancedOptions'] = advanced_options.get_advanced_options()

          gpu_min, gpu_max = get_gpu_frequency_range()
          if (gpu_min and gpu_max):
            settings['minGpuFrequency'] = gpu_min
            settings['maxGpuFrequency'] = gpu_max
      except Exception as e:
        logging.error(f"main#get_settings failed to get info {e}")

      settings['pluginVersionNum'] = f'{decky_plugin.DECKY_PLUGIN_VERSION}'
      return settings
    except Exception as e:
      logging.error(f"get_settings failed to get settings {e}")

  async def set_setting(self, name: str, value):
    try:
      return persist_setting(name, value)
    except Exception as e:
      logging.error(f"error failed to set_setting {name}={value} {e}")

  async def set_values_for_game_id(self, gameId):
    steam_patch.set_values_for_game_id(gameId)

  async def set_steam_patch_values_for_game_id(self, gameId):
    enabled = per_game_profiles_enabled()
    steam_patch.set_steam_patch_values_for_game_id(gameId, enabled)
  
  async def persist_tdp(self, tdp, gameId):
    steam_patch.persist_tdp(tdp, gameId)

  async def persist_gpu(self, minGpuFrequency, maxGpuFrequency, gameId):
    steam_patch.persist_gpu(minGpuFrequency, maxGpuFrequency, gameId)

  async def set_power_governor(self, powerGovernor, gameId):
    tdp_profiles = {
      f'{gameId}': {
        'powerGovernor': powerGovernor
      }
    }
    merge_tdp_profiles(tdp_profiles)

    tdp_profile = get_tdp_profile(gameId)
    if tdp_profile:
      steam_patch.set_power_governor_for_tdp_profile(tdp_profile)

  async def set_epp(self, epp, gameId):
    tdp_profiles = {
      f'{gameId}': {
        'epp': epp
      }
    }
    merge_tdp_profiles(tdp_profiles)

    tdp_profile = get_tdp_profile(gameId)
    if tdp_profile:
      steam_patch.set_epp_for_tdp_profile(tdp_profile)

  async def persist_cpu_boost(self, cpuBoost, gameId):
    tdp_profiles = {
      f'{gameId}': {
        'cpuBoost': cpuBoost
      }
    }
    merge_tdp_profiles(tdp_profiles)

    return cpu_utils.set_cpu_boost(cpuBoost)

  async def poll_tdp(self, currentGameId: str):
    settings = get_saved_settings()
    tdp_profile = get_tdp_profile('default')

    if settings.get('enableTdpProfiles'):
      tdp_profile = get_tdp_profile(currentGameId) or tdp_profile

    try:
      with file_timeout.time_limit(3):
        steam_patch.set_values_for_tdp_profile(tdp_profile)
    except Exception as e:
      logging.error(f'main#poll_tdp file timeout {e}')
      return False

    return True      

  async def save_tdp(self, tdpProfiles, currentGameId, advanced):
    try:
      merge_tdp_profiles(tdpProfiles)
      persist_setting('advanced', advanced)

      tdp_profile = get_active_tdp_profile(currentGameId)

      try:
        with file_timeout.time_limit(3):
          steam_patch.set_values_for_tdp_profile(tdp_profile)
      except Exception as e:
        logging.error(f'main#save_tdp file timeout {e}')

    except Exception as e:
      logging.error(e)

  async def ota_update(self):
    # trigger ota update
    try:
      with file_timeout.time_limit(15):
        plugin_update.ota_update()
    except Exception as e:
      logging.error(e)

  # Asyncio-compatible long-running code, executed in a task when the plugin is loaded
  async def _main(self):
    decky_plugin.logger.info("Hello World!")

  # Function called first during the unload process, utilize this to handle your plugin being removed
  async def _unload(self):
    decky_plugin.logger.info("Goodbye World!")
    pass

  # Migrations that should be performed before entering `_main()`.
  async def _migration(self):
    decky_plugin.logger.info("Migrating")

    migrations.migrate_power_control()

    # Here's a migration example for logs:
    # - `~/.config/decky-template/template.log` will be migrated to `decky_plugin.DECKY_PLUGIN_LOG_DIR/template.log`
    # decky_plugin.migrate_logs(os.path.join(decky_plugin.DECKY_USER_HOME,
    #                    ".config", "decky-template", "template.log"))
    # Here's a migration example for settings:
    # - `~/homebrew/settings/template.json` is migrated to `decky_plugin.DECKY_PLUGIN_SETTINGS_DIR/template.json`
    # - `~/.config/decky-template/` all files and directories under this root are migrated to `decky_plugin.DECKY_PLUGIN_SETTINGS_DIR/`
    # decky_plugin.migrate_settings(
    #   os.path.join(decky_plugin.DECKY_HOME, "settings", "template.json"),
    #   os.path.join(decky_plugin.DECKY_USER_HOME, ".config", "decky-template"))
    # Here's a migration example for runtime data:
    # - `~/homebrew/template/` all files and directories under this root are migrated to `decky_plugin.DECKY_PLUGIN_RUNTIME_DIR/`
    # - `~/.local/share/decky-template/` all files and directories under this root are migrated to `decky_plugin.DECKY_PLUGIN_RUNTIME_DIR/`
    # decky_plugin.migrate_runtime(
    #   os.path.join(decky_plugin.DECKY_HOME, "template"),
    #   os.path.join(decky_plugin.DECKY_USER_HOME, ".local", "share", "decky-template"))
