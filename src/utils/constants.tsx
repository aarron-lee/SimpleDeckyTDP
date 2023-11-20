import { Router } from "decky-frontend-lib";

export const DEFAULT_POLL_RATE = 3000;
export const DEFAULT_START_TDP = 12;

export const extractCurrentGameId = () => `${Router.MainRunningApp?.appid || 'default'}`;