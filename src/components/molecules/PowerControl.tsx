import { PanelSection, PanelSectionRow } from "decky-frontend-lib";
import PowerGovernorSlider from "../atoms/PowerGovernorSlider";
import EppSlider from "../atoms/EppSlider";

const PowerControl = () => {
  return (
    <PanelSection title="Power Control">
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
