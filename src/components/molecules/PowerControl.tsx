import PowerGovernorSlider from "../atoms/PowerGovernorSlider";
import EppSlider from "../atoms/EppSlider";
import { CpuFeatureToggles } from "../atoms/CpuFeatureToggles";
import ErrorBoundary from "../ErrorBoundary";
import { useSelector } from "react-redux";
import {
  getAdvancedOptionsInfoSelector,
  getPowerControlInfoSelector,
} from "../../redux-modules/settingsSlice";
import { AdvancedOptionsEnum } from "../../backend/utils";
import { useEffect } from "react";
import { selectPowerControlInfo } from "../../redux-modules/uiSlice";

import { useSmt } from "../../hooks/useSmt";
import { DeckyRow, DeckySection, DeckyToggle } from "../atoms/DeckyFrontendLib";
import { useFetchPowerControlInfo } from "../../hooks/useFetchPowerControlInfo";

export const usePowerControlsEnabled = () => {
  const { advancedState } = useSelector(getAdvancedOptionsInfoSelector);

  return advancedState[AdvancedOptionsEnum.ENABLE_POWER_CONTROL];
};

const PowerControl = () => {
  const powerControlInfo = useSelector(selectPowerControlInfo);
  const powerControlsEnabled = usePowerControlsEnabled();
  const fetchPowerControlInfo = useFetchPowerControlInfo();
  const { smt, setSmt } = useSmt();

  const { powerGovernor, epp } = useSelector(
    getPowerControlInfoSelector(powerControlInfo?.scalingDriver)
  );

  useEffect(() => {
    fetchPowerControlInfo();
  }, [powerGovernor, epp, powerControlsEnabled]);

  if (!powerControlInfo) {
    return null;
  }

  if (!powerControlInfo.powerControlsEnabled) {
    return null;
  }

  return (
    <DeckySection title="CPU Controls">
      {powerControlInfo.supportsCpuBoost && <CpuFeatureToggles />}
      {powerControlInfo.supportsSmt && (
        <DeckyRow>
          <DeckyToggle
            label="Enable SMT"
            checked={smt}
            onChange={(enabled: boolean) => {
              setSmt(enabled);
            }}
            highlightOnFocus
          />
        </DeckyRow>
      )}
      <DeckyRow>
        <ErrorBoundary title="Power Governor Slider">
          <PowerGovernorSlider powerControlInfo={powerControlInfo} />
        </ErrorBoundary>
      </DeckyRow>
      <DeckyRow>
        <ErrorBoundary title="Epp Dropdown">
          <EppSlider powerControlInfo={powerControlInfo} />
        </ErrorBoundary>
      </DeckyRow>
    </DeckySection>
  );
};

export default PowerControl;
