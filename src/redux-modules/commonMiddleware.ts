import { Dispatch } from "redux";
import {
  activeGameIdSelector,
  getAdvancedOptionsInfoSelector,
  getSteamPatchEnabledSelector,
  setCpuBoost,
  setEnableTdpProfiles,
  updateAdvancedOption,
  updateEpp,
  updateMaxTdp,
  updateMinTdp,
  updatePowerGovernor,
} from "./settingsSlice";
import {
  createServerApiHelpers,
  getServerApi,
  persistCpuBoost,
  setEpp,
  setPowerGovernor,
} from "../backend/utils";
import { PayloadAction } from "@reduxjs/toolkit";
import { ServerAPI } from "decky-frontend-lib";
import { extractCurrentGameId } from "../utils/constants";

export const commonMiddleware =
  (store: any) => (dispatch: Dispatch) => (action: PayloadAction<any>) => {
    const serverApi = getServerApi();
    const { setSetting } = createServerApiHelpers(serverApi as ServerAPI);

    const result = dispatch(action);

    const state = store.getState();

    const steamPatchEnabled = getSteamPatchEnabledSelector(state);

    const activeGameId = steamPatchEnabled
      ? extractCurrentGameId()
      : activeGameIdSelector(state);

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

    if (action.type === updatePowerGovernor.type) {
      setPowerGovernor(action.payload, activeGameId);
    }

    if (action.type === updateEpp.type) {
      setEpp(action.payload, activeGameId);
    }

    if (action.type === updateMaxTdp.type) {
      setSetting({
        fieldName: "maxTdp",
        fieldValue: action.payload,
      });
    }

    if (action.type === updateAdvancedOption.type) {
      const { advancedState } = getAdvancedOptionsInfoSelector(state);
      setSetting({
        fieldName: "advanced",
        fieldValue: advancedState,
      });
    }

    if (action.type === setCpuBoost.type) {
      persistCpuBoost(action.payload, activeGameId);
    }

    return result;
  };
