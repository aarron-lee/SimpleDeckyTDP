# import os
import decky_plugin
import logging
import os
from plugin_settings import set_setting, set_all_tdp_profiles, get_saved_settings, get_tdp_profile, get_active_tdp_profile
from cpu_utils import ryzenadj, set_cpu_boost, set_smt
from gpu_utils import get_gpu_frequency_range


class Plugin:
    # A normal method. It can be called from JavaScript using call_plugin_function("method_1", argument1, argument2)
    async def add(self, left, right):
        return left + right

    async def log_info(self, info):
        logging.info(info)

    async def get_settings(self):
        try:
            settings = get_saved_settings()
            try:
                gpu_min, gpu_max = get_gpu_frequency_range()
                if (gpu_min and gpu_max):
                    settings['minGpuFrequency'] = gpu_min
                    settings['maxGpuFrequency'] = gpu_max
            except Exception as e:
                logging.error(f"get_settings failed to get GPU clocks {e}")

            return settings
        except Exception as e:
            logging.error(f"get_settings failed to get settings {e}")

    async def set_setting(self, name: str, value):
        try:
            return set_setting(name, value)
        except Exception as e:
            logging.error(f"error failed to set_setting {name}={value} {e}")
        
            
    async def poll_tdp(self, currentGameId: str):
            settings = get_saved_settings()
            default_tdp_profile = get_tdp_profile('default')
            default_smt = default_tdp_profile.get('smt', True)
            default_cpu_boost = default_tdp_profile.get('cpuBoost', True)
            default_tdp = default_tdp_profile.get('tdp', 12)

            if settings.get('enableTdpProfiles'):
                tdp_profile = get_tdp_profile(currentGameId)
                cpu_boost = tdp_profile.get('cpuBoost', default_cpu_boost)
                game_tdp = tdp_profile.get('tdp', default_tdp)
                game_smt = tdp_profile.get('smt', default_smt)

                set_cpu_boost(cpu_boost)
                set_smt(game_smt)
                ryzenadj(game_tdp)
            else:
                set_smt(default_smt)
                set_cpu_boost(default_cpu_boost)
                ryzenadj(default_tdp)

            return True            

    async def save_tdp(self, tdpProfiles, currentGameId):
        set_all_tdp_profiles(tdpProfiles)
        try:
            tdp_profile = get_active_tdp_profile(currentGameId)
            tdp = tdp_profile.get('tdp', 12)
            smt = tdp_profile.get('smt', True)
            cpu_boost = tdp_profile.get('cpuBoost', True)

            set_smt(smt)
            set_cpu_boost(cpu_boost)

            # set tdp via ryzenadj
            return ryzenadj(tdp)
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
