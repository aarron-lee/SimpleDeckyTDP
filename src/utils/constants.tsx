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

export type EppOption =
  | "performance"
  | "power"
  | "balance_performance"
  | "balance_power";

export const EppOptions: { [optionName: string]: EppOption } = {
  PERFORMANCE: "performance",
  BALANCE_PERFORMANCE: "balance_performance",
  BALANCE_POWER_SAVE: "balance_power",
  POWER_SAVE: "power",
};

export type PowerGovernorOption = "powersave" | "performance";

export const PowerGovernorOptions: {
  [optionName: string]: PowerGovernorOption;
} = {
  POWER_SAVE: "powersave",
  PERFORMANCE: "performance",
};
