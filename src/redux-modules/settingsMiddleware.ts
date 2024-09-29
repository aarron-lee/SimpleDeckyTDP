import { Dispatch } from "redux";
import {
  activeGameIdSelector,
  getAdvancedOptionsInfoSelector,
  getSteamPatchEnabledSelector,
  setCurrentGameInfo,
  setEnableTdpProfiles,
  setFixedGpuFrequency,
  setGpuFrequency,
  setGpuMode,
  setReduxTdp,
  updateAdvancedOption,
  updateInitialLoad,
  updatePollRate,
  updateTdpProfiles,
} from "./settingsSlice";
import {
  setSetting,
  setPollTdp,
  persistTdp,
  saveTdpProfiles,
} from "../backend/utils";
import { PayloadAction } from "@reduxjs/toolkit";
import { cleanupAction, resumeAction } from "./extraActions";
import { debounce } from "lodash";
import {
  clearIntervalOnSteamPatchChange,
  clearPollingInterval,
  setPolling,
} from "./pollingMiddleware";

const resetTdpActionTypes = [
  setEnableTdpProfiles.type,
  updateTdpProfiles.type,
  setCurrentGameInfo.type,
  updateInitialLoad.type,
] as string[];

const debouncedPersistTdp = debounce(persistTdp, 1000);

const persistGpu = ({ state, activeGameId, advancedState }: any) => {
  return saveTdpProfiles({
    tdpProfiles: state.settings.tdpProfiles,
    currentGameId: activeGameId,
    advanced: advancedState,
  });
};

const debouncedPersistGpu = debounce(persistGpu, 1000);

export const settingsMiddleware =
  (store: any) => (dispatch: Dispatch) => (action: PayloadAction<any>) => {
    const result = dispatch(action);

    const state = store.getState();

    const { advancedState } = getAdvancedOptionsInfoSelector(state);
    const steamPatchEnabled = getSteamPatchEnabledSelector(state);

    if (steamPatchEnabled) {
      clearIntervalOnSteamPatchChange(steamPatchEnabled);
    } else {
      const activeGameId = activeGameIdSelector(state);

      if (action.type === resumeAction.type) {
        // pollTdp simply tells backend to set TDP according to settings.json
        setPollTdp({ currentGameId: activeGameId });
      }

      if (
        action.type === setGpuMode.type ||
        action.type === setGpuFrequency.type ||
        action.type === setFixedGpuFrequency.type
      ) {
        debouncedPersistGpu({
          state,
          activeGameId,
          advancedState,
        });
      }

      if (action.type === setReduxTdp.type) {
        debouncedPersistTdp({ tdp: action.payload, gameId: activeGameId });
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

      if (resetTdpActionTypes.includes(action.type)) {
        saveTdpProfiles({
          tdpProfiles: state.settings.tdpProfiles,
          currentGameId: activeGameId,
          advanced: advancedState,
        });
        setPolling();
      }

      if (action.type === cleanupAction.type) {
        clearPollingInterval();
      }
    }

    return result;
  };
