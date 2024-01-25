import { DropdownItem, SliderField } from "decky-frontend-lib";
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
import { FC } from "react";

const getOptions = (powerGovernorOptions: PowerGovernorOption[]) => {
  const dropdownOptions: any[] = [];

  let dropdownIdx = 0;

  powerGovernorOptions.forEach((option) => {
    if (PowerGovernorOptions[option]) {
      const label = PowerGovernorOptions[option];

      dropdownOptions.push({
        data: option,
        value: dropdownIdx,
        label: label.replace(/_/g, " "),
      });
      dropdownIdx++;
    }
  });

  return { dropdownOptions };
};

const PowerGovernorDropdown: FC<{
  powerControlInfo: PowerControlInfo;
}> = ({ powerControlInfo }) => {
  const { powerGovernorOptions } = powerControlInfo;

  const { powerGovernor } = useSelector(getPowerControlInfoSelector);
  const dispatch = useDispatch();

  const { dropdownOptions } = getOptions(powerGovernorOptions);

  const onChange = (value: PowerGovernorOption) => {
    return dispatch(updatePowerGovernor(value));
  };

  const selectedOption =
    dropdownOptions.find((o) => o.data === powerGovernor)?.data || "powersave";

  return (
    <DropdownItem
      label="Power Governor"
      selectedOption={selectedOption}
      rgOptions={dropdownOptions}
      onChange={({ data }: any) => {
        onChange(data);
      }}
      bottomSeparator="none"
    />
  );
};

export default PowerGovernorDropdown;
