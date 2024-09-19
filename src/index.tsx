import { definePlugin, ServerAPI, staticClasses } from "decky-frontend-lib";
import { FaShip } from "react-icons/fa";
import {
  createServerApiHelpers,
  saveServerApi,
  setValuesForGameId,
} from "./backend/utils";
import { store } from "./redux-modules/store";
import {
  acPowerEventListener,
  currentGameInfoListener,
  resumeFromSuspendEventListener,
  suspendEventListener
} from "./steamListeners";
import { updateInitialLoad } from "./redux-modules/settingsSlice";

import { cleanupAction } from "./redux-modules/extraActions";

import steamPatch from "./steamPatch/steamPatch";
import { fetchPowerControlInfo } from "./redux-modules/thunks";
import AppContainer from "./App";

export default definePlugin((serverApi: ServerAPI) => {
  saveServerApi(serverApi);

  const { getSettings } = createServerApiHelpers(serverApi);

  // fetch settings from backend, send into redux state
  getSettings().then((result) => {
    if (result.success) {
      const results = result.result || {};

      store.dispatch(
        updateInitialLoad({
          ...results,
        })
      );
      store.dispatch(fetchPowerControlInfo());

      setTimeout(() => {
        setValuesForGameId("default");
      }, 0);
    }
  });

  // const unpatch = steamPatch();

  const onUnmount = currentGameInfoListener();
  const unregisterResumeFromSuspendListener = resumeFromSuspendEventListener();
  const unregisterSuspendListener = suspendEventListener();

  let unregisterAcPowerListener: any;

  acPowerEventListener().then((unregister) => {
    unregisterAcPowerListener = unregister;
  });

  return {
    title: <div className={staticClasses.Title}>SimpleDeckyTDP</div>,
    content: <AppContainer />,
    icon: <FaShip />,
    onDismount: () => {
      try {
        store.dispatch(cleanupAction());
        // if (unpatch) unpatch();
        if (onUnmount) onUnmount();
        if (
          unregisterSuspendListener &&
          typeof unregisterSuspendListener === "function"
        )
          unregisterSuspendListener();
        if (
          unregisterResumeFromSuspendListener &&
          typeof unregisterResumeFromSuspendListener === "function"
        )
          unregisterResumeFromSuspendListener();
        if (
          unregisterAcPowerListener &&
          typeof unregisterAcPowerListener === "function"
        )
          unregisterAcPowerListener();
      } catch (e) {
        console.error(e);
      }
    },
  };
});
