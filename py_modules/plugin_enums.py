from enum import Enum

class GpuModes(Enum):
    DEFAULT = "DEFAULT"
    RANGE = "RANGE"

class GpuRange(Enum):
    MIN = "minGpuFrequency"
    MAX = "maxGpuFrequency"