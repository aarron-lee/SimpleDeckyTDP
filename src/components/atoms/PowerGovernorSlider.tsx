import { useDispatch, useSelector } from "react-redux";
import {
  getPowerControlInfoSelector,
  updatePowerGovernor,
} from "../../redux-modules/settingsSlice";
import {
  PowerControlInfo,
  PowerGovernorOption,
  PowerGovernorOptions,
  simplePowerGovernorLabels,
} from "../../utils/constants";
import { capitalize } from "lodash";
import { FC } from "react";
import { DeckySlider, NotchLabel } from "./DeckyFrontendLib";
import { useAdvancedOption } from "../../hooks/useAdvanced";
import { AdvancedOptionsEnum } from "../../backend/utils";

const getOptions = (
  powerGovernorOptions: PowerGovernorOption[],
  simpleLabelsEnabled: boolean
) => {
  const idxToOption: { [key: string]: any } = {};
  const optionToIdx: { [key: string]: any } = {};
  const notchLabels: NotchLabel[] = [];

  let notchIdx = 0;

  powerGovernorOptions.forEach((option, idx) => {
    if (PowerGovernorOptions[option]) {
      idxToOption[idx] = option;
      optionToIdx[option] = idx;

      let label = PowerGovernorOptions[option] as string;

      if (simpleLabelsEnabled && simplePowerGovernorLabels[label]) {
        label = simplePowerGovernorLabels[label];
      } else {
        label = capitalize(label.replace(/_/g, " "));
      }

      notchLabels.push({
        notchIndex: notchIdx,
        value: notchIdx,
        label,
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
  const simpleLabelsEnabled = useAdvancedOption(
    AdvancedOptionsEnum.ENABLE_SIMPLE_EPP_LABELS
  );

  const { powerGovernor } = useSelector(
    getPowerControlInfoSelector(scalingDriver)
  );
  const dispatch = useDispatch();

  const { idxToOption, optionToIdx, notchLabels } = getOptions(
    powerGovernorOptions,
    simpleLabelsEnabled
  );

  const handleSliderChange = (value: number) => {
    const powerGovernorOption = idxToOption[value];
    return dispatch(
      updatePowerGovernor({ powerGovernor: powerGovernorOption, scalingDriver })
    );
  };

  const sliderValue = optionToIdx[powerGovernor || "powersave"];

  let label = "CPU Power Governor";

  if (simpleLabelsEnabled) {
    label = "Power Governor";
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
      notchTicksVisible={true}
      showValue={false}
      bottomSeparator={"none"}
      onChange={handleSliderChange}
    />
  );
};

export default PowerGovernorSlider;
