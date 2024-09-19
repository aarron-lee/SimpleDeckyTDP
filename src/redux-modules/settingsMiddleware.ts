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
  createServerApiHelpers,
  getServerApi,
  persistTdp,
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

const persistGpu = ({
  saveTdpProfiles,
  state,
  activeGameId,
  advancedState,
}: any) => {
  return saveTdpProfiles(
    state.settings.tdpProfiles,
    activeGameId,
    advancedState
  );
};

const debouncedPersistGpu = debounce(persistGpu, 1000);

export const settingsMiddleware =
  (store: any) => (dispatch: Dispatch) => (action: PayloadAction<any>) => {
    const serverApi = getServerApi();
    const { setSetting, saveTdpProfiles, setPollTdp } = createServerApiHelpers(
      serverApi as any
    );

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
        setPollTdp(activeGameId);
      }

      if (
        action.type === setGpuMode.type ||
        action.type === setGpuFrequency.type ||
        action.type === setFixedGpuFrequency.type
      ) {
        debouncedPersistGpu({
          saveTdpProfiles,
          state,
          activeGameId,
          advancedState,
        });
      }

      if (action.type === setReduxTdp.type) {
        debouncedPersistTdp(action.payload, activeGameId);
      }

      if (action.type === updatePollRate.type) {
        // action.type == number (rate in ms)
        setSetting({
          fieldName: "pollRate",
          fieldValue: action.payload,
        });
        setPolling();
      }

      if (action.type === updateAdvancedOption.type) {
        setPolling();
      }

      if (resetTdpActionTypes.includes(action.type)) {
        saveTdpProfiles(
          state.settings.tdpProfiles,
          activeGameId,
          advancedState
        );
        setPolling();
      }

      if (action.type === cleanupAction.type) {
        clearPollingInterval();
      }
    }

    return result;
  };
