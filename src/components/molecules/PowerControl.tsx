import { PanelSection, PanelSectionRow } from "decky-frontend-lib";
import PowerGovernorSlider from "../atoms/PowerGovernorSlider";
import EppSlider from "../atoms/EppSlider";
import { CpuFeatureToggles } from "../atoms/CpuFeatureToggles";
import ErrorBoundary from "../ErrorBoundary";

const PowerControl = () => {
  return (
    <PanelSection>
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
