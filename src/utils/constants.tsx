import {
  getCurrentGameId,
  getCurrentGameInfo,
} from "../components/atoms/DeckyFrontendLib";

export const CpuVendors = {
  INTEL: "GenuineIntel",
  AMD: "AuthenticAMD",
};

export const MIN_TDP_RANGE = 4;
export const DEFAULT_POLL_RATE = 10000;
export const DEFAULT_START_TDP = 12;

export const extractCurrentGameId = getCurrentGameId;

export const extractCurrentGameInfo = getCurrentGameInfo;

export type PowerControlInfo = {
  powerControlsEnabled: boolean;
  supportsEpp: boolean;
  eppOptions: EppOption[];
  powerGovernorOptions: PowerGovernorOption[];
  scalingDriver: string;
  supportsCpuBoost: boolean;
  supportsSmt: boolean;
  pstateStatus?: string;
  deviceName?: string;
};

export type EppOption =
  | "performance"
  | "power"
  | "balance_performance"
  | "balance_power";

export const EppOptions: { [optionName: string]: EppOption } = {
  POWER_SAVE: "power",
  BALANCE_POWER_SAVE: "balance_power",
  BALANCE_PERFORMANCE: "balance_performance",
  PERFORM_ANCE: "performance",
};

export type ScalingDriverOption =
  | "intel_cpufreq"
  | "intel_pstate"
  | "amd-pstate"
  | "amd-pstate-epp"
  | "acpi-cpufreq";

export const ScalingDrivers: {
  [optionName: string]: ScalingDriverOption;
} = {
  INTEL_CPUFREQ: "intel_cpufreq",
  INTEL_PSTATE: "intel_pstate",
  PSTATE_EPP: "amd-pstate-epp",
  PSTATE: "amd-pstate",
  ACPI_CPUFREQ: "acpi-cpufreq",
};

export type PowerGovernorOption =
  | "powersave"
  | "performance"
  | "conservative"
  | "ondemand"
  | "userspace"
  | "schedutil";

export const PowerGovernorOptions: {
  [optionName: string]: PowerGovernorOption;
} = {
  POWER_SAVE: "powersave",
  BALANCED: "schedutil",
  PERFORM_ANCE: "performance",
};

const addReverseMapping = (options: { [key: string]: string }) => {
  Object.entries(options).forEach(
    ([label, option]) => (options[option] = label)
  );
};

addReverseMapping(PowerGovernorOptions);
addReverseMapping(EppOptions);

export type PowerControlsType = {
  [key: string]: { epp?: EppOption; powerGovernor: PowerGovernorOption };
};

export const DEFAULT_POWER_CONTROLS: PowerControlsType = {
  [ScalingDrivers.INTEL_CPUFREQ]: {
    powerGovernor: PowerGovernorOptions.POWER_SAVE,
  },
  [ScalingDrivers.INTEL_PSTATE]: {
    epp: EppOptions.BALANCE_POWER_SAVE,
    powerGovernor: PowerGovernorOptions.POWER_SAVE,
  },
  [ScalingDrivers.PSTATE_EPP]: {
    epp: EppOptions.BALANCE_POWER_SAVE,
    powerGovernor: PowerGovernorOptions.POWER_SAVE,
  },
  [ScalingDrivers.PSTATE]: {
    powerGovernor: PowerGovernorOptions.POWER_SAVE,
  },
  [ScalingDrivers.ACPI_CPUFREQ]: {
    powerGovernor: PowerGovernorOptions.POWER_SAVE,
  },
};
