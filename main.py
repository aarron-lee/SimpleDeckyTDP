# import os
import decky_plugin
import logging
import os
from plugin_settings import setting_file
from cpu_utils import ryzenadj


class Plugin:
    # A normal method. It can be called from JavaScript using call_plugin_function("method_1", argument1, argument2)
    async def add(self, left, right):
        return left + right

    async def log_info(self, info):
        logging.info(info)

    async def get_settings(self):
        try:
            current_settings = setting_file.read()
            return setting_file.settings
        except Exception as e:
            logging.error(e)

    async def set_setting(self, name: str, value):
        try:
            return setting_file.setSetting(name, value)
        except Exception as e:
            logging.error(e)
            
    async def set_poll_tdp(self, currentGameId: str):
            setting_file.read()
            settings = setting_file.settings

            default_tdp = settings.get('tdpProfiles', {}).get('default', {}).get('tdp', 12)

            if settings.get('enableTdpProfiles'):
                game_tdp = settings.get('tdpProfiles', {}).get(currentGameId, {}).get('tdp', default_tdp)
                ryzenadj(game_tdp)
            else:
                ryzenadj(default_tdp)

            return True            

    async def save_tdp(self, profileName: str, value):
        try:
            setting_file.read()
            if not setting_file.settings.get('tdpProfiles'):
                setting_file.settings['tdpProfiles'] = {};
            tdp_profiles = setting_file.settings['tdpProfiles']
            if not tdp_profiles.get(profileName):
                tdp_profiles[profileName] = {}

            setting_file.settings['tdpProfiles'][profileName]['tdp'] = value
            
            # save to settings file
            setting_file.commit()

            # set tdp via ryzenadj
            return ryzenadj(value)
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
