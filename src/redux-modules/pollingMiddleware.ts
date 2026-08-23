import {
  activeGameIdSelector,
  pollEnabledSelector,
  pollRateSelector,
} from "./settingsSlice";
import { setPollTdp } from "../backend/utils";
import { debounce } from "lodash";
import { POLL_TDP_DEBOUNCE_MS } from "../utils/constants";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let store: { getState: () => any } | undefined;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const initializePollingStore = (s: { getState: () => any }) => {
  store = s;
};

let pollIntervalId: undefined | number;

const debouncedSetPollTdp = debounce(setPollTdp, POLL_TDP_DEBOUNCE_MS);

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
