import { FC, memo } from "react";
import TdpRange from "./components/molecules/TdpRange";
import { TdpSlider } from "./components/molecules/TdpSlider";
import { PollTdp } from "./components/molecules/PollTdp";
import { store } from "./redux-modules/store";
import { Provider } from "react-redux";
import { TdpProfiles } from "./components/molecules/TdpProfiles";
import {
  useFetchInitialStateEffect,
  useIsInitiallyLoading,
} from "./hooks/useInitialState";
import Gpu from "./components/molecules/Gpu";
import AdvancedOptions, {
  useIsSteamPatchEnabled,
} from "./components/molecules/AdvancedOptions";
import OtaUpdates from "./components/molecules/OtaUpdates";
import ErrorBoundary from "./components/ErrorBoundary";
import { SteamPatchDefaultTdpSlider } from "./components/molecules/SteamPatchDefaultTdpSlider";
import PowerControl from "./components/molecules/PowerControl";
import { DeckySection } from "./components/atoms/DeckyFrontendLib";
import { useIsDesktop } from "./hooks/desktopHooks";
import { AdvancedOptionsEnum } from "./backend/utils";
import { useAdvancedOption } from "./hooks/useAdvanced";

const App: FC = memo(({}) => {
  useFetchInitialStateEffect();

  const loading = useIsInitiallyLoading();

  const isDesktop = useIsDesktop();
  const steamPatchEnabled = useIsSteamPatchEnabled();
  const tdpControlEnabled = useAdvancedOption(
    AdvancedOptionsEnum.ENABLE_TDP_CONTROL
  );

  return (
    <>
      {!loading && (
        <>
          <DeckySection>
            <TdpProfiles isDesktop={isDesktop} />
            {tdpControlEnabled && (!steamPatchEnabled || isDesktop) && (
              <>
                <TdpSlider />
              </>
            )}
            <Gpu />
          </DeckySection>
          <PowerControl />
          {tdpControlEnabled && !isDesktop && steamPatchEnabled && (
            <SteamPatchDefaultTdpSlider />
          )}
          {tdpControlEnabled && (
            <>
              <TdpRange />
              <PollTdp />
            </>
          )}
          <AdvancedOptions />
          {!isDesktop && (
            <ErrorBoundary title="OTA Updates">
              <OtaUpdates />
            </ErrorBoundary>
          )}
        </>
      )}
    </>
  );
});

const AppContainer: FC = ({}) => {
  return (
    <Provider store={store}>
      <ErrorBoundary title="App">
        <App />
      </ErrorBoundary>
    </Provider>
  );
};

export default AppContainer;
