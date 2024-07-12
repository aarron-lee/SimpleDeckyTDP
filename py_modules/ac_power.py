import os
from plugin_enums import AcPowerPaths, Devices
from advanced_options import get_device_name

ACAD_DEVICES = [
  Devices.MINISFORUM_V3.value,
  Devices.LEGION_GO.value
]
ADP1_DEVICES = [
#   Devices.GPD_WM2.value
]

def custom_ac_power_management_path():
  device_name = get_device_name()

  ac_power_online_path = None

  if device_name in ACAD_DEVICES:
    ac_power_online_path = AcPowerPaths.ACAD.value
  if device_name in ADP1_DEVICES:
    ac_power_online_path = AcPowerPaths.ADP1.value

  return ac_power_online_path

def supports_custom_ac_power_management():
  ac_power_path = custom_ac_power_management_path()

  return bool(ac_power_path) and os.path.exists(ac_power_path)