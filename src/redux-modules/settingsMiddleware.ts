import { Dispatch } from "redux";
import {
  activeGameIdSelector,
  disableBackgroundPollingSelector,
  getAdvancedOptionsInfoSelector,
  pollEnabledSelector,
  pollRateSelector,
  setCurrentGameInfo,
  setDisableBackgroundPolling,
  setEnableTdpProfiles,
  setFixedGpuFrequency,
  setGpuFrequency,
  setGpuMode,
  setPolling,
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
} from "../backend/utils";
import { PayloadAction } from "@reduxjs/toolkit";
import { ServerAPI } from "decky-frontend-lib";
import { cleanupAction, resumeAction } from "./extraActions";

const resetTdpActionTypes = [
  setEnableTdpProfiles.type,
  updateTdpProfiles.type,
  updatePollRate.type,
  setCurrentGameInfo.type,
  setPolling.type,
  updateInitialLoad.type,
] as string[];

let pollIntervalId: undefined | number;

// always have a default 10 second poll rate in the background
// some devices mess with TDP in the background, e.g. Lenovo Legion Go
const BACKGROUND_POLL_RATE = 10000;

const resetPolling = (store: any) => {
  if (pollIntervalId) {
    clearInterval(pollIntervalId);
    pollIntervalId = undefined;
  }
  const state = store.getState();

  const disableBackgroundPolling = disableBackgroundPollingSelector(state);
  const pollOverrideEnabled = pollEnabledSelector(state);
  const pollRateOverride = pollRateSelector(state);

  const actualPollRate = pollOverrideEnabled
    ? pollRateOverride
    : BACKGROUND_POLL_RATE;

  if (!disableBackgroundPolling) {
    pollIntervalId = window.setInterval(() => {
      const serverApi = getServerApi();
      const { setPollTdp } = createServerApiHelpers(serverApi as ServerAPI);
      const activeGameId = activeGameIdSelector(store.getState());

      setPollTdp(activeGameId);
    }, actualPollRate);
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

      if (action.type === setDisableBackgroundPolling.type) {
        // update value on backend
        setSetting({
          fieldName: "disableBackgroundPolling",
          fieldValue: action.payload,
        });

        // reset polling
        resetPolling(store);
      }

      if (
        action.type === setGpuMode.type ||
        action.type === setGpuFrequency.type ||
        action.type === setFixedGpuFrequency.type
      ) {
        saveTdpProfiles(
          state.settings.tdpProfiles,
          activeGameId,
          advancedState
        );
      }

      if (action.type === setReduxTdp.type) {
        persistTdp(action.payload, activeGameId);
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
