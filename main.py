import ac_power
import decky_plugin
import plugin_update
import time
import plugin_timeout
import advanced_options
import power_utils
import cpu_utils
import os
from plugin_settings import merge_tdp_profiles, get_saved_settings, get_tdp_profile, get_active_tdp_profile, per_game_profiles_enabled, set_setting as persist_setting
from gpu_utils import get_gpu_frequency_range
import plugin_utils
import migrations
import steam_info
import device_utils
import charge_limit

class Plugin:

  async def log_info(self, info):
    decky_plugin.logger.info(info)

  async def is_steam_running(self):
    return steam_info.is_steam_running()

  async def get_power_control_info(self):
    response = {
      'powerControlsEnabled': False,
      "eppOptions": [],
      "powerGovernorOptions": [],
      "scalingDriver": '',
      'supportsCpuBoost': False,
      'deviceName': ''
    }
    try:
      with plugin_timeout.time_limit(5):
        pstate_status = cpu_utils.get_pstate_status()
        response['pstateStatus'] = pstate_status
        if pstate_status == 'passive' and device_utils.is_intel():
          cpu_utils.set_pstate_active()
          response['pstateStatus'] = 'active'

        response['deviceName'] = device_utils.get_device_name()
        response['supportsSmt'] = cpu_utils.supports_smt()
        response['scalingDriver'] = cpu_utils.get_scaling_driver()
        response['supportsCpuBoost'] = cpu_utils.supports_cpu_boost()
        response['powerControlsEnabled'] = power_utils.power_controls_enabled()
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
        with plugin_timeout.time_limit(5):
          settings['advancedOptions'] = advanced_options.get_advanced_options()

          settings['supportsCustomAcPowerManagement'] = ac_power.supports_custom_ac_power_management()
          settings['cpuVendor'] = device_utils.get_cpu_manufacturer()

          if device_utils.is_intel():
            # hardcode min/max TDP values for Intel
            min_tdp, max_tdp = cpu_utils.get_intel_tdp_limits()
            settings['maxTdp'] = max_tdp
            settings['minTdp'] = min_tdp

          gpu_min, gpu_max = get_gpu_frequency_range()
          if (gpu_min and gpu_max):
            settings['minGpuFrequency'] = gpu_min
            settings['maxGpuFrequency'] = gpu_max
      except Exception as e:
        decky_plugin.logger.error(f"main#get_settings failed to get info {e}")

      settings['pluginVersionNum'] = f'{decky_plugin.DECKY_PLUGIN_VERSION}'
      return settings
    except Exception as e:
      decky_plugin.logger.error(f"get_settings failed to get settings {e}")

  async def set_setting(self, name: str, value):
    try:
      if name == "advanced":
        advanced_options.handle_advanced_option_change(value)

      return persist_setting(name, value)
    except Exception as e:
      decky_plugin.logger.error(f"error failed to set_setting {name}={value} {e}")

  async def set_values_for_game_id(self, gameId):
    plugin_utils.set_values_for_game_id(gameId)
  
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
      plugin_utils.set_cpu_boost_for_tdp_profile(tdp_profile)


  async def on_suspend(self):
    decky_plugin.logger.info(f'main#on_suspend started')
    cpu_utils.set_smt(True)
    decky_plugin.logger.info(f'main#on_suspend complete')

  async def persist_cpu_boost(self, cpuBoost, gameId):
    tdp_profiles = {
      f'{gameId}': {
        'cpuBoost': cpuBoost
      }
    }
    merge_tdp_profiles(tdp_profiles)

    return plugin_utils.set_values_for_game_id(gameId)
  
  async def get_latest_version_num(self):
    return plugin_update.get_latest_version()

  async def poll_tdp(self, currentGameId: str):
    settings = get_saved_settings()
    tdp_profile = get_tdp_profile('default')

    if settings.get('enableTdpProfiles'):
      tdp_profile = get_tdp_profile(currentGameId) or tdp_profile

    try:
      with plugin_timeout.time_limit(3):
        plugin_utils.set_values_for_tdp_profile(tdp_profile)
    except Exception as e:
      decky_plugin.logger.error(f'main#poll_tdp file timeout {e}')
      return False

    return True      

  async def save_tdp(self, tdpProfiles, currentGameId, advanced):
    try:
      merge_tdp_profiles(tdpProfiles)
      persist_setting('advanced', advanced)

      tdp_profile = get_active_tdp_profile(currentGameId)

      try:
        with plugin_timeout.time_limit(3):
          plugin_utils.set_values_for_tdp_profile(tdp_profile)
      except Exception as e:
        decky_plugin.logger.error(f'main#save_tdp file timeout {e}')

    except Exception as e:
      decky_plugin.logger.error(e)

  async def set_max_tdp(self):
    settings = get_saved_settings()
    max_tdp = settings.get('maxTdp')
    if (max_tdp and max_tdp > 10):
      cpu_utils.set_tdp(max_tdp)

  async def ota_update(self):
    # trigger ota update
    try:
      with plugin_timeout.time_limit(15):
        return plugin_update.ota_update()
    except Exception as e:
      decky_plugin.logger.error(e)

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
    decky_plugin.logger.info("SimpleDeckyTDP Starting")
    if charge_limit.supports_charge_limit():
      charge_limit.initialize_charge_limit()

  # Function called first during the unload process, utilize this to handle your plugin being removed
  async def _unload(self):
    decky_plugin.logger.info("SimpleDeckyTDP Unloading")
    pass

  async def _uninstall(self):
    decky_plugin.logger.info("SimpleDeckyTDP Uninstalling")
    pass

  # Migrations that should be performed before entering `_main()`.
  async def _migration(self):
    decky_plugin.logger.info("Migrating")

    # migrations.migrate_smt()
    # migrations.migrate_gpu_mode()
    migrations.check_ryzenadj_coall_support()
