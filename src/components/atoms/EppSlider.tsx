import { SliderField, NotchLabel } from "decky-frontend-lib";
import { useDispatch, useSelector } from "react-redux";
import {
  getPowerControlInfoSelector,
  updateEpp,
} from "../../redux-modules/settingsSlice";
import { EppOption, EppOptions } from "../../utils/constants";
import { capitalize } from "lodash";
import { logInfo } from "../../backend/utils";

const getOptions = (eppOptions: EppOption[]) => {
  const idxToOption = {};
  const optionToIdx = {};

  eppOptions.forEach((option, idx) => {
    idxToOption[idx] = option;
    optionToIdx[option] = idx;
  });

  const notchLabels: NotchLabel[] = [];

  eppOptions.forEach((option, idx) => {
    const label = EppOptions[option];
    notchLabels.push({
      notchIndex: idx,
      label: capitalize(label.replace(/_/g, " ")),
      value: idx,
    });
  });

  return { idxToOption, optionToIdx, notchLabels };
};

const EppSlider = () => {
  const { powerGovernor, epp, eppOptions } = useSelector(
    getPowerControlInfoSelector
  );

  const dispatch = useDispatch();

  if (!eppOptions || eppOptions?.length == 0) {
    return null;
  }

  const { idxToOption, optionToIdx, notchLabels } = getOptions(eppOptions);

  let handleSliderChange = (value: number) => {
    if (powerGovernor !== "performance") {
      const eppOption = idxToOption[value];
      return dispatch(updateEpp(eppOption));
    }
    return;
  };

  let sliderValue = optionToIdx[epp || "power"];

  let description;

  if (powerGovernor === "performance") {
    sliderValue = optionToIdx["performance"];
    description = "EPP cannot be changed while Governor is set to Performance";
  }

  return (
    <SliderField
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
      description={description}
      disabled={powerGovernor === "performance"}
      onChange={handleSliderChange}
    />
  );
};

export default EppSlider;
