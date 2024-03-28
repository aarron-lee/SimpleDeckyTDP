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
let previousIsAcPower: boolean | undefined;

export const currentGameInfoListener = () => {
  currentGameInfoListenerIntervalId = window.setInterval(() => {
    const results = extractCurrentGameInfo();

    const { settings } = store.getState();

    const { isAcPower, advanced } = settings;

    const compareId =
      isAcPower && advanced[AdvancedOptionsEnum.AC_POWER_PROFILES]
        ? `${results.id}-ac-power`
        : results.id;

    if (
      settings.currentGameId !== compareId ||
      settings.isAcPower !== previousIsAcPower
    ) {
      previousIsAcPower = settings.isAcPower;

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

          if (advancedState[AdvancedOptionsEnum.FORCE_DISABLE_TDP_ON_RESUME]) {
            return;
          }

          if (advancedState[AdvancedOptionsEnum.MAX_TDP_ON_RESUME]) {
            const serverApi = getServerApi();
            if (serverApi) {
              serverApi.callPluginMethod("set_max_tdp", {});
            }
          } else {
            store.dispatch(resumeAction());
          }
        }, 2000);

        const state = store.getState();

        const { advancedState } = getAdvancedOptionsInfoSelector(state);

        if (advancedState[AdvancedOptionsEnum.FORCE_DISABLE_TDP_ON_RESUME]) {
          return;
        }

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
        if (e.eACState !== eACState) {
          eACState = e.eACState;
          store.dispatch(setAcPower(e.eACState));
        }
      }
    );
    return unregister;
  } catch (e) {
    logInfo(`error in ac power listener ${e}`);
  }
};
