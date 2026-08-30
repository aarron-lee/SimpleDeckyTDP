import {
  getCurrentGameId,
  getCurrentGameInfo,
} from "../components/atoms/DeckyFrontendLib";

export const CpuVendors = {
  INTEL: "GenuineIntel",
  AMD: "AuthenticAMD",
};

export const MIN_TDP_RANGE = 3;
export const DEFAULT_POLL_RATE = 15000;
export const DEFAULT_START_TDP = 12;
export const CPU_BOOST_POLL_DELAY_MS = 700;
export const MAX_PROFILE_DISPLAY_LENGTH = 20;
export const DEFAULT_MAX_TDP = 40;
export const STEAM_DECK_MAX_TDP = 20;
export const DEFAULT_MAX_TDP_FALLBACK = 15;
export const MIN_TDP_SLIDER_MAX = 12;
export const MAX_TDP_SLIDER_MIN = 15;
export const POLL_RATE_MIN_SEC = 5;
export const POLL_RATE_MAX_SEC = 60;
export const STEAM_DECK_MAX_GPU_FREQ_MHZ = 1600;
export const GAME_INFO_POLL_INTERVAL_MS = 2000;
export const TEMP_MAX_TDP_DEBOUNCE_MS = 500;
export const RESUME_INITIAL_DELAY_MS = 3500;
export const RESUME_TDP_RESTORE_DELAY_MS = 10000;
export const RESUME_TDP_RESTORE_MAX_DELAY_MS = 15000;
export const AC_POWER_DEBOUNCE_MS = 1000;
export const AC_POWER_POLL_INTERVAL_MS = 2000;
export const PERSIST_DEBOUNCE_MS = 1000;
export const POLL_TDP_DEBOUNCE_MS = 1000;

export const extractCurrentGameId = getCurrentGameId;

export const extractCurrentGameInfo = getCurrentGameInfo;

export type PowerControlInfo = {
  powerControlsEnabled: boolean;
  supportsEpp: boolean;
  eppOptions: string[];
  powerGovernorOptions: string[];
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

export const simplePowerGovernorLabels: { [optionName: string]: string } = {
  POWER_SAVE: "Manual",
  PERFORM_ANCE: "Prefer CPU",
};

export const simpleEppLabels: { [optionName: string]: string } = {
  POWER_SAVE: "Prefer GPU",
  BALANCE_POWER_SAVE: "Balance GPU",
  BALANCE_PERFORMANCE: "Balance CPU",
  PERFORM_ANCE: "Prefer CPU",
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
