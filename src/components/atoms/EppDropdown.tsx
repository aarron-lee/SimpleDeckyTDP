import { DropdownItem } from "decky-frontend-lib";
import { useDispatch, useSelector } from "react-redux";
import {
  getPowerControlInfoSelector,
  updateEpp,
} from "../../redux-modules/settingsSlice";
import { EppOption, EppOptions, PowerControlInfo } from "../../utils/constants";
import { FC } from "react";

const getOptions = (eppOptions: EppOption[]) => {
  const dropdownOptions: any[] = [];

  let dropdownIdx = 0;
  eppOptions.forEach((option) => {
    if (EppOptions[option]) {
      let label = EppOptions[option];
      dropdownOptions.push({
        data: option,
        label: label.replace(/_/g, " "),
        value: dropdownIdx,
      });
      dropdownIdx++;
    }
  });

  return { dropdownOptions };
};

const EppDropdown: FC<{ powerControlInfo: PowerControlInfo }> = ({
  powerControlInfo,
}) => {
  const { eppOptions, pstateStatus } = powerControlInfo;
  const { powerGovernor, epp } = useSelector(getPowerControlInfoSelector);

  const dispatch = useDispatch();

  if (!eppOptions || eppOptions?.length == 0) {
    return null;
  }

  const { dropdownOptions } = getOptions(eppOptions);

  let onChange = (value: EppOption) => {
    if (powerGovernor === "performance" && pstateStatus === "active") {
      return;
    }
    return dispatch(updateEpp(value));
  };

  let description;

  let selectedOption =
    dropdownOptions.find((o) => o.data === epp)?.data || "power";

  if (powerGovernor === "performance" && pstateStatus === "active") {
    selectedOption = "performance";
    description = "EPP cannot be changed while Governor is set to Performance";
  }

  return (
    <DropdownItem
      label="Energy Performance Preference"
      rgOptions={dropdownOptions}
      selectedOption={selectedOption}
      onChange={({ data }: any) => {
        onChange(data);
      }}
      disabled={powerGovernor === "performance" && pstateStatus == "active"}
      bottomSeparator="none"
      description={description}
    />
  );
};

export default EppDropdown;
