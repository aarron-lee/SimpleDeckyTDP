import { Router } from "decky-frontend-lib";

export const DEFAULT_POLL_RATE = 3000;
export const DEFAULT_START_TDP = 12;

export const extractCurrentGameId = () =>
  `${Router.MainRunningApp?.appid || "default"}`;

export const extractCurrentGameInfo = () => {
  const results = {
    id: extractCurrentGameId(),
    displayName: `${Router.MainRunningApp?.display_name || "default"}`,
  };

  return results;
};

export type PowerControlInfo = {
  powerControlsEnabled: boolean;
  supportsEpp: boolean;
  eppOptions: EppOption[];
  powerGovernorOptions: PowerGovernorOption[];
  scalingDriver: string;
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
  PERFORMANCE: "performance",
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
  PERFORMANCE: "performance",
};

const addReverseMapping = (options: { [key: string]: string }) => {
  Object.entries(options).forEach(
    ([label, option]) => (options[option] = label)
  );
};

addReverseMapping(PowerGovernorOptions);
addReverseMapping(EppOptions);

// export enum PowerGovernorOptions {
//   POWER_SAVE = "powersave",
//   BALANCED = "schedutil",
//   PERFORMANCE = "performance",
// }
