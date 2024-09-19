import { Dispatch } from "redux";
import {
  setCurrentGameInfo,
  setSteamPatchDefaultTdp,
  updatePollRate,
  updateAdvancedOption,
  getSteamPatchEnabledSelector,
} from "./settingsSlice";
import { setSetting, setSteamPatchValuesForGameId } from "../backend/utils";
import { PayloadAction } from "@reduxjs/toolkit";
import { cleanupAction, resumeAction } from "./extraActions";
import { extractCurrentGameId } from "../utils/constants";
import {
  clearIntervalOnSteamPatchChange,
  clearPollingInterval,
  setPolling,
} from "./pollingMiddleware";

export const steamPatchMiddleware =
  (store: any) => (dispatch: Dispatch) => (action: PayloadAction<any>) => {
    const result = dispatch(action);

    const state = store.getState();

    const steamPatchEnabled = getSteamPatchEnabledSelector(state);

    const id = extractCurrentGameId();

    if (steamPatchEnabled) {
      if (action.type === setSteamPatchDefaultTdp.type) {
        setSetting({
          name: "steamPatchDefaultTdp",
          value: state.settings.steamPatchDefaultTdp,
        });
      }

      if (action.type === resumeAction.type) {
        setSteamPatchValuesForGameId(id);
      }

      if (action.type === updatePollRate.type) {
        // action.type == number (rate in ms)
        setSetting({
          name: "pollRate",
          value: action.payload,
        });
        setPolling();
      }

      if (action.type === updateAdvancedOption.type) {
        setPolling();
      }

      if (action.type === setCurrentGameInfo.type) {
        setSteamPatchValuesForGameId(id);
      }

      if (action.type === cleanupAction.type) {
        clearPollingInterval();
      }
    } else {
      // steam patch turned off
      clearIntervalOnSteamPatchChange(steamPatchEnabled);
    }

    return result;
  };
