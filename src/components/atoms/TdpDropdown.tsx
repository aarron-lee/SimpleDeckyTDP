// TDP Dropdown
import { DropdownItem } from 'decky-frontend-lib';
import { range } from 'lodash';

type PropType = {
  tdpRange: number[];
  label: string;
  description?: string;
  selected?: number;
  onChange: any;
};

const TdpDropdown = ({
  tdpRange,
  label,
  description,
  selected,
  onChange,
}: PropType) => {
  const [min, max] = tdpRange;

  const dropdownOptions = range(min, max + 1).map((tdpValue) => {
    return {
      data: tdpValue,
      label: `${tdpValue}W`,
      value: tdpValue,
    };
  });

  return (
    <DropdownItem
      label={label}
      description={description}
      menuLabel={label}
      rgOptions={dropdownOptions.map((o) => {
        return {
          data: o.data,
          label: o.label,
          value: o.value,
        };
      })}
      selectedOption={
        dropdownOptions.find((o) => {
          return o.data === selected;
        })?.data || 0
      }
      onChange={onChange}
    />
  );
};

export default TdpDropdown;
