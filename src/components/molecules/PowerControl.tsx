import { PanelSection, PanelSectionRow } from "decky-frontend-lib";
import PowerGovernorSlider from "../atoms/PowerGovernorSlider";
import EppSlider from "../atoms/EppSlider";
import { CpuFeatureToggles } from "../atoms/CpuFeatureToggles";
import ErrorBoundary from "../ErrorBoundary";
import { useDispatch, useSelector } from "react-redux";
import {
  getAdvancedOptionsInfoSelector,
  getPowerControlInfoSelector,
  setScalingDriver,
} from "../../redux-modules/settingsSlice";
import { AdvancedOptionsEnum, getPowerControlInfo } from "../../backend/utils";
import { useEffect, useState } from "react";
import { PowerControlInfo } from "../../utils/constants";
import EppDropdown from "../atoms/EppDropdown";
import PowerGovernorDropdown from "../atoms/PowerGovernorDropdown";

export const usePowerControlsEnabled = () => {
  const { advancedState } = useSelector(getAdvancedOptionsInfoSelector);

  return advancedState[AdvancedOptionsEnum.ENABLE_POWER_CONTROL];
};

const PowerControl = () => {
  const powerControlsEnabled = usePowerControlsEnabled();
  const [powerControlInfo, setPowerControlInfo] = useState<
    PowerControlInfo | undefined
  >();
  const dispatch = useDispatch();

  const { powerGovernor, epp } = useSelector(getPowerControlInfoSelector);

  useEffect(() => {
    const fn = async () => {
      const results = await getPowerControlInfo();
      if (results?.success) {
        const result = results.result as PowerControlInfo;

        setPowerControlInfo(result);
        dispatch(setScalingDriver(result.scalingDriver));
      }
    };
    if (powerControlsEnabled) {
      fn();
    } else {
      setPowerControlInfo(undefined);
    }
  }, [powerGovernor, epp, powerControlsEnabled]);

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
          {/* <PowerGovernorDropdown powerControlInfo={powerControlInfo} /> */}
        </ErrorBoundary>
      </PanelSectionRow>
      <PanelSectionRow>
        <ErrorBoundary title="Epp Dropdown">
          {/* <EppDropdown powerControlInfo={powerControlInfo} /> */}
          <EppSlider powerControlInfo={powerControlInfo} />
        </ErrorBoundary>
      </PanelSectionRow>
    </PanelSection>
  );
};

export default PowerControl;
