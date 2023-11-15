import os
import asyncio
import shutil
import decky_plugin
import logging
import os
from settings import SettingsManager

RYZENADJ_PATH = shutil.which('ryzenadj')

def ryzenadj(tdp: int):
    t = tdp*1000
    if RYZENADJ_PATH:
        commands = [RYZENADJ_PATH, '--stapm-limit', f"{t}", '--fast-limit', f"{t}", '--slow-limit', f"{t}"]

        command = " ".join(commands)
        results = os.system(command)
        return True
    return False

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

settings_directory = os.environ["DECKY_PLUGIN_SETTINGS_DIR"]
settings_path = os.path.join(settings_directory, 'settings.json')
setting_file = SettingsManager(name="settings", settings_directory=settings_directory)
setting_file.read()

class Plugin:
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

    async def set_tdp(self, tdp: int):
            # set tdp via ryzenadj
            tdp = tdp*1000

            if RYZENADJ_PATH:
                commands = [RYZENADJ_PATH, '--stapm-limit', f"{tdp}", '--fast-limit', f"{tdp}", '--slow-limit', f"{tdp}"]

                command = " ".join(commands)
                results = os.system(command)

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
            tdp = value*1000

            if RYZENADJ_PATH:
                commands = [RYZENADJ_PATH, '--stapm-limit', f"{tdp}", '--fast-limit', f"{tdp}", '--slow-limit', f"{tdp}"]

                command = " ".join(commands)
                results = os.system(command)

                return True

            return False
        except Exception as e:
            logging.error(e)

    @asyncio.coroutine
    async def watchdog(self):
        logging.info('watchdog started')
        poll_rate = 3

        while True:
            # do stuff
            logging.info('loop!')

            setting_file.read()

            settings = setting_file.settings

            if settings.get('pollEnabled'):
                poll_rate = settings.get('pollRate')/1000
                gameId = 'default'
                tdpProfiles = settings.get('tdpProfiles', {})
                tdpProfile = tdpProfiles.get(gameId, {})

                tdp = tdpProfile.get('tdp', 12)

                ryzenadj(tdp)

            logging.info(settings)

            await asyncio.sleep(poll_rate)

    # Asyncio-compatible long-running code, executed in a task when the plugin is loaded
    async def _main(self):
        decky_plugin.logger.info("Hello World!")
        loop = asyncio.get_event_loop()
        self._watch_task = loop.create_task(Plugin.watchdog(self))

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
