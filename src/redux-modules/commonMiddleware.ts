import { Dispatch } from "redux";
import {
  activeGameIdSelector,
  getAdvancedOptionsInfoSelector,
  getSteamPatchEnabledSelector,
  setCpuBoost,
  setEnableTdpProfiles,
  setSmt,
  updateAdvancedOption,
  updateEpp,
  updateMaxTdp,
  updateMinTdp,
  updatePowerGovernor,
} from "./settingsSlice";
import {
  setSetting,
  persistCpuBoost,
  persistSmt,
  setEpp,
  setPowerGovernor,
  onSuspend,
} from "../backend/utils";
import { PayloadAction } from "@reduxjs/toolkit";
import { extractCurrentGameId } from "../utils/constants";
import { suspendAction } from "./extraActions";

export const commonMiddleware =
  (store: any) => (dispatch: Dispatch) => (action: PayloadAction<any>) => {
    const result = dispatch(action);

    const state = store.getState();

    const steamPatchEnabled = getSteamPatchEnabledSelector(state);

    const activeGameId = steamPatchEnabled
      ? extractCurrentGameId()
      : activeGameIdSelector(state);

    if (action.type === suspendAction.type) {
      onSuspend();
    }

    if (action.type === setEnableTdpProfiles.type) {
      setSetting({
        name: "enableTdpProfiles",
        value: action.payload,
      });
    }
    if (action.type === updateMinTdp.type) {
      setSetting({
        name: "minTdp",
        value: action.payload,
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
        name: "maxTdp",
        value: action.payload,
      });
    }

    if (action.type === updateAdvancedOption.type) {
      const { advancedState } = getAdvancedOptionsInfoSelector(state);
      setSetting({
        name: "advanced",
        value: advancedState,
      });
    }

    if (action.type === setSmt.type) {
      persistSmt(action.payload, activeGameId);
    }

    if (action.type === setCpuBoost.type) {
      persistCpuBoost(action.payload, activeGameId);
    }

    return result;
  };
