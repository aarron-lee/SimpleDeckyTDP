// TDP Range Slider
import { SliderField } from "decky-frontend-lib";
import { useSelector } from "react-redux";
import { getGpuFrequencyRangeSelector } from "../../redux-modules/settingsSlice";
import { useState } from "react";

type PropType = {
  label?: string;
  onChange?: any;
};

const GpuRangeSlider = ({ label, onChange }: PropType) => {
  const { min, max } = useSelector(getGpuFrequencyRangeSelector);
  const [state, setState] = useState(1500);

  if (!(min || max)) {
    return <span>Error: Missing GPU Information</span>;
  }

  return (
    <SliderField
      label={label || "GPU"}
      value={state}
      showValue
      step={50}
      valueSuffix="Hz"
      min={min}
      max={max}
      validValues="range"
      bottomSeparator="none"
      onChange={setState}
    />
  );
};

export default GpuRangeSlider;
