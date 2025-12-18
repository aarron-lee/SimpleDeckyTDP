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
import { resumeAction, suspendAction } from "./redux-modules/extraActions";
import {
  AdvancedOptionsEnum,
  getCurrentAcPowerStatus,
  getSupportsCustomAcPower,
  logInfo,
  setMaxTdp,
  setPollTdp,
} from "./backend/utils";
import {
  getSuspendObservable,
  getResumeObservable,
} from "./suspendResumeObservable/suspendResumeObservables";
import { debounce } from "lodash";
import {
  clearPollingInterval,
  setPolling,
} from "./redux-modules/pollingMiddleware";

let currentGameInfoListenerIntervalId: undefined | number;
let previousIsAcPower: boolean | undefined;
let tempMaxTdpTimeoutId: number | undefined;

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
      handleTempMaxTdpProfile(compareId, advanced);

      previousIsAcPower = settings.isAcPower;

      // new currentGameId, dispatch to the store
      store.dispatch(setCurrentGameInfo(results));
    }
  }, 2000);

  return () => {
    if (currentGameInfoListenerIntervalId) {
      clearInterval(currentGameInfoListenerIntervalId);
    }
  };
};

function handleTempMaxTdpProfile(compareId: string, advanced: any) {
  if (tempMaxTdpTimeoutId !== undefined) {
    clearTimeout(tempMaxTdpTimeoutId);
    tempMaxTdpTimeoutId = undefined;
  }

  const tempMaxTdpProfileDuration =
    advanced[AdvancedOptionsEnum.MAX_TDP_ON_GAME_PROFILE_CHANGE];

  if (tempMaxTdpProfileDuration > 0 && !compareId.includes("default")) {
    tempMaxTdpTimeoutId = window.setTimeout(() => {
      clearPollingInterval();
      setMaxTdp();

      tempMaxTdpTimeoutId = window.setTimeout(() => {
        setPollTdp({ currentGameId: compareId });
        setPolling();
      }, tempMaxTdpProfileDuration * 1000);
    }, 500);
  }
}

const onSuspend = () => {
  const state = store.getState();

  const { advancedState } = getAdvancedOptionsInfoSelector(state);

  if (!advancedState[AdvancedOptionsEnum.FORCE_DISABLE_SUSPEND_ACTIONS]) {
    store.dispatch(suspendAction());
  }
};

export const suspendEventListener = () => {
  try {
    const unregister =
      SteamClient.System.RegisterForOnSuspendRequest(onSuspend).unregister;
    return unregister;
  } catch (e) {
    console.log(e);
  }

  // try mobx suspend observable
  try {
    const suspendObservable = getSuspendObservable();

    if (suspendObservable) {
      const unregister = suspendObservable.observe_((change) => {
        const { newValue } = change;

        logInfo({ info: `mobX suspend triggered with ${newValue}` });

        if (!newValue) {
          return;
        }

        onSuspend();
      });
      if (unregister) return unregister;
    }
  } catch (e) {
    console.error(e);
  }

  // fallback to a different path for suspend if SteamClient.System option not available
  try {
    const unregisterOnSuspend =
      SteamClient.User.RegisterForPrepareForSystemSuspendProgress(
        onSuspend,
      ).unregister;
    return unregisterOnSuspend;
  } catch (e) {
    console.error(e);
  }
};

const onResume = async () => {
  setTimeout(() => {
    const state = store.getState();

    const { advancedState } = getAdvancedOptionsInfoSelector(state);

    if (advancedState[AdvancedOptionsEnum.FORCE_DISABLE_TDP_ON_RESUME]) {
      return;
    }

    if (advancedState[AdvancedOptionsEnum.MAX_TDP_ON_RESUME]) {
      clearPollingInterval();
      setMaxTdp();
    } else {
      store.dispatch(resumeAction());
    }
  }, 3500);

  const state = store.getState();

  const { advancedState } = getAdvancedOptionsInfoSelector(state);

  if (advancedState[AdvancedOptionsEnum.FORCE_DISABLE_TDP_ON_RESUME]) {
    return;
  }

  let t = 10000;

  if (advancedState[AdvancedOptionsEnum.MAX_TDP_ON_RESUME]) {
    t = 15000;
  }

  // sets TDP, etc, to default expected values
  setTimeout(() => {
    if (advancedState[AdvancedOptionsEnum.MAX_TDP_ON_RESUME]) {
      setPolling();
    }
    store.dispatch(resumeAction());
  }, t);
};

export const resumeFromSuspendEventListener = () => {
  try {
    const unregister =
      SteamClient.System.RegisterForOnResumeFromSuspend(onResume).unregister;
    return unregister;
  } catch (e) {
    console.log(e);
  }

  // try mobx resume observable
  try {
    const resumeObservable = getResumeObservable();

    if (resumeObservable) {
      const unregister = resumeObservable.observe_((change) => {
        const { newValue } = change;
        logInfo({ info: `mobX resume triggered with ${newValue}` });

        if (!newValue) {
          return;
        }

        onResume();
      });
      if (unregister) return unregister;
    }
  } catch (e) {
    console.error(e);
  }

  // fallback to a different path for resume if SteamClient.System option not available
  try {
    const unregisterOnResume =
      SteamClient.User.RegisterForResumeSuspendedGamesProgress(
        onResume,
      ).unregister;
    return unregisterOnResume;
  } catch (e) {
    console.error(e);
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
    const supportsCustomAcPowerManagement: unknown =
      await getSupportsCustomAcPower();

    if (supportsCustomAcPowerManagement as boolean) {
      const intervalId = window.setInterval(async () => {
        const current_ac_power_status: unknown =
          await getCurrentAcPowerStatus();

        let newACState = 1;

        if ((current_ac_power_status as string) === "1") {
          newACState = 2;
        }

        setAcState(newACState);
      }, 2000);

      const unregister = () => {
        window.clearInterval(intervalId);
      };

      return unregister;
    } else {
      // use steam's battery state change
      const unregister = SteamClient.System.RegisterForBatteryStateChanges(
        (e: any) => {
          debouncedSetAcPower(e.eACState);
        },
      ).unregister;
      return unregister;
    }
  } catch (e) {
    logInfo({ info: `error in ac power listener ${e}` });
  }
};
