import { PanelSection, PanelSectionRow } from "decky-frontend-lib";
import PowerGovernorSlider from "../atoms/PowerGovernorSlider";
import EppSlider from "../atoms/EppSlider";
import { CpuFeatureToggles } from "../atoms/CpuFeatureToggles";
import ErrorBoundary from "../ErrorBoundary";
import { useSelector } from "react-redux";
import { getAdvancedOptionsInfoSelector } from "../../redux-modules/settingsSlice";
import { AdvancedOptionsEnum } from "../../backend/utils";

export const usePowerControlsEnabled = () => {
  const { advancedState } = useSelector(getAdvancedOptionsInfoSelector);

  return advancedState[AdvancedOptionsEnum.ENABLE_POWER_CONTROL];
};

const PowerControl = () => {
  const isPowerControlEnabled = usePowerControlsEnabled();

  if (!isPowerControlEnabled) {
    return null;
  }

  return (
    <PanelSection title="Power Controls">
      <CpuFeatureToggles />
      <PanelSectionRow>
        <ErrorBoundary title="Power Governor Slider">
          <PowerGovernorSlider />
        </ErrorBoundary>
      </PanelSectionRow>
      <PanelSectionRow>
        <ErrorBoundary title="Epp Slider">
          <EppSlider />
        </ErrorBoundary>
      </PanelSectionRow>
    </PanelSection>
  );
};

export default PowerControl;
