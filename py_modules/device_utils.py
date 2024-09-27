from enum import Enum
import file_timeout
import decky_plugin
import subprocess
import json

class Devices(Enum):
  LEGION_GO = "83E1"
  ROG_ALLY = "ROG Ally RC71"
  ROG_ALLY_X = "ROG Ally X RC72"
  MINISFORUM_V3 = "V3"
  GPD_WM2 = "G1619-04"
  GPD_WIN4 = "G1618-04"

class CpuVendors(Enum):
  INTEL = "GenuineIntel"
  AMD = "AuthenticAMD"

CPU_VENDOR = None
DEVICE_NAME = None

def get_cpu_manufacturer():
  global CPU_VENDOR

  if not CPU_VENDOR:
    try:
      cmd = 'sed -En \'s/ *(( ?[^ :\t])+)\\s*(:?)/"\\1"\\3/gp\' /proc/cpuinfo'
      result = subprocess.run(cmd, shell=True, check=True, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
      json_partial = ",".join(result.stdout.split("\n"))[:-1]
      cpu_info = json.loads(f"{{{json_partial}}}")
      CPU_VENDOR = cpu_info.get('vendor_id')
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
      with file_timeout.time_limit(2):
        with open("/sys/devices/virtual/dmi/id/product_name", "r") as file:
          device_name = file.read().strip()
          file.close()

          DEVICE_NAME = device_name
    except Exception as e:
      decky_plugin.logger.error(f'{__name__} error while trying to read device name')
  return DEVICE_NAME or ''

def is_rog_ally():
  device_name = get_device_name()

  if Devices.ROG_ALLY.value in device_name or Devices.ROG_ALLY_X.value in device_name:
    return True
  return False

def is_legion_go():
  device_name = get_device_name()

  if device_name == Devices.LEGION_GO.value:
    return True
  return False