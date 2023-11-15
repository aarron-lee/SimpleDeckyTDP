import subprocess
import os
import asyncio
import shutil
import decky_plugin
from pathlib import Path
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

def extract_tdp_from_settings(gameId, settings):
    tdpProfiles = settings.get('tdpProfiles', {})
    tdpProfile = tdpProfiles.get(gameId, {})
    return tdpProfile["tdp"]

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

def in_game_mode():
    cmd = "cat /proc/*/comm | grep gamescope-ses*"
    output = subprocess.Popen(cmd,
                              stdout=subprocess.PIPE,
                              encoding='utf-8',
                              shell=True
                            ).communicate()[0]
    running_gamescope = len(output.strip()) > 0
    if(running_gamescope):
        return True
    
    return False

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
            return ryzenadj(tdp)
    
    # async def save_current_game_info(self, changes):#gameId: str, displayName: str):
    async def save_current_game_info(self, gameId: str, displayName: str):
        try:
            setting_file.read()

            setting_file.settings['currentGameId'] = gameId
            if not setting_file.settings.get('gameDisplayNames'):
                setting_file.settings['gameDisplayNames'] = {};

            setting_file.settings['gameDisplayNames'][gameId] = displayName
            
            # save to settings file
            setting_file.commit()
        except Exception as e:
            logging.error(e)

    async def save_tdp(self, profileName: str, tdp):
        try:
            setting_file.read()
            if not setting_file.settings.get('tdpProfiles'):
                setting_file.settings['tdpProfiles'] = {};
            tdp_profiles = setting_file.settings['tdpProfiles']
            if not tdp_profiles.get(profileName):
                tdp_profiles[profileName] = {}

            setting_file.settings['tdpProfiles'][profileName]['tdp'] = tdp
            
            # save to settings file
            setting_file.commit()

            # set tdp via ryzenadj
            return ryzenadj(tdp)
        except Exception as e:
            logging.error(e)

    @asyncio.coroutine
    async def watchdog(self):

        logging.info('watchdog started')
        poll_rate = 3
        gamescope_session_is_running = in_game_mode()

        try:
            while True:
                if gamescope_session_is_running:
                    gamescope_session_is_running = in_game_mode()

                    setting_file.read()

                    settings = setting_file.settings

                    if settings.get('pollEnabled'):
                        poll_rate = settings.get('pollRate')/1000

                        tdp_profiles_enabled = settings.get('enableTdpProfiles', False)
                        current_game_id = settings.get('currentGameId', 'default')

                        default_tdp = extract_tdp_from_settings('default', settings) or 12

                        if tdp_profiles_enabled and current_game_id:
                            # tdp from game tdp profile
                            game_tdp = extract_tdp_from_settings(current_game_id, settings) or default_tdp

                            ryzenadj(game_tdp)
                        else:
                            # tdp from default profile
                            ryzenadj(default_tdp)

                    await asyncio.sleep(poll_rate)
                else:
                    logging.info("gamescope-session no longer running. entering slower sleep cycles")
                    await asyncio.sleep(15)
        except Exception as e:
            logging.error(e)

    # Asyncio-compatible long-running code, executed in a task when the plugin is loaded
    async def _main(self):
        decky_plugin.logger.info("Hello World!")
        setting_file.setSetting('currentGameId', 'default')
        self._loop = asyncio.get_event_loop()
        self._watch_task = self._loop.create_task(Plugin.watchdog(self))

    # Function called first during the unload process, utilize this to handle your plugin being removed
    async def _unload(self):
        decky_plugin.logger.info("Goodbye World!")
        self._watch_task.cancel()
        self._loop.close()
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
