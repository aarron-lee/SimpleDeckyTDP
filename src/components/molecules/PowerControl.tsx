import { PanelSection, PanelSectionRow } from "decky-frontend-lib";
import PowerGovernorSlider from "../atoms/PowerGovernorSlider";
import EppSlider from "../atoms/EppSlider";
import { CpuFeatureToggles } from "../atoms/CpuFeatureToggles";

const PowerControl = () => {
  return (
    <PanelSection>
      <CpuFeatureToggles />
      <PanelSectionRow>
        <PowerGovernorSlider />
      </PanelSectionRow>
      <PanelSectionRow>
        <EppSlider />
      </PanelSectionRow>
    </PanelSection>
  );
};

export default PowerControl;
