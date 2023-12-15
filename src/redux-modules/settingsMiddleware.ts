import { Dispatch } from "redux";
import {
  activeGameIdSelector,
  pollEnabledSelector,
  pollRateSelector,
  setCpuBoost,
  setCurrentGameInfo,
  setEnableTdpProfiles,
  setPolling,
  setSmt,
  updateInitialLoad,
  updateMaxTdp,
  updateMinTdp,
  updatePollRate,
  updateTdpProfiles,
} from "./settingsSlice";
import { createServerApiHelpers, getServerApi } from "../backend/utils";
import { PayloadAction } from "@reduxjs/toolkit";
import { ServerAPI } from "decky-frontend-lib";
import { cleanupAction } from "./extraActions";

const resetTdpActionTypes = [
  setCurrentGameInfo.type,
  setEnableTdpProfiles.type,
  updateTdpProfiles.type,
  updatePollRate.type,
  setPolling.type,
  updateInitialLoad.type,
] as string[];

const changeCpuStateTypes = [
  setCpuBoost.type,
  setSmt.type
] as string[]

let pollIntervalId: undefined | number;

const resetPolling = (store: any) => {
  if (pollIntervalId) {
    clearInterval(pollIntervalId);
  }
  const state = store.getState();
  const pollEnabled = pollEnabledSelector(state);

  if (pollEnabled) {
    const pollRate = pollRateSelector(state);

    pollIntervalId = window.setInterval(() => {
      const serverApi = getServerApi();
      const { setPollTdp } = createServerApiHelpers(serverApi as ServerAPI);
      const currentGameId = state.settings.currentGameId;

      setPollTdp(currentGameId);
    }, pollRate);
  }
};

export const settingsMiddleware =
  (store: any) => (dispatch: Dispatch) => (action: PayloadAction<any>) => {
    const serverApi = getServerApi();
    const { setSetting, saveTdpProfiles } = createServerApiHelpers(
      serverApi as ServerAPI
    );

    const result = dispatch(action);

    const state = store.getState();
    const activeGameId = activeGameIdSelector(state);

    if (action.type === setCurrentGameInfo.type) {
      const {
        settings: { previousGameId },
      } = state;

      if (previousGameId !== state.currentGameId) {
        // update TDP to new game's TDP value, if appropriate to do so
        saveTdpProfiles(state.settings.tdpProfiles, activeGameId);
      }
    }

    if (action.type === updateTdpProfiles.type) {
      saveTdpProfiles(state.settings.tdpProfiles, activeGameId);
    }

    if (action.type === setEnableTdpProfiles.type) {
      setSetting({
        fieldName: "enableTdpProfiles",
        fieldValue: action.payload,
      });
    }
    if (action.type === updateMinTdp.type) {
      setSetting({
        fieldName: "minTdp",
        fieldValue: action.payload,
      });
    }
    if (action.type === updateMaxTdp.type) {
      setSetting({
        fieldName: "maxTdp",
        fieldValue: action.payload,
      });
    }
    if (action.type === updatePollRate.type) {
      // action.type == number (rate in ms)
      setSetting({
        fieldName: "pollRate",
        fieldValue: action.payload,
      });
    }
    if (action.type === setPolling.type) {
      // action.type = boolean
      setSetting({
        fieldName: "pollEnabled",
        fieldValue: action.payload,
      });
    }

    if (resetTdpActionTypes.includes(action.type)) {
      saveTdpProfiles(state.settings.tdpProfiles, activeGameId);
      resetPolling(store);
    }

    if(changeCpuStateTypes.includes(action.type)) {
      // save tdp profiles, but polling reset is unnecessary
      saveTdpProfiles(state.settings.tdpProfiles, activeGameId);
    }

    if (action.type === cleanupAction.type) {
      if (pollIntervalId) {
        clearInterval(pollIntervalId);
      }
    }

    return result;
  };
