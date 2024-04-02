import { useDispatch, useSelector } from "react-redux";
import {
  getPowerControlInfoSelector,
  updateEpp,
} from "../../redux-modules/settingsSlice";
import { EppOption, EppOptions, PowerControlInfo } from "../../utils/constants";
import { capitalize } from "lodash";
import { FC } from "react";
import { DeckySlider, NotchLabel } from "./DeckyFrontendLib";

const getOptions = (eppOptions: EppOption[]) => {
  const idxToOption: { [key: string]: any } = {};
  const optionToIdx: { [key: string]: any } = {};
  const notchLabels: NotchLabel[] = [];

  let notchIdx = 0;
  eppOptions.forEach((option, idx) => {
    if (EppOptions[option]) {
      idxToOption[idx] = option;
      optionToIdx[option] = idx;

      const label = EppOptions[option];
      notchLabels.push({
        notchIndex: notchIdx,
        label: capitalize(label.replace(/_/g, " ")),
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

  const dispatch = useDispatch();

  if (!eppOptions || eppOptions?.length == 0) {
    return null;
  }

  const { idxToOption, optionToIdx, notchLabels } = getOptions(eppOptions);

  let handleSliderChange = (value: number) => {
    if (powerGovernor === "performance" && pstateStatus === "active") {
      return;
    }
    const eppOption = idxToOption[value];
    return dispatch(updateEpp({ epp: eppOption, scalingDriver }));
  };

  let sliderValue = optionToIdx[epp || "power"];

  if (
    powerGovernor === "performance" &&
    pstateStatus === "active" &&
    scalingDriver === "amd-pstate-epp"
  ) {
    // return (
    //   <Field disabled>
    //     EPP cannot be changed while Governor is set to Performance
    //   </Field>
    // );
    return null;
  }

  return (
    <DeckySlider
      label="Energy Performance Preference"
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
