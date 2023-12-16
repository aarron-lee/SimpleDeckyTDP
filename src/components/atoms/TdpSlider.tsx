// TDP Slider
import { SliderField } from "decky-frontend-lib";

type PropType = {
  tdpRange: number[];
  label: string;
  description?: string;
  selected?: number;
  onChange: any;
};

const TdpSlider = ({ tdpRange, label, selected, onChange }: PropType) => {
  const [min, max] = tdpRange;

  return (
    <>
      <SliderField
        label={label}
        value={selected || 0}
        showValue
        step={1}
        valueSuffix="W"
        min={min}
        max={max}
        validValues="range"
        bottomSeparator="none"
        onChange={(data) => {
          return onChange({ data });
        }}
      />
    </>
  );
};

export default TdpSlider;
