import { PanelSection, PanelSectionRow, ToggleField } from "decky-frontend-lib";
import PowerGovernorSlider from "../atoms/PowerGovernorSlider";
import EppSlider from "../atoms/EppSlider";
import { CpuFeatureToggles } from "../atoms/CpuFeatureToggles";
import ErrorBoundary from "../ErrorBoundary";
import { useDispatch, useSelector } from "react-redux";
import {
  getAdvancedOptionsInfoSelector,
  getPowerControlInfoSelector,
} from "../../redux-modules/settingsSlice";
import { AdvancedOptionsEnum } from "../../backend/utils";
import { useEffect } from "react";
import { selectPowerControlInfo } from "../../redux-modules/uiSlice";
import { fetchPowerControlInfo } from "../../redux-modules/thunks";
import { AppDispatch } from "../../redux-modules/store";
import { useSmt } from "../../hooks/useSmt";

export const useFetchPowerControlInfo = () => {
  const dispatch = useDispatch<AppDispatch>();

  return () => dispatch(fetchPowerControlInfo());
};

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
    <PanelSection title="CPU Controls">
      {powerControlInfo.supportsCpuBoost && <CpuFeatureToggles />}
      <PanelSectionRow>
        <ToggleField
          label="Enable SMT"
          checked={smt}
          onChange={(enabled: boolean) => {
            setSmt(enabled);
          }}
          highlightOnFocus
        />
      </PanelSectionRow>
      <PanelSectionRow>
        <ErrorBoundary title="Power Governor Slider">
          <PowerGovernorSlider powerControlInfo={powerControlInfo} />
        </ErrorBoundary>
      </PanelSectionRow>
      <PanelSectionRow>
        <ErrorBoundary title="Epp Dropdown">
          <EppSlider powerControlInfo={powerControlInfo} />
        </ErrorBoundary>
      </PanelSectionRow>
    </PanelSection>
  );
};

export default PowerControl;
