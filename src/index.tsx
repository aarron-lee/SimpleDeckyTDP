import { definePlugin } from "@decky/api";
import { BsCpuFill } from "react-icons/bs";
import { getSettings, setValuesForGameId } from "./backend/utils";
import { store } from "./redux-modules/store";
import {
  acPowerEventListener,
  currentGameInfoListener,
  resumeFromSuspendEventListener,
  suspendEventListener,
} from "./steamListeners";
import { updateInitialLoad } from "./redux-modules/settingsSlice";

import { cleanupAction } from "./redux-modules/extraActions";

import { fetchPowerControlInfo } from "./redux-modules/thunks";
import AppContainer from "./App";
import { initializePollingStore } from "./redux-modules/pollingMiddleware";

export default definePlugin(() => {
  initializePollingStore(store);

  // fetch settings from backend, send into redux state
  getSettings().then((result) => {
    const results = result || {};

    store.dispatch(
      updateInitialLoad({
        ...results,
      }),
    );
    store.dispatch(fetchPowerControlInfo());

    setTimeout(() => {
      setValuesForGameId({ gameId: "default" });
    }, 0);
  });

  const unregisterCurrentGameListener = currentGameInfoListener();
  const unregisterResumeListener = resumeFromSuspendEventListener();
  const unregisterSuspendListener = suspendEventListener();

  let unregisterAcPowerListener: any;

  acPowerEventListener().then((unregister) => {
    unregisterAcPowerListener = unregister;
  });

  return {
    name: "SimpleDeckyTDP",
    content: <AppContainer />,
    icon: <BsCpuFill />,
    onDismount: () => {
      try {
        store.dispatch(cleanupAction());
        // if (unpatch) unpatch();
        if (unregisterCurrentGameListener) unregisterCurrentGameListener();
        if (
          unregisterAcPowerListener &&
          typeof unregisterAcPowerListener === "function"
        )
          unregisterAcPowerListener();
        if (
          unregisterSuspendListener &&
          typeof unregisterSuspendListener === "function"
        )
          unregisterSuspendListener();
        if (
          unregisterResumeListener &&
          typeof unregisterResumeListener === "function"
        )
          unregisterResumeListener();
      } catch (e) {
        console.error(e);
      }
    },
  };
});
