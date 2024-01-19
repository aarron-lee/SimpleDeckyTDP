import { definePlugin, ServerAPI, staticClasses } from "decky-frontend-lib";
import { FC, memo } from "react";
import { FaShip } from "react-icons/fa";
import TdpRange from "./components/molecules/TdpRange";
import { TdpSlider } from "./components/molecules/TdpSlider";
import { PollTdp } from "./components/molecules/PollTdp";
import { store } from "./redux-modules/store";
import { Provider } from "react-redux";
import { createServerApiHelpers, saveServerApi } from "./backend/utils";
import { TdpProfiles } from "./components/molecules/TdpProfiles";
import {
  currentGameInfoListener,
  suspendEventListener,
} from "./steamListeners";
import { updateInitialLoad } from "./redux-modules/settingsSlice";
import {
  useFetchInitialStateEffect,
  useIsInitiallyLoading,
} from "./hooks/useInitialState";
import { cleanupAction } from "./redux-modules/extraActions";
import { CpuFeatureToggles } from "./components/atoms/CpuFeatureToggles";
import Gpu from "./components/molecules/Gpu";
import AdvancedOptions, {
  useIsSteamPatchEnabled,
  useIsTdpControlEnabled,
} from "./components/molecules/AdvancedOptions";
import OtaUpdates from "./components/molecules/OtaUpdates";
import ErrorBoundary from "./components/ErrorBoundary";
import steamPatch from "./steamPatch";

const Content: FC<{ serverAPI?: ServerAPI }> = memo(({}) => {
  useFetchInitialStateEffect();

  const loading = useIsInitiallyLoading();

  const tdpControlEnabled = useIsTdpControlEnabled();

  const steamPatchEnabled = useIsSteamPatchEnabled();

  return (
    <>
      {!loading && (
        <>
          {tdpControlEnabled && (
            <>
              <TdpSlider />
            </>
          )}
          <TdpProfiles />
          <CpuFeatureToggles />
          {!steamPatchEnabled && (
            <>
              <Gpu />
              <TdpRange />
              <PollTdp />
            </>
          )}
          <AdvancedOptions />
          <ErrorBoundary title="OTA Updates">
            <OtaUpdates />
          </ErrorBoundary>
        </>
      )}
    </>
  );
});

const ContentContainer: FC<{ serverAPI: ServerAPI }> = ({ serverAPI }) => {
  return (
    <Provider store={store}>
      <ErrorBoundary title="App">
        <Content serverAPI={serverAPI} />
      </ErrorBoundary>
    </Provider>
  );
};

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
    }
  });

  const unpatch = steamPatch();

  const onUnmount = currentGameInfoListener();
  const unregisterSuspendListener = suspendEventListener();

  return {
    title: <div className={staticClasses.Title}>SimpleDeckyTDP</div>,
    content: <ContentContainer serverAPI={serverApi} />,
    icon: <FaShip />,
    onDismount: () => {
      if (unpatch) unpatch();
      if (onUnmount) onUnmount();
      if (unregisterSuspendListener) unregisterSuspendListener();
      store.dispatch(cleanupAction());
    },
  };
});
