import os
import shutil

# The decky plugin module is located at decky-loader/plugin
# For easy intellisense checkout the decky-loader code one directory up
# or add the `decky-loader/plugin` path to `python.analysis.extraPaths` in `.vscode/settings.json`
import decky_plugin

import logging
import subprocess
import glob
import os

# bazzite
# RYZENADJ = "/usr/sbin/ryzenadj"

try:
    LOG_LOCATION = f"/tmp/simpleTDP.log"
    logging.basicConfig(
        level = logging.INFO,
        filename = LOG_LOCATION,
        format="[%(asctime)s | %(filename)s:%(lineno)s:%(funcName)s] %(levelname)s: %(message)s",
        filemode = 'w',
        force = True)
except Exception as e:
    logging.error(f"exception|{e}")


from settings import SettingsManager

settings_directory = os.environ["DECKY_PLUGIN_SETTINGS_DIR"]
settings_path = os.path.join(settings_directory, 'settings.json')
setting_file = SettingsManager(name="settings", settings_directory=settings_directory)
setting_file.read()

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

    async def set_tdp(self, profileName: str, value):
        try:
            # save to settings file
            # setting_file.read()
            # logging.info(setting_file.settings)
            # if not setting_file.settings['tdpProfiles']:
            #     setting_file.setSetting('tdpProfiles', {})
            # setting_file.read()

            # setting_file.settings['tdpProfiles'][profileName]['tdp'] = value
            # setting_file.commit()

            # set tdp via ryzenadj
            tdp = value*1000

            RYZENADJ_PATH = shutil.which('ryzenadj')

            if RYZENADJ_PATH:
                commands = [RYZENADJ_PATH, '--stapm-limit', f"{tdp}", '--fast-limit', f"{tdp}", '--slow-limit', f"{tdp}"]

                command = " ".join(commands)
                results = os.system(command)

                return True

            return False
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
