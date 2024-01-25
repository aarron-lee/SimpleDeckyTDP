import { PanelSection, PanelSectionRow } from "decky-frontend-lib";
import PowerGovernorSlider from "../atoms/PowerGovernorSlider";
import EppSlider from "../atoms/EppSlider";
import { CpuFeatureToggles } from "../atoms/CpuFeatureToggles";
import ErrorBoundary from "../ErrorBoundary";
import { useSelector } from "react-redux";
import { getAdvancedOptionsInfoSelector } from "../../redux-modules/settingsSlice";
import { AdvancedOptionsEnum, getPowerControlInfo } from "../../backend/utils";
import { useEffect, useState } from "react";
import { PowerControlInfo } from "../../utils/constants";

export const usePowerControlsEnabled = () => {
  const { advancedState } = useSelector(getAdvancedOptionsInfoSelector);

  return advancedState[AdvancedOptionsEnum.ENABLE_POWER_CONTROL];
};

const PowerControl = () => {
  const [powerControlInfo, setPowerControlInfo] = useState<
    PowerControlInfo | undefined
  >();

  useEffect(() => {
    const fn = async () => {
      const results = await getPowerControlInfo();
      if (results?.success) {
        const result = results.result as PowerControlInfo;

        setPowerControlInfo(result);
      }
    };
    fn();
  }, []);

  if (!powerControlInfo) {
    return null;
  }

  if (!powerControlInfo.powerControlsEnabled) {
    return null;
  }

  return (
    <PanelSection title="Power Controls">
      <CpuFeatureToggles />
      <PanelSectionRow>
        <ErrorBoundary title="Power Governor Slider">
          <PowerGovernorSlider powerControlInfo={powerControlInfo} />
        </ErrorBoundary>
      </PanelSectionRow>
      <PanelSectionRow>
        <ErrorBoundary title="Epp Slider">
          <EppSlider powerControlInfo={powerControlInfo} />
        </ErrorBoundary>
      </PanelSectionRow>
    </PanelSection>
  );
};

export default PowerControl;
