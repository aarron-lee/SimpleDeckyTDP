import { useDispatch, useSelector } from "react-redux";
import {
  getPowerControlInfoSelector,
  updateEpp,
} from "../../redux-modules/settingsSlice";
import {
  DEFAULT_POWER_CONTROLS,
  EppOption,
  EppOptions,
  PowerControlInfo,
  ScalingDrivers,
  simpleEppLabels,
} from "../../utils/constants";
import { capitalize } from "lodash";
import { FC } from "react";
import { DeckySlider, NotchLabel } from "./DeckyFrontendLib";
import { useAdvancedOption } from "../../hooks/useAdvanced";
import { AdvancedOptionsEnum } from "../../backend/utils";

const getOptions = (eppOptions: EppOption[], simpleLabelsEnabled = false) => {
  const idxToOption: { [key: string]: any } = {};
  const optionToIdx: { [key: string]: any } = {};
  const notchLabels: NotchLabel[] = [];

  let notchIdx = 0;
  eppOptions.forEach((option) => {
    if (EppOptions[option]) {
      idxToOption[notchIdx] = option;
      optionToIdx[option] = notchIdx;

      let label = EppOptions[option] as string;

      if (simpleLabelsEnabled && simpleEppLabels[label]) {
        label = simpleEppLabels[label];
      } else {
        label = capitalize(label.replace(/_/g, " "));
      }

      notchLabels.push({
        notchIndex: notchIdx,
        label,
        value: notchIdx,
      });
      notchIdx++;
    }
  });

  return { idxToOption, optionToIdx, notchLabels };
};

const EppSlider: FC<{ powerControlInfo: PowerControlInfo }> = ({
  powerControlInfo,
}) => {
  const { eppOptions, pstateStatus, scalingDriver } = powerControlInfo;
  const { powerGovernor, epp } = useSelector(
    getPowerControlInfoSelector(scalingDriver)
  );
  const simpleLabelsEnabled = useAdvancedOption(
    AdvancedOptionsEnum.ENABLE_SIMPLE_EPP_LABELS
  );

  const dispatch = useDispatch();

  if (!eppOptions || eppOptions?.length == 0) {
    return null;
  }

  const { idxToOption, optionToIdx, notchLabels } = getOptions(
    eppOptions,
    simpleLabelsEnabled
  );

  let handleSliderChange = (value: number) => {
    if (powerGovernor === "performance" && pstateStatus === "active") {
      return;
    }
    const eppOption = idxToOption[value];
    return dispatch(updateEpp({ epp: eppOption, scalingDriver }));
  };

  const defaultEpp = DEFAULT_POWER_CONTROLS[scalingDriver]?.epp || "power";

  let sliderValue = optionToIdx[epp || defaultEpp];

  if (
    powerGovernor === "performance" &&
    pstateStatus === "active" &&
    (scalingDriver === ScalingDrivers.PSTATE_EPP ||
      scalingDriver == ScalingDrivers.INTEL_PSTATE)
  ) {
    // return (
    //   <Field disabled>
    //     EPP cannot be changed while Governor is set to Performance
    //   </Field>
    // );
    return null;
  }

  let label = "CPU Energy Performance Preference";

  if (simpleLabelsEnabled) {
    label = "Energy Performance Preference";
  }

  return (
    <DeckySlider
      label={label}
      value={sliderValue}
      min={0}
      max={notchLabels.length - 1}
      step={1}
      notchCount={notchLabels.length}
      notchLabels={notchLabels}
      notchTicksVisible
      showValue={false}
      bottomSeparator={"none"}
      onChange={handleSliderChange}
    />
  );
};

export default EppSlider;
