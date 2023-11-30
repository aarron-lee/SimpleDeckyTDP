import { Dispatch } from "redux";
import {
  getCurrentTdpInfoSelector,
  setCurrentGameInfo,
  setEnableTdpProfiles,
  setPolling,
  updateMaxTdp,
  updateMinTdp,
  updatePollRate,
  updateTdpProfiles,
} from "./settingsSlice";
import { createServerApiHelpers, getServerApi } from "../backend/utils";
import { PayloadAction } from "@reduxjs/toolkit";
import { ServerAPI } from "decky-frontend-lib";
import { extractCurrentGameId } from "../utils/constants";

const resetTdpPollingActionTypes = [
  setCurrentGameInfo.type,
  setEnableTdpProfiles.type,
  updateTdpProfiles.type,
  updatePollRate.type,
  setPolling.type,
];

export const settingsMiddleware =
  (store: any) => (dispatch: Dispatch) => (action: PayloadAction<any>) => {
    const serverApi = getServerApi();
    const { setSetting, saveTdp, setPollTdp, getSettings, logInfo } =
      createServerApiHelpers(serverApi as ServerAPI);

    const result = dispatch(action);

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

    return result;
  };
