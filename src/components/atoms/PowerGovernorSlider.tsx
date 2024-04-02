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
import { FC } from "react";
import { DeckySlider, NotchLabel } from "./DeckyFrontendLib";

const getOptions = (powerGovernorOptions: PowerGovernorOption[]) => {
  const idxToOption: { [key: string]: any } = {};
  const optionToIdx: { [key: string]: any } = {};
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
  const { powerGovernorOptions, scalingDriver } = powerControlInfo;

  const { powerGovernor } = useSelector(
    getPowerControlInfoSelector(scalingDriver)
  );
  const dispatch = useDispatch();

  const { idxToOption, optionToIdx, notchLabels } =
    getOptions(powerGovernorOptions);

  const handleSliderChange = (value: number) => {
    const powerGovernorOption = idxToOption[value];
    return dispatch(
      updatePowerGovernor({ powerGovernor: powerGovernorOption, scalingDriver })
    );
  };

  const sliderValue = optionToIdx[powerGovernor || "powersave"];

  return (
    <DeckySlider
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
