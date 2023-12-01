import { Dispatch } from "redux";
import {
  getCurrentTdpInfoSelector,
  pollEnabledSelector,
  pollRateSelector,
  setCurrentGameInfo,
  setEnableTdpProfiles,
  setPolling,
  updateInitialLoad,
  updateMaxTdp,
  updateMinTdp,
  updatePollRate,
  updateTdpProfiles,
} from "./settingsSlice";
import { createServerApiHelpers, getServerApi } from "../backend/utils";
import { PayloadAction } from "@reduxjs/toolkit";
import { ServerAPI } from "decky-frontend-lib";
import { extractCurrentGameId } from "../utils/constants";
import { cleanupAction } from "./extraActions";

const resetTdpPollingActionTypes = [
  setCurrentGameInfo.type,
  setEnableTdpProfiles.type,
  updateTdpProfiles.type,
  updatePollRate.type,
  setPolling.type,
  updateInitialLoad.type,
] as string[];

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
      const currentGameId = extractCurrentGameId();

      setPollTdp(currentGameId);
    }, pollRate);
  }
};

export const settingsMiddleware =
  (store: any) => (dispatch: Dispatch) => (action: PayloadAction<any>) => {
    const serverApi = getServerApi();
    const { setSetting, saveTdp } = createServerApiHelpers(
      serverApi as ServerAPI
    );

    const result = dispatch(action);

    if (action.type === updateTdpProfiles.type) {
      const { id, tdp } = getCurrentTdpInfoSelector(store.getState());
      saveTdp(id, tdp);
    }

    if (action.type === updateTdpProfiles.type) {
      const { id, tdp } = getCurrentTdpInfoSelector(store.getState());
      saveTdp(id, tdp);
    }

    if (action.type === setCurrentGameInfo.type) {
      const {
        settings: { previousGameId },
      } = store.getState();

      const currentGameId = extractCurrentGameId();
      if (previousGameId !== currentGameId) {
        // update TDP to new game's TDP value, if appropriate to do so
        const { id, tdp } = getCurrentTdpInfoSelector(store.getState());
        saveTdp(id, tdp);
      }
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

    if (resetTdpPollingActionTypes.includes(action.type)) {
      resetPolling(store);
    }
    // const pollEnabled = pollEnabledSelector(store.getState());

    // if (!pollIntervalId && pollEnabled) {
    //   // no polling, but it should be. most likely initial load, so start polling
    //   if (pollEnabled) {
    //     resetPolling(store);
    //   }
    // }

    if (action.type === cleanupAction.type) {
      if (pollIntervalId) {
        clearInterval(pollIntervalId);
      }
    }

    return result;
  };
