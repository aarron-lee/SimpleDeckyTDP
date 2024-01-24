import { SliderField, NotchLabel } from "decky-frontend-lib";
import { useDispatch, useSelector } from "react-redux";
import {
  getPowerControlInfoSelector,
  updatePowerGovernor,
} from "../../redux-modules/settingsSlice";
import {
  PowerGovernorOption,
  PowerGovernorOptions,
} from "../../utils/constants";
import { capitalize } from "lodash";
import { logInfo } from "../../backend/utils";

const getOptions = (powerGovernorOptions: PowerGovernorOption[]) => {
  const idxToOption = {};
  const optionToIdx = {};
  const notchLabels: NotchLabel[] = [];
  powerGovernorOptions.forEach((option, idx) => {
    idxToOption[idx] = option;
    optionToIdx[option] = idx;

    const label = PowerGovernorOptions[option];

    notchLabels.push({
      notchIndex: idx,
      value: idx,
      label: capitalize(label.replace(/_/g, " ")),
    });
  });

  return { idxToOption, optionToIdx, notchLabels };
};

const PowerGovernorSlider = () => {
  const { powerGovernor, powerGovernorOptions } = useSelector(
    getPowerControlInfoSelector
  );
  const dispatch = useDispatch();

  const { idxToOption, optionToIdx, notchLabels } =
    getOptions(powerGovernorOptions);

  const handleSliderChange = (value: number) => {
    const powerGovernorOption = idxToOption[value];
    return dispatch(updatePowerGovernor(powerGovernorOption));
  };

  const sliderValue = optionToIdx[powerGovernor];

  return (
    <SliderField
      label="Power Governor"
      value={sliderValue || optionToIdx["powersave"]}
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
