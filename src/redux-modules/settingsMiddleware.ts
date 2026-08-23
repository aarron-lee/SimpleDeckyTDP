import { Dispatch } from "redux";
import {
  activeGameIdSelector,
  getAdvancedOptionsInfoSelector,
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
import { clearPollingInterval, setPolling } from "./pollingMiddleware";
import { PERSIST_DEBOUNCE_MS } from "../utils/constants";

const resetTdpActionTypes = [
  setEnableTdpProfiles.type,
  updateTdpProfiles.type,
  setCurrentGameInfo.type,
  updateInitialLoad.type,
] as string[];

const debouncedPersistTdp = debounce(persistTdp, PERSIST_DEBOUNCE_MS);

interface PersistGpuArgs {
  state: { settings: { tdpProfiles: Record<string, unknown> } };
  activeGameId: string;
  advancedState: Record<string, unknown>;
}

const persistGpu = ({ state, activeGameId, advancedState }: PersistGpuArgs) => {
  return saveTdpProfiles({
    tdpProfiles: state.settings.tdpProfiles,
    currentGameId: activeGameId,
    advanced: advancedState,
  });
};

const debouncedPersistGpu = debounce(persistGpu, PERSIST_DEBOUNCE_MS);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const settingsMiddleware =
  (store: { getState: () => any }) =>
  (dispatch: Dispatch) =>
  (action: PayloadAction<unknown>) => {
    const result = dispatch(action);

    const state = store.getState();

    const { advancedState } = getAdvancedOptionsInfoSelector(state);

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
      debouncedPersistTdp({
        tdp: action.payload as number,
        gameId: activeGameId,
      });
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

    return result;
  };
