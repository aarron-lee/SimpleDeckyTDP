import { ServerAPI } from "decky-frontend-lib";
import { createServerApiHelpers } from "./backend/utils";
import {
  DEFAULT_POLL_RATE,
  extractCurrentGameId,
  extractCurrentGameInfo,
  // DEFAULT_START_TDP,
} from "./utils/constants";
import { store } from "./redux-modules/store";
import { setCurrentGameInfo } from "./redux-modules/settingsSlice";

// this interval polls ryzenadj
let pollTdpIntervalId: any;
let previousPollRate: number | undefined;
let previousGameId: string | undefined;

// this interval periodically checks for if TDP polling is enabled on the backed
let handlePollingIntervalId: any;

export const handleTdpPolling = async (serverAPI: ServerAPI) => {
  const { getSettings, setPollTdp } = createServerApiHelpers(serverAPI);

  handlePollingIntervalId = setInterval(() => {
    getSettings().then((result) => {
      const settings = result.result || {};

      const currentGameId = extractCurrentGameId();

      if (
        settings["pollEnabled"] &&
        (settings["pollRate"] !== previousPollRate ||
          currentGameId !== previousGameId)
      ) {
        // polling TDP is enabled, handle for it
        previousGameId = currentGameId;

        if (pollTdpIntervalId) {
          clearInterval(pollTdpIntervalId);
        }

        pollTdp(settings, setPollTdp);
      } else if (!settings["pollEnabled"]) {
        if (pollTdpIntervalId) {
          clearInterval(pollTdpIntervalId);
        }
      }
    });
  }, 3000);
  return () => {
    if (handlePollingIntervalId) {
      clearInterval(handlePollingIntervalId);
    }
    if (pollTdpIntervalId) {
      clearInterval(pollTdpIntervalId);
    }
  };
};

function pollTdp(settings: any, setPollTdp: (gameId: string) => void) {
  previousPollRate = settings.pollRate;

  if (pollTdpIntervalId) {
    clearInterval(pollTdpIntervalId);
  }

  pollTdpIntervalId = setInterval(() => {
    const currentGameId = extractCurrentGameId();

    setPollTdp(currentGameId);
  }, settings.pollRate || DEFAULT_POLL_RATE);
}

let currentGameInfoListenerIntervalId: undefined | number;

export const currentGameInfoListener = () => {
  currentGameInfoListenerIntervalId = window.setInterval(() => {
    const results = extractCurrentGameInfo();

    const { settings } = store.getState();

    if (settings.currentGameId !== results.id) {
      // new currentGameId, dispatch to the store
      store.dispatch(setCurrentGameInfo(results));
    }
  }, 500);

  return () => {
    if (currentGameInfoListenerIntervalId) {
      clearInterval(currentGameInfoListenerIntervalId);
    }
  };
};
