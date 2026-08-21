import { Dispatch } from "redux";
import {
  activeGameIdSelector,
  getAdvancedOptionsInfoSelector,
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
import { suspendAction } from "./extraActions";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const commonMiddleware =
  (store: { getState: () => any }) =>
  (dispatch: Dispatch) =>
  (action: PayloadAction<unknown>) => {
    const result = dispatch(action);

    const state = store.getState();

    const activeGameId = activeGameIdSelector(state);

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
      setPowerGovernor({
        powerGovernorInfo: action.payload as {
          powerGovernor: string;
          scalingDriver: string;
        },
        gameId: activeGameId,
      });
    }

    if (action.type === updateEpp.type) {
      setEpp({
        eppInfo: action.payload as { epp: string; scalingDriver: string },
        gameId: activeGameId,
      });
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
      persistSmt({ smt: action.payload as boolean, gameId: activeGameId });
    }

    if (action.type === setCpuBoost.type) {
      persistCpuBoost({
        cpuBoost: action.payload as boolean,
        gameId: activeGameId,
      });
    }

    return result;
  };
