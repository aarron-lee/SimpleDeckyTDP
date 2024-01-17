# import os
import decky_plugin
import logging
import os
import file_timeout
import advanced_options
from plugin_settings import set_all_tdp_profiles, get_saved_settings, get_tdp_profile, get_active_tdp_profile, set_setting as persist_setting
from cpu_utils import ryzenadj, set_cpu_boost, set_smt
from gpu_utils import get_gpu_frequency_range, set_gpu_frequency


class Plugin:

    async def log_info(self, info):
        logging.info(info)

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
        
            
    async def poll_tdp(self, currentGameId: str):
            settings = get_saved_settings()
            default_tdp_profile = get_tdp_profile('default')
            smt = default_tdp_profile.get('smt', True)
            cpu_boost = default_tdp_profile.get('cpuBoost', True)
            tdp = default_tdp_profile.get('tdp', 12)

            tdp_control_enabled = advanced_options.get_setting(
                advanced_options.DefaultSettings.ENABLE_TDP_CONTROL.value
            )

            if settings.get('enableTdpProfiles'):
                tdp_profile = get_tdp_profile(currentGameId)
                cpu_boost = tdp_profile.get('cpuBoost', cpu_boost)
                tdp = tdp_profile.get('tdp', tdp)
                smt = tdp_profile.get('smt', smt)

            try:
                with file_timeout.time_limit(3):
                    if tdp_control_enabled:
                        ryzenadj(tdp)
                    set_smt(smt)
                    set_cpu_boost(cpu_boost)
            except Exception as e:
                logging.error(f'main#poll_tdp file timeout {e}')
                return False

            return True            

    async def save_tdp(self, tdpProfiles, currentGameId, advanced):
        try:
            set_all_tdp_profiles(tdpProfiles)
            persist_setting('advanced', advanced)

            tdp_control_enabled = advanced_options.get_setting(
                advanced_options.DefaultSettings.ENABLE_TDP_CONTROL.value
            )

            tdp_profile = get_active_tdp_profile(currentGameId)
            tdp = tdp_profile.get('tdp', 12)
            smt = tdp_profile.get('smt', True)
            cpu_boost = tdp_profile.get('cpuBoost', True)

            try:
                with file_timeout.time_limit(3):
                    if tdp_control_enabled:
                        ryzenadj(tdp)
                    set_smt(smt)
                    set_cpu_boost(cpu_boost)
                    set_gpu_frequency(currentGameId)
            except Exception as e:
                logging.error(f'main#save_tdp file timeout {e}')

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
