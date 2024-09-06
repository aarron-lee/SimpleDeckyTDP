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
  # Minisforum V3, LGO, Win 4
  ACAD = '/sys/class/power_supply/ACAD/online'
  # GPD WM2
  ADP1 = '/sys/class/power_supply/ADP1/online'
