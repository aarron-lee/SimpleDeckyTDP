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

import steamPatch from "./steamPatch/steamPatch";
import { fetchPowerControlInfo } from "./redux-modules/thunks";
import AppContainer from "./App";

export default definePlugin(() => {
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
    name: "SimpleDeckyTDP",
    content: <AppContainer />,
    icon: <BsCpuFill />,
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
