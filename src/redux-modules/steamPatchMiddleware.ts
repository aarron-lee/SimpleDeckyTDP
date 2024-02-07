import { Dispatch } from "redux";
import {
  setCurrentGameInfo,
  setSteamPatchDefaultTdp,
  getAdvancedOptionsInfoSelector,
  pollEnabledSelector,
  pollRateSelector,
  updatePollRate,
  updateAdvancedOption,
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
import { debounce } from "lodash";

let pollIntervalId: undefined | number;

const debouncedSetSteamPatchValuesForGameId = debounce(
  setSteamPatchValuesForGameId,
  1000
);

const resetPolling = (state: any) => {
  if (pollIntervalId) {
    clearInterval(pollIntervalId);
    pollIntervalId = undefined;
  }
  const pollEnabled = pollEnabledSelector(state);
  const pollRate = pollRateSelector(state);

  if (pollEnabled) {
    pollIntervalId = window.setInterval(() => {
      const id = extractCurrentGameId();

      debouncedSetSteamPatchValuesForGameId(id);
    }, pollRate);
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

      if (action.type === updateAdvancedOption.type) {
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
