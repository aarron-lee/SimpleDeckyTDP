// TDP Range Slider
import { SliderField } from "decky-frontend-lib";
import { useDispatch, useSelector } from "react-redux";
import {
  getCurrentFixedGpuFrequencySelector,
  getGpuFrequencyRangeSelector,
  setFixedGpuFrequency,
} from "../../redux-modules/settingsSlice";

const useSetGpuFrequency = () => {
  const dispatch = useDispatch();

  const setFreq = (frequency: number) => {
    return dispatch(setFixedGpuFrequency(frequency));
  };

  return setFreq;
};

const GpuFixedSlider = () => {
  const { min, max } = useSelector(getGpuFrequencyRangeSelector);

  const currentFrequency = useSelector(getCurrentFixedGpuFrequencySelector);
  const setFreq = useSetGpuFrequency();

  if (!(min && max)) {
    return <span>Error: Missing GPU Information</span>;
  }

  return (
    <SliderField
      label={"Frequency"}
      value={currentFrequency}
      description={`${currentFrequency} MHz`}
      step={50}
      min={min}
      max={max}
      validValues="range"
      bottomSeparator="standard"
      onChange={setFreq}
    />
  );
};

export default GpuFixedSlider;
