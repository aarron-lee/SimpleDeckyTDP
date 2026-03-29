import { FC, memo } from "react";
import TdpRange from "./components/molecules/TdpRange";
import { TdpSlider } from "./components/molecules/TdpSlider";
import { PollTdp } from "./components/molecules/PollTdp";
import { store } from "./redux-modules/store";
import { Provider, useSelector } from "react-redux";
import { TdpProfiles } from "./components/molecules/TdpProfiles";
import {
  useFetchInitialStateEffect,
  useIsInitiallyLoading,
} from "./hooks/useInitialState";
import Gpu from "./components/molecules/Gpu";
import AdvancedOptions from "./components/molecules/AdvancedOptions";
import OtaUpdates from "./components/molecules/OtaUpdates";
import ErrorBoundary from "./components/ErrorBoundary";
import PowerControl from "./components/molecules/PowerControl";
import { DeckySection } from "./components/atoms/DeckyFrontendLib";
import { useIsDesktop } from "./hooks/desktopHooks";
import { AdvancedOptionsEnum } from "./backend/utils";
import { useAdvancedOption } from "./hooks/useAdvanced";
import { maxTdpAcProfilesEnabledSelector } from "./redux-modules/settingsSlice";
import { MaxTdpSlider } from "./components/molecules/MaxTdpSlider";

const App: FC = memo(({}) => {
  useFetchInitialStateEffect();

  const loading = useIsInitiallyLoading();

  const isDesktop = useIsDesktop();
  const tdpControlEnabled = useAdvancedOption(
    AdvancedOptionsEnum.ENABLE_TDP_CONTROL
  );
  const maxTdpAcProfileEnabled = useSelector(
    maxTdpAcProfilesEnabledSelector
  )
  const gpuControlEnabled = useAdvancedOption(
    AdvancedOptionsEnum.ENABLE_GPU_CONTROL
  );

  return (
    <>
      {!loading && (
        <>
          <DeckySection>
            <TdpProfiles isDesktop={isDesktop} />
            {tdpControlEnabled && !maxTdpAcProfileEnabled && <TdpSlider />}
            {tdpControlEnabled && maxTdpAcProfileEnabled && <MaxTdpSlider />}
            {gpuControlEnabled && <Gpu />}
          </DeckySection>
          <PowerControl />
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
