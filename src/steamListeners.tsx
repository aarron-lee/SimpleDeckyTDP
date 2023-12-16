import {
  extractCurrentGameInfo,
  // DEFAULT_START_TDP,
} from "./utils/constants";
import { store } from "./redux-modules/store";
import { setCurrentGameInfo } from "./redux-modules/settingsSlice";
import { suspendAction } from "./redux-modules/extraActions";

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
        store.dispatch(suspendAction());
      }
    );

    return unregister;
  } catch (e) {
    console.log(e);
  }
};
