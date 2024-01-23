# import os
import decky_plugin
import plugin_update
import logging
import os
import file_timeout
import advanced_options
import power_utils
from plugin_settings import merge_tdp_profiles, get_saved_settings, get_tdp_profile, get_active_tdp_profile, set_setting as persist_setting
from cpu_utils import ryzenadj, set_cpu_boost, set_smt
from gpu_utils import get_gpu_frequency_range, set_gpu_frequency
import steam_patch

class Plugin:

    async def log_info(self, info):
        logging.info(info)

    async def get_settings(self):
        try:
            settings = get_saved_settings()
            try:
                with file_timeout.time_limit(5):
                    supports_epp = power_utils.supports_epp()
                    if supports_epp:
                        settings['supportsEpp'] = True
                        settings['recommendedEpp'] = power_utils.RECOMMENDED_EPP
                    settings['recommendedPowerGovernor'] = power_utils.RECOMMENDED_GOVERNOR

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

    async def save_steam_patch_tdp_profile(self, tdpProfiles, gameId, advanced):
        steam_patch.save_steam_patch_tdp_profile(tdpProfiles, gameId, advanced)

    async def set_values_for_game_id(self, gameId):
        steam_patch.set_values_for_game_id(gameId)
    
    async def save_steam_patch_tdp(self, tdp, gameId):
        steam_patch.save_steam_patch_tdp(tdp, gameId)

    async def save_steam_patch_gpu(self, minGpuFrequency, maxGpuFrequency, gameId):
        steam_patch.save_steam_patch_gpu(minGpuFrequency, maxGpuFrequency, gameId)

    async def set_power_governor(self, powerGovernor, gameId):
        tdp_profiles = {
            f'{gameId}': {
                'powerGovernor': powerGovernor
            }
        }
        merge_tdp_profiles(tdp_profiles)

        return power_utils.set_power_governor(powerGovernor)

    async def poll_tdp(self, currentGameId: str):
        settings = get_saved_settings()
        default_tdp_profile = get_tdp_profile('default')
        smt = default_tdp_profile.get('smt', True)
        cpu_boost = default_tdp_profile.get('cpuBoost', True)
        tdp = default_tdp_profile.get('tdp', 12)

        steam_patch_enabled = advanced_options.get_setting(
            advanced_options.DefaultSettings.ENABLE_STEAM_PATCH.value
        )

        if settings.get('enableTdpProfiles'):
            tdp_profile = get_tdp_profile(currentGameId)
            cpu_boost = tdp_profile.get('cpuBoost', cpu_boost)
            tdp = tdp_profile.get('tdp', tdp)
            smt = tdp_profile.get('smt', smt)

        try:
            with file_timeout.time_limit(3):
                if not steam_patch_enabled:
                    ryzenadj(tdp)
                set_smt(smt)
                set_cpu_boost(cpu_boost)
        except Exception as e:
            logging.error(f'main#poll_tdp file timeout {e}')
            return False

        return True            

    async def save_tdp(self, tdpProfiles, currentGameId, advanced):
        try:
            merge_tdp_profiles(tdpProfiles)
            persist_setting('advanced', advanced)

            steam_patch_enabled = advanced_options.get_setting(
                advanced_options.DefaultSettings.ENABLE_STEAM_PATCH.value
            )

            tdp_profile = get_active_tdp_profile(currentGameId)
            tdp = tdp_profile.get('tdp', 12)
            smt = tdp_profile.get('smt', True)
            cpu_boost = tdp_profile.get('cpuBoost', True)

            try:
                with file_timeout.time_limit(3):
                    if not steam_patch_enabled:
                        ryzenadj(tdp)
                    set_smt(smt)
                    set_cpu_boost(cpu_boost)
                    if not steam_patch_enabled:
                        set_gpu_frequency(currentGameId)
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
        # Here's a migration example for logs:
        # - `~/.config/decky-template/template.log` will be migrated to `decky_plugin.DECKY_PLUGIN_LOG_DIR/template.log`
        decky_plugin.migrate_logs(os.path.join(decky_plugin.DECKY_USER_HOME,
                                               ".config", "decky-template", "template.log"))
        # Here's a migration example for settings:
        # - `~/homebrew/settings/template.json` is migrated to `decky_plugin.DECKY_PLUGIN_SETTINGS_DIR/template.json`
        # - `~/.config/decky-template/` all files and directories under this root are migrated to `decky_plugin.DECKY_PLUGIN_SETTINGS_DIR/`
        decky_plugin.migrate_settings(
            os.path.join(decky_plugin.DECKY_HOME, "settings", "template.json"),
            os.path.join(decky_plugin.DECKY_USER_HOME, ".config", "decky-template"))
        # Here's a migration example for runtime data:
        # - `~/homebrew/template/` all files and directories under this root are migrated to `decky_plugin.DECKY_PLUGIN_RUNTIME_DIR/`
        # - `~/.local/share/decky-template/` all files and directories under this root are migrated to `decky_plugin.DECKY_PLUGIN_RUNTIME_DIR/`
        decky_plugin.migrate_runtime(
            os.path.join(decky_plugin.DECKY_HOME, "template"),
            os.path.join(decky_plugin.DECKY_USER_HOME, ".local", "share", "decky-template"))
