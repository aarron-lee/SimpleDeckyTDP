import { Dispatch } from "redux";
import {
  setCurrentGameInfo,
  setSteamPatchDefaultTdp,
  disableBackgroundPollingSelector,
  getAdvancedOptionsInfoSelector,
  pollEnabledSelector,
  pollRateSelector,
  setDisableBackgroundPolling,
  updatePollRate,
  setPolling,
} from "./settingsSlice";
import {
  AdvancedOptionsEnum,
  createServerApiHelpers,
  getServerApi,
  setSteamPatchValuesForGameId,
} from "../backend/utils";
import { PayloadAction } from "@reduxjs/toolkit";
import { ServerAPI } from "decky-frontend-lib";
import { cleanupAction, resumeAction } from "./extraActions";
import { extractCurrentGameId } from "../utils/constants";

let pollIntervalId: undefined | number;

// always have a default 10 second poll rate in the background
// some devices mess with TDP in the background, e.g. Lenovo Legion Go
const BACKGROUND_POLL_RATE = 10000;

const resetPolling = (state: any) => {
  if (pollIntervalId) {
    clearInterval(pollIntervalId);
    pollIntervalId = undefined;
  }
  const disableBackgroundPolling = disableBackgroundPollingSelector(state);
  const pollOverrideEnabled = pollEnabledSelector(state);
  const pollRateOverride = pollRateSelector(state);

  const actualPollRate = pollOverrideEnabled
    ? pollRateOverride
    : BACKGROUND_POLL_RATE;

  if (!disableBackgroundPolling) {
    pollIntervalId = window.setInterval(() => {
      const id = extractCurrentGameId();

      setSteamPatchValuesForGameId(id);
    }, actualPollRate);
  }
};

export const steamPatchMiddleware =
  (store: any) => (dispatch: Dispatch) => (action: PayloadAction<any>) => {
    const result = dispatch(action);

    const serverApi = getServerApi();

    const { setSetting } = createServerApiHelpers(serverApi as ServerAPI);

    const state = store.getState();

    const { advancedState } = getAdvancedOptionsInfoSelector(state);
    const steamPatchEnabled = Boolean(
      advancedState[AdvancedOptionsEnum.STEAM_PATCH]
    );

    const id = extractCurrentGameId();

    if (steamPatchEnabled) {
      if (action.type === setSteamPatchDefaultTdp.type) {
        setSetting({
          fieldName: "steamPatchDefaultTdp",
          fieldValue: state.settings.steamPatchDefaultTdp,
        });
      }

      if (action.type === resumeAction.type) {
        setSteamPatchValuesForGameId(id);
      }

      if (action.type === updatePollRate.type) {
        // action.type == number (rate in ms)
        setSetting({
          fieldName: "pollRate",
          fieldValue: action.payload,
        });
        resetPolling(state);
      }
      if (action.type === setPolling.type) {
        // action.type = boolean
        setSetting({
          fieldName: "pollEnabled",
          fieldValue: action.payload,
        });
        resetPolling(state);
      }

      if (action.type === setDisableBackgroundPolling.type) {
        // update value on backend
        setSetting({
          fieldName: "disableBackgroundPolling",
          fieldValue: action.payload,
        });
        resetPolling(state);
      }

      if (action.type === setCurrentGameInfo.type) {
        setSteamPatchValuesForGameId(id);
      }

      if (action.type === cleanupAction.type) {
        if (pollIntervalId) clearInterval(pollIntervalId);
      }
    } else {
      // steam patch turned off
      if (pollIntervalId) {
        clearInterval(pollIntervalId);
        pollIntervalId = undefined;
      }
    }

    return result;
  };
