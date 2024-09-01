import ac_power
import decky_plugin
import plugin_update
import logging
import time
import file_timeout
import advanced_options
import power_utils
import cpu_utils
import os
from plugin_settings import merge_tdp_profiles, get_saved_settings, get_tdp_profile, get_active_tdp_profile, per_game_profiles_enabled, set_setting as persist_setting
from gpu_utils import get_gpu_frequency_range
import plugin_utils
import migrations
import steam_info

class Plugin:

  async def log_info(self, info):
    logging.info(info)

  async def is_steam_running(self):
    return steam_info.is_steam_running()

  async def get_power_control_info(self):
    response = {
      'powerControlsEnabled': False,
      "eppOptions": [],
      "powerGovernorOptions": [],
      "scalingDriver": '',
      'supportsCpuBoost': False
    }
    try:
      with file_timeout.time_limit(5):
        response['scalingDriver'] = cpu_utils.get_scaling_driver()
        response['supportsCpuBoost'] = cpu_utils.supports_cpu_boost()
        response['powerControlsEnabled'] = power_utils.power_controls_enabled()
        pstate_status = cpu_utils.get_pstate_status()
        if pstate_status:
          response['pstateStatus'] = pstate_status
        if response['powerControlsEnabled']:
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

          settings['supportsCustomAcPowerManagement'] = ac_power.supports_custom_ac_power_management()

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
    plugin_utils.set_values_for_game_id(gameId)

  async def set_steam_patch_values_for_game_id(self, gameId):
    enabled = per_game_profiles_enabled()
    plugin_utils.set_steam_patch_values_for_game_id(gameId, enabled)
  
  async def persist_tdp(self, tdp, gameId):
    plugin_utils.persist_tdp(tdp, gameId)

  async def persist_gpu(self, minGpuFrequency, maxGpuFrequency, gameId):
    plugin_utils.persist_gpu(minGpuFrequency, maxGpuFrequency, gameId)

  async def set_power_governor(self, powerGovernorInfo, gameId):
    scaling_driver = powerGovernorInfo.get('scalingDriver')
    powerGovernor = powerGovernorInfo.get('powerGovernor')

    tdp_profiles = {
      f'{gameId}': {
        'powerControls': {
          f'{scaling_driver}': {
            'powerGovernor': powerGovernor
          }
        }
      }
    }
    merge_tdp_profiles(tdp_profiles)

    tdp_profile = get_tdp_profile(gameId)
    if tdp_profile:
      plugin_utils.set_power_governor_for_tdp_profile(tdp_profile)

  async def set_epp(self, eppInfo, gameId):
    scaling_driver = eppInfo.get('scalingDriver')
    epp = eppInfo.get('epp')

    tdp_profiles = {
      f'{gameId}': {
        'powerControls': {
          f'{scaling_driver}': {
            'epp': epp
          }
        }
      }
    }
    merge_tdp_profiles(tdp_profiles)

    tdp_profile = get_tdp_profile(gameId)
    if tdp_profile and scaling_driver and epp:
      plugin_utils.set_epp_for_tdp_profile(tdp_profile)

  async def persist_smt(self, smt, gameId):
      tdp_profiles = {
          f'{gameId}': {
              'smt': smt
          }
      }
      merge_tdp_profiles(tdp_profiles)

      tdp_profile = get_tdp_profile(gameId)

      cpu_utils.set_smt(smt)
      time.sleep(0.3)
      plugin_utils.set_power_governor_for_tdp_profile(tdp_profile)

  async def set_smt(self, smt):
      cpu_utils.set_smt(smt)

  async def persist_cpu_boost(self, cpuBoost, gameId):
    tdp_profiles = {
      f'{gameId}': {
        'cpuBoost': cpuBoost
      }
    }
    merge_tdp_profiles(tdp_profiles)

    return cpu_utils.set_cpu_boost(cpuBoost)
    # tdp_profile = get_tdp_profile(gameId)
    # time.sleep(0.3)
    # # changing cpu_boost can change governor automatically from amd-pstate-epp to amd-pstate
    # plugin_utils.set_power_governor_for_tdp_profile(tdp_profile)
    # return True


  async def poll_tdp(self, currentGameId: str):
    settings = get_saved_settings()
    tdp_profile = get_tdp_profile('default')

    if settings.get('enableTdpProfiles'):
      tdp_profile = get_tdp_profile(currentGameId) or tdp_profile

    try:
      with file_timeout.time_limit(3):
        plugin_utils.set_values_for_tdp_profile(tdp_profile)
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
          plugin_utils.set_values_for_tdp_profile(tdp_profile)
      except Exception as e:
        logging.error(f'main#save_tdp file timeout {e}')

    except Exception as e:
      logging.error(e)

  async def set_max_tdp(self):
    settings = get_saved_settings()
    max_tdp = settings.get('maxTdp')
    if (max_tdp and max_tdp > 10):
      cpu_utils.ryzenadj(max_tdp)

  async def ota_update(self):
    # trigger ota update
    try:
      with file_timeout.time_limit(15):
        plugin_update.ota_update()
    except Exception as e:
      logging.error(e)

  async def supports_custom_ac_power_management(self):
    return ac_power.supports_custom_ac_power_management()

  async def get_ac_power_status(self):
    ac_power_path = ac_power.custom_ac_power_management_path()

    if ac_power_path and os.path.exists(ac_power_path):
      with open(ac_power_path, 'r') as file:
        current_status = file.read().strip()
        file.close()
        return current_status
    return None

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

    migrations.migrate_smt()
    migrations.disable_steam_patch()

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
