import {
  extractCurrentGameInfo,
  // DEFAULT_START_TDP,
} from "./utils/constants";
import { store } from "./redux-modules/store";
import {
  getAdvancedOptionsInfoSelector,
  setAcPower,
  setCurrentGameInfo,
} from "./redux-modules/settingsSlice";
import { resumeAction } from "./redux-modules/extraActions";
import { AdvancedOptionsEnum, getServerApi, logInfo } from "./backend/utils";

let currentGameInfoListenerIntervalId: undefined | number;

export const currentGameInfoListener = () => {
  currentGameInfoListenerIntervalId = window.setInterval(() => {
    const results = extractCurrentGameInfo();

    const { settings } = store.getState();

    if (settings.currentGameId !== results.id) {
      // new currentGameId, dispatch to the store
      store.dispatch(setCurrentGameInfo(results));
    }
  }, 500);

  return () => {
    if (currentGameInfoListenerIntervalId) {
      clearInterval(currentGameInfoListenerIntervalId);
    }
  };
};

export const suspendEventListener = () => {
  try {
    const unregister = SteamClient.System.RegisterForOnResumeFromSuspend(
      async () => {
        setTimeout(() => {
          const state = store.getState();

          const { advancedState } = getAdvancedOptionsInfoSelector(state);

          if (advancedState[AdvancedOptionsEnum.MAX_TDP_ON_RESUME]) {
            const serverApi = getServerApi();
            if (serverApi) {
              serverApi.callPluginMethod("set_max_tdp", {});
            }
          } else {
            store.dispatch(resumeAction());
          }
        }, 2000);

        // sets TDP, etc, to default expected values
        setTimeout(() => {
          store.dispatch(resumeAction());
        }, 10000);
      }
    );

    return unregister;
  } catch (e) {
    console.log(e);
  }
};

let eACState: number | undefined;

export const acPowerEventListener = () => {
  try {
    const unregister = SteamClient.System.RegisterForBatteryStateChanges(
      (e: any) => {
        // eACState = 2 for AC power, 1 for Battery
        // logInfo(e.eACState);
        if (e.eACState !== eACState) {
          eACState = e.eACState;
          store.dispatch(setAcPower(e.eACState));

          setTimeout(() => {
            store.dispatch(resumeAction());
          }, 2000);
        }
      }
    );
    return unregister;
  } catch (e) {
    logInfo(`error in ac power listener ${e}`);
  }
};
