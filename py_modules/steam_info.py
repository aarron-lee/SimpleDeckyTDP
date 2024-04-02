import os
import decky_plugin

STEAM_PID = f"{decky_plugin.DECKY_USER_HOME}/.steam/steam.pid"

def is_steam_running():
  pid = None
  try:
    with open(STEAM_PID) as f:
      pid = f.read().strip()
      steam_cmd_path = f"/proc/{pid}/cmdline"
      if not os.path.exists(steam_cmd_path):
        return False
  except Exception as e:
    return False
  return True