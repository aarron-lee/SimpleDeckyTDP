import { ServerAPI, Router } from 'decky-frontend-lib';
import { createServerApiHelpers } from './backend/utils';
import {
  DEFAULT_POLL_RATE, extractCurrentGameId,
  // DEFAULT_START_TDP,
} from './utils/constants';

// this interval polls ryzenadj
let pollTdpIntervalId: any;
let previousPollRate: number | undefined;
let previousGameId: string | undefined;

// this interval periodically checks for if TDP polling is enabled on the backed
let handlePollingIntervalId: any;

export const handleTdpPolling = async (serverAPI: ServerAPI) => {
  const { getSettings, setPollTdp } =
    createServerApiHelpers(serverAPI);

  handlePollingIntervalId = setInterval(() => {
    getSettings().then((result) => {
      const settings = result.result || {};

      const currentGameId = extractCurrentGameId()

      if (
        settings['pollEnabled'] &&
        (settings['pollRate'] !== previousPollRate ||
          currentGameId !== previousGameId)
      ) {
        // polling TDP is enabled, handle for it
        previousGameId = currentGameId;

        if (pollTdpIntervalId) {
          clearInterval(pollTdpIntervalId);
        }

        pollTdp(settings, setPollTdp);
      } else if (!settings['pollEnabled']) {
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

function pollTdp(
  settings: any,
  setPollTdp: (gameId: string) => void
) {
  previousPollRate = settings.pollRate;

  if (pollTdpIntervalId) {
    clearInterval(pollTdpIntervalId);
  }

  pollTdpIntervalId = setInterval(() => {
    const currentGameId = `${
      Router.MainRunningApp?.appid || 'default'
    }`;

    setPollTdp(currentGameId);
  }, settings.pollRate || DEFAULT_POLL_RATE);
}
