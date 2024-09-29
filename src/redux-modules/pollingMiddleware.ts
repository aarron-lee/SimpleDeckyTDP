import {
  activeGameIdSelector,
  getSteamPatchEnabledSelector,
  pollEnabledSelector,
  pollRateSelector,
} from "./settingsSlice";
import { setSteamPatchValuesForGameId, setPollTdp } from "../backend/utils";
import { extractCurrentGameId } from "../utils/constants";
import { debounce } from "lodash";

let store: any;
export const initializePollingStore = (s: any) => (store = s);

let pollIntervalId: undefined | number;

const DEBOUNCE_TIME = 1000; // milliseconds

const debouncedSetSteamPatchValuesForGameId = debounce(
  setSteamPatchValuesForGameId,
  DEBOUNCE_TIME
);
const debouncedSetPollTdp = debounce(setPollTdp, DEBOUNCE_TIME);

export const setPolling = () => {
  if (store) {
    const state = store.getState();
    clearPollingInterval();

    const pollEnabled = pollEnabledSelector(state);
    const pollRate = pollRateSelector(state);

    const steamPatchEnabled = getSteamPatchEnabledSelector(state);

    if (pollEnabled) {
      pollIntervalId = window.setInterval(() => {
        if (steamPatchEnabled) {
          // steam patch value
          const id = extractCurrentGameId();

          debouncedSetSteamPatchValuesForGameId({ gameId: id });
        } else {
          const activeGameId = activeGameIdSelector(store.getState());

          debouncedSetPollTdp({ currentGameId: activeGameId });
        }
      }, pollRate);
    }
  }
};

let previousSteamPatchEnabled: boolean | undefined;

export function clearIntervalOnSteamPatchChange(steamPatchEnabled: boolean) {
  if (previousSteamPatchEnabled === undefined) {
    previousSteamPatchEnabled = steamPatchEnabled;
  }
  if (steamPatchEnabled !== previousSteamPatchEnabled) {
    clearPollingInterval();
    previousSteamPatchEnabled = steamPatchEnabled;
  }
}

export function clearPollingInterval() {
  if (pollIntervalId) {
    clearInterval(pollIntervalId);
    pollIntervalId = undefined;
  }
}
