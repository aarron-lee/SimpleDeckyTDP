from enum import Enum

class GpuModes(Enum):
  DEFAULT = "DEFAULT"
  RANGE = "RANGE"
  FIXED = "FIXED"

class GpuRange(Enum):
  MIN = "minGpuFrequency"
  MAX = "maxGpuFrequency"
  FIXED = "fixedGpuFrequency"

class AcPowerPaths(Enum):
  # Minisforum V3, LGO
  ACAD = '/sys/class/power_supply/ACAD/online'
  # GPD WM2
  ADP1 = '/sys/class/power_supply/ADP1/online'

class Devices(Enum):
  LEGION_GO = "83E1"
  ROG_ALLY = "ROG Ally RC71"
  ROG_ALLY_X = "ROG Ally X RC72"
  MINISFORUM_V3 = "V3"
  GPD_WM2 = "G1619-04"