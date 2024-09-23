// TDP Range Slider
import { useDispatch, useSelector } from "react-redux";
import {
  getCurrentFixedGpuFrequencySelector,
  getGpuFrequencyRangeSelector,
  setFixedGpuFrequency,
} from "../../redux-modules/settingsSlice";
import { DeckySlider } from "./DeckyFrontendLib";

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

  if (!(min && max) || currentFrequency < 1) {
    return <span>Unsupported on this device.</span>;
  }

  return (
    <DeckySlider
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
