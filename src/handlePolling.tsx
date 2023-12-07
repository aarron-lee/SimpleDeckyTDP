import {
  LifetimeNotification,
} from "decky-frontend-lib"
import {
  extractCurrentGameInfo,
  // DEFAULT_START_TDP,
} from "./utils/constants";
import { store } from "./redux-modules/store";
import { setCurrentGameInfo } from "./redux-modules/settingsSlice";
// import { getLogInfo } from "./backend/utils";

export const registerForAppLifetimeNotifications = () => {
  const { unregister } = window.SteamClient.GameSessions.RegisterForAppLifetimeNotifications((data: LifetimeNotification) => {
    const { bRunning: running } = data;
    // const logInfo = getLogInfo()
    const results = extractCurrentGameInfo()

    if(running) {

      // logInfo && logInfo(`if: ${currrentAppId} ${running}, ${JSON.stringify(results)}`)

      store.dispatch(setCurrentGameInfo(results))
    } else {
      // logInfo && logInfo(`else: ${currrentAppId} ${running}, ${JSON.stringify(results)}`)

      store.dispatch(setCurrentGameInfo({ id: 'default', displayName: 'default'}))
    }
  });
  return unregister as () => void;
}

// let currentGameInfoListenerIntervalId: undefined | number;

// let previousGameId = ""

// export const currentGameInfoListener = () => {
//   currentGameInfoListenerIntervalId = window.setInterval(() => {
//     const results = extractCurrentGameInfo();

//     if(results.id !== previousGameId) {
//       store.dispatch(setCurrentGameInfo(results));
//       previousGameId = results.id;
//     }
//   }, 500);

//   return () => {
//     if (currentGameInfoListenerIntervalId) {
//       clearInterval(currentGameInfoListenerIntervalId);
//     }
//   };
// };
