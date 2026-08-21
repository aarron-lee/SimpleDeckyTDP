import {
  activeGameIdSelector,
  pollEnabledSelector,
  pollRateSelector,
} from "./settingsSlice";
import { setPollTdp } from "../backend/utils";
import { debounce } from "lodash";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let store: { getState: () => any } | undefined;
export const initializePollingStore = (s: { getState: () => any }) => {
  store = s;
};

let pollIntervalId: undefined | number;

const DEBOUNCE_TIME = 1000; // milliseconds

const debouncedSetPollTdp = debounce(setPollTdp, DEBOUNCE_TIME);

export const setPolling = () => {
  if (store) {
    const state = store.getState();
    clearPollingInterval();

    const pollEnabled = pollEnabledSelector(state);
    const pollRate = pollRateSelector(state);

    if (pollEnabled) {
      pollIntervalId = window.setInterval(() => {
        const activeGameId = activeGameIdSelector(store!.getState());

        debouncedSetPollTdp({ currentGameId: activeGameId });
      }, pollRate);
    }
  }
};

export function clearPollingInterval() {
  if (pollIntervalId) {
    clearInterval(pollIntervalId);
    pollIntervalId = undefined;
  }
}
