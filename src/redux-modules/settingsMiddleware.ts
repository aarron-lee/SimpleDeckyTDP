import { Dispatch } from "redux";
import {
  activeGameIdSelector,
  getAdvancedOptionsInfoSelector,
  pollEnabledSelector,
  pollRateSelector,
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
  AdvancedOptionsEnum,
  createServerApiHelpers,
  getServerApi,
  persistTdp,
  setPollTdp,
} from "../backend/utils";
import { PayloadAction } from "@reduxjs/toolkit";
import { ServerAPI } from "decky-frontend-lib";
import { cleanupAction, resumeAction } from "./extraActions";
import { debounce } from "lodash";

const resetTdpActionTypes = [
  setEnableTdpProfiles.type,
  updateTdpProfiles.type,
  setCurrentGameInfo.type,
  updateInitialLoad.type,
] as string[];

let pollIntervalId: undefined | number;

let debouncedPersistTdp = debounce(persistTdp, 10);

let persistGpu = ({
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

let debouncedPersistGpu = debounce(persistGpu, 100);
const debouncedSetPollTdp = debounce(setPollTdp, 1000);

const resetPolling = (store: any) => {
  if (pollIntervalId) {
    clearInterval(pollIntervalId);
    pollIntervalId = undefined;
  }
  const state = store.getState();

  const pollEnabled = pollEnabledSelector(state);
  const pollRate = pollRateSelector(state);

  if (pollEnabled) {
    pollIntervalId = window.setInterval(() => {
      const activeGameId = activeGameIdSelector(store.getState());

      debouncedSetPollTdp(activeGameId);
    }, pollRate);
  }
};

export const settingsMiddleware =
  (store: any) => (dispatch: Dispatch) => (action: PayloadAction<any>) => {
    const serverApi = getServerApi();
    const { setSetting, saveTdpProfiles, setPollTdp } = createServerApiHelpers(
      serverApi as ServerAPI
    );

    const result = dispatch(action);

    const state = store.getState();

    const { advancedState } = getAdvancedOptionsInfoSelector(state);
    const steamPatchEnabled = Boolean(
      advancedState[AdvancedOptionsEnum.STEAM_PATCH]
    );

    if (steamPatchEnabled) {
      if (pollIntervalId) {
        clearInterval(pollIntervalId);
        pollIntervalId = undefined;
      }
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
        resetPolling(store);
      }

      if (action.type === updateAdvancedOption.type) {
        resetPolling(store);
      }

      if (resetTdpActionTypes.includes(action.type)) {
        saveTdpProfiles(
          state.settings.tdpProfiles,
          activeGameId,
          advancedState
        );
        resetPolling(store);
      }

      if (action.type === cleanupAction.type) {
        if (pollIntervalId) {
          clearInterval(pollIntervalId);
        }
      }
    }

    return result;
  };
