from enum import Enum

class GpuModes(Enum):
  BATTERY = "BATTERY"
  BALANCE = "BALANCE"
  PERFORMANCE = "PERFORMANCE"
  RANGE = "RANGE"
  FIXED = "FIXED"

class GpuRange(Enum):
  MIN = "minGpuFrequency"
  MAX = "maxGpuFrequency"
  FIXED = "fixedGpuFrequency"
