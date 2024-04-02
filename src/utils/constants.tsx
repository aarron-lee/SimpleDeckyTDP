import {
  getCurrentGameId,
  getCurrentGameInfo,
} from "../components/atoms/DeckyFrontendLib";

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
  pstateStatus?: string;
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

export const DEFAULT_POWER_CONTROLS = {
  "amd-pstate-epp": {
    epp: EppOptions.BALANCE_PERFORMANCE,
    powerGovernor: PowerGovernorOptions.POWER_SAVE,
  },
  "amd-pstate": {
    powerGovernor: PowerGovernorOptions.POWER_SAVE,
  },
  "acpi-cpufreq": {
    powerGovernor: PowerGovernorOptions.POWER_SAVE,
  },
};
