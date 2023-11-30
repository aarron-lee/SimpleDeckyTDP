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
