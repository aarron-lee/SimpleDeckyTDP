import os
import decky_plugin

AC_POWER_PATH = None

def custom_ac_power_management_path():
  global AC_POWER_PATH

  if bool(AC_POWER_PATH):
    return AC_POWER_PATH

  filename = None
  try:
    for n in os.listdir("/sys/class/power_supply"):
      if n.startswith("AC") or n.startswith("ADP"):
        filename = n

    if filename is None:
      return None
    AC_POWER_PATH = f'/sys/class/power_supply/{filename}/online'
    return AC_POWER_PATH
  except Exception as e:
    decky_plugin.logger.error(f"{__name__} custom ac power path error {e}")
    return None

def supports_custom_ac_power_management():
  ac_power_path = custom_ac_power_management_path()

  return bool(ac_power_path) and os.path.exists(ac_power_path)