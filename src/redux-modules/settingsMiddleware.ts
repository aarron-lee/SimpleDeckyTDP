import { Dispatch } from "redux";
import { RootState } from "./store";
import {
  setEnableTdpProfiles,
  setPolling,
  updateMaxTdp,
  updateMinTdp,
  updatePollRate,
} from "./settingsSlice";
import { createServerApiHelpers, getServerApi } from "../backend/utils";
import { PayloadAction } from "@reduxjs/toolkit";
import { ServerAPI } from "decky-frontend-lib";

export const settingsMiddleware =
  (store: any) => (dispatch: Dispatch) => (action: PayloadAction<any>) => {
    const serverApi = getServerApi();
    const { setSetting, saveTdp, setPollTdp, getSettings, logInfo } =
      createServerApiHelpers(serverApi as ServerAPI);

    const result = dispatch(action);

    if (action.type === setEnableTdpProfiles.type) {
      // save setting to the backend
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
