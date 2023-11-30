import { Dispatch } from "redux";
import { RootState } from "./store";
import { setEnableTdpProfiles } from "./settingsSlice";
import { createServerApiHelpers, getServerApi } from "../backend/utils";
import { PayloadAction } from "@reduxjs/toolkit";
import { ServerAPI } from "decky-frontend-lib";

export const settingsMiddleware =
  (store: any) => (dispatch: Dispatch) => (action: PayloadAction<any>) => {
    const serverApi = getServerApi();
    const { setSetting } = createServerApiHelpers(serverApi as ServerAPI);

    const result = dispatch(action);

    if (action.type === setEnableTdpProfiles.type) {
      // save setting to the backend
      setSetting({
        fieldName: "enableTdpProfiles",
        fieldValue: action.payload,
      });
    }

    return result;
  };
