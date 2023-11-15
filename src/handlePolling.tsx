import { ServerAPI, Router } from 'decky-frontend-lib';
import { createServerApiHelpers } from './backend/utils';
import { get } from 'lodash';
import {
  DEFAULT_POLL_RATE,
  DEFAULT_START_TDP,
} from './utils/constants';

// this interval polls ryzenadj
let pollTdpIntervalId: any;
let previousPollRate: number | undefined;

// this interval periodically checks for if TDP polling is enabled on the backed
let handlePollingIntervalId: any;

export const handleTdpPolling = async (serverAPI: ServerAPI) => {
  const { getSettings, setTdp: ryzenadj } =
    createServerApiHelpers(serverAPI);

  handlePollingIntervalId = setInterval(() => {
    getSettings().then((result) => {
      const settings = result.result || {};

      if (
        settings['pollEnabled'] &&
        settings['pollRate'] !== previousPollRate
      ) {
        // polling TDP is enabled, handle for it

        if (pollTdpIntervalId) {
          clearInterval(pollTdpIntervalId);
        }

        pollTdp(settings, ryzenadj);
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

function pollTdp(settings: any, ryzenadj: (tdp: number) => void) {
  previousPollRate = settings.pollRate;

  if (pollTdpIntervalId) {
    clearInterval(pollTdpIntervalId);
  }

  pollTdpIntervalId = setInterval(() => {
    const defaultTdp = get(
      settings,
      'tdpProfiles.default.tdp',
      DEFAULT_START_TDP
    );
    const currentGameId = `${
      Router.MainRunningApp?.appid || 'default'
    }`;

    if (settings.enableTdpProfiles) {
      // tdp from game tdp profile
      const gameTdp = get(
        settings,
        `tdpProfiles.${currentGameId}.tdp`,
        // default if it doesn't exist yet
        defaultTdp
      );

      ryzenadj(gameTdp);
    } else {
      ryzenadj(defaultTdp);
    }
  }, settings.pollRate || DEFAULT_POLL_RATE);
}
