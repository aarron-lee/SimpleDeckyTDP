from enum import Enum
import plugin_timeout
import decky_plugin
import re

class Devices(Enum):
  LEGION_GO = "83E1"
  LEGION_GO_S = "83L3"
  ROG_ALLY = "ROG Ally RC71"
  ROG_ALLY_X = "ROG Ally X RC72"
  MINISFORUM_V3 = "V3"
  GPD_WM2 = "G1619-04"
  GPD_WIN4 = "G1618-04"
  ASUS_FLOW_Z13 = "ROG Flow Z13 GZ302EA_GZ302EA"
  STEAM_DECK_LCD = "Jupiter"
  STEAM_DECK_OLED = "Galileo"
  MSI_CLAW_8_AI ="Claw 8 AI+ A2VM"

class CpuVendors(Enum):
  INTEL = "GenuineIntel"
  AMD = "AuthenticAMD"

CPU_VENDOR = None
DEVICE_NAME = None
CPU_MODEL = None

def get_cpu_model():
  global CPU_MODEL

  if not CPU_MODEL:
    try:
      with open("/proc/cpuinfo", "r") as file:
          cpuinfo = file.read().strip()
          file.close()

          pattern = r'model name\s*:\s*(.*)'
          match = re.search(pattern, cpuinfo)

          if match:
              vendor_id = match.group(1)
              CPU_MODEL = vendor_id.strip()
              decky_plugin.logger.info(f"cpu model: {CPU_MODEL}")
          else:
              decky_plugin.logger.error("No CPU model found")
    except Exception as e:
      decky_plugin.logger.error(f'{__name__} error while trying to read cpu model')
  return CPU_MODEL

def get_cpu_manufacturer():
  global CPU_VENDOR

  if not CPU_VENDOR:
    try:
      with open("/proc/cpuinfo", "r") as file:
          cpuinfo = file.read().strip()
          file.close()

          pattern = r'vendor_id\s*:\s*(\S+)'

          match = re.search(pattern, cpuinfo)

          if match:
              vendor_id = match.group(1)
              CPU_VENDOR = vendor_id.strip()
              decky_plugin.logger.info(f"cpu vendor: {CPU_VENDOR}")
          else:
              decky_plugin.logger.error("No CPU vendor_id found")          
    except Exception as e:
      decky_plugin.logger.error(f'{__name__} error while trying to read cpu manufacturer')
  return CPU_VENDOR

def is_intel():
  vendor = get_cpu_manufacturer()

  return vendor == CpuVendors.INTEL.value

def get_device_name():
  global DEVICE_NAME

  if not DEVICE_NAME:
    try:
      with plugin_timeout.time_limit(2):
        with open("/sys/devices/virtual/dmi/id/product_name", "r") as file:
          device_name = file.read().strip()
          file.close()

          DEVICE_NAME = device_name
    except Exception as e:
      decky_plugin.logger.error(f'{__name__} error while trying to read device name')
  return DEVICE_NAME or ''

def is_msi_claw_ai():
  device_name = get_device_name()

  if Devices.MSI_CLAW_8_AI.value in device_name:
    return True
  return False

def is_rog_ally_x():
  device_name = get_device_name()

  if Devices.ROG_ALLY_X.value in device_name:
    return True
  return False

def is_rog_ally():
  device_name = get_device_name()

  if Devices.ROG_ALLY.value in device_name:
    return True
  return False

def is_rog_ally_series():
  return is_rog_ally() or is_rog_ally_x()

def is_legion_go():
  device_name = get_device_name()

  if device_name == Devices.LEGION_GO.value:
    return True
  if device_name == Devices.LEGION_GO_S.value:
    return True
  return False

def is_steam_deck():
  device_name = get_device_name()

  if Devices.STEAM_DECK_LCD.value in device_name or Devices.STEAM_DECK_OLED.value in device_name:
    return True
  return False