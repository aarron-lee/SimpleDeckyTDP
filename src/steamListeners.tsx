import {
  extractCurrentGameInfo,
  MAX_TDP_PROFILE_ID,
  // DEFAULT_START_TDP,
} from "./utils/constants";
import { store } from "./redux-modules/store";
import {
  getAdvancedOptionsInfoSelector,
  setAcPower,
  setCurrentGameInfo,
} from "./redux-modules/settingsSlice";
import { resumeAction, suspendAction } from "./redux-modules/extraActions";
import {
  AdvancedOptionsEnum,
  getCurrentAcPowerStatus,
  getSupportsCustomAcPower,
  logInfo,
  setMaxTdp,
  setPollTdp,
} from "./backend/utils";
import { debounce } from "lodash";

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
      const tempMaxTdpProfileDuration =
        advanced[AdvancedOptionsEnum.MAX_TDP_ON_GAME_PROFILE_CHANGE];

      if (tempMaxTdpProfileDuration > 0) {
        setTimeout(() => {
          setMaxTdp();

          setTimeout(() => {
            setPollTdp({ currentGameId: compareId })
          }, tempMaxTdpProfileDuration * 1000);
        }, 500);
      }

      previousIsAcPower = settings.isAcPower;

      // new currentGameId, dispatch to the store
      store.dispatch(setCurrentGameInfo(results));
    }
  }, 1000);

  return () => {
    if (currentGameInfoListenerIntervalId) {
      clearInterval(currentGameInfoListenerIntervalId);
    }
  };
};

export const suspendEventListener = () => {
  const unregister = SteamClient.System.RegisterForOnSuspendRequest(() => {
    store.dispatch(suspendAction());
  });
  return unregister;
};

export const resumeFromSuspendEventListener = () => {
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
            setMaxTdp();
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

const setAcState = (newACState: number) => {
  // eACState = 2 for AC power, 1 for Battery
  if (newACState !== eACState) {
    eACState = newACState;
    store.dispatch(setAcPower(newACState));
  }
};

let debouncedSetAcPower = debounce(setAcState, 1000);

export const acPowerEventListener = async () => {
  try {
    const supportsCustomAcPowerManagement = await getSupportsCustomAcPower();

    if (supportsCustomAcPowerManagement) {
      const intervalId = window.setInterval(async () => {
        const current_ac_power_status = await getCurrentAcPowerStatus();

        let newACState = 1;

        if (current_ac_power_status === "1") {
          newACState = 2;
        }

        setAcState(newACState);
      }, 1000);

      const unregister = () => {
        window.clearInterval(intervalId);
      };

      return unregister;
    } else {
      // use steam's battery state change
      const unregister = SteamClient.System.RegisterForBatteryStateChanges(
        (e: any) => {
          debouncedSetAcPower(e.eACState);
        }
      );
      return unregister;
    }
  } catch (e) {
    logInfo({ info: `error in ac power listener ${e}` });
  }
};
