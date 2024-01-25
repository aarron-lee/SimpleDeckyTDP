import { SliderField, NotchLabel } from "decky-frontend-lib";
import { useDispatch, useSelector } from "react-redux";
import {
  getPowerControlInfoSelector,
  updatePowerGovernor,
} from "../../redux-modules/settingsSlice";
import {
  PowerControlInfo,
  PowerGovernorOption,
  PowerGovernorOptions,
} from "../../utils/constants";
import { capitalize } from "lodash";
import { logInfo } from "../../backend/utils";
import { FC } from "react";

const getOptions = (powerGovernorOptions: PowerGovernorOption[]) => {
  const idxToOption = {};
  const optionToIdx = {};
  const notchLabels: NotchLabel[] = [];

  let notchIdx = 0;

  powerGovernorOptions.forEach((option, idx) => {
    if (PowerGovernorOptions[option]) {
      idxToOption[idx] = option;
      optionToIdx[option] = idx;

      const label = PowerGovernorOptions[option];

      notchLabels.push({
        notchIndex: notchIdx,
        value: notchIdx,
        label: capitalize(label.replace(/_/g, " ")),
      });
      notchIdx++;
    }
  });

  return { idxToOption, optionToIdx, notchLabels };
};

const PowerGovernorSlider: FC<{
  powerControlInfo: PowerControlInfo;
}> = ({ powerControlInfo }) => {
  const { powerGovernorOptions } = powerControlInfo;

  const { powerGovernor } = useSelector(getPowerControlInfoSelector);
  const dispatch = useDispatch();

  const { idxToOption, optionToIdx, notchLabels } =
    getOptions(powerGovernorOptions);

  const handleSliderChange = (value: number) => {
    const powerGovernorOption = idxToOption[value];
    return dispatch(updatePowerGovernor(powerGovernorOption));
  };

  const sliderValue = optionToIdx[powerGovernor || "powersave"];

  return (
    <SliderField
      label="Power Governor"
      value={sliderValue}
      min={0}
      max={notchLabels.length - 1}
      step={1}
      notchCount={notchLabels.length}
      notchLabels={notchLabels}
      notchTicksVisible={true}
      showValue={false}
      bottomSeparator={"none"}
      onChange={handleSliderChange}
    />
  );
};

export default PowerGovernorSlider;
