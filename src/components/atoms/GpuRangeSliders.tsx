// TDP Range Slider
import { SliderField } from "decky-frontend-lib";
import { useDispatch, useSelector } from "react-redux";
import {
  getCurrentGpuFrequencySelector,
  getGpuFrequencyRangeSelector,
  setGpuFrequency,
} from "../../redux-modules/settingsSlice";

const useSetGpuFrequency = () => {
  const dispatch = useDispatch();

  const setMinFreq = (min: number) => {
    return dispatch(setGpuFrequency({ min }));
  };
  const setMaxFreq = (max: number) => {
    return dispatch(setGpuFrequency({ max }));
  };

  return { setMinFreq, setMaxFreq };
};

const GpuRangeSliders = () => {
  const { min, max } = useSelector(getGpuFrequencyRangeSelector);
  const { currentMin, currentMax } = useSelector(
    getCurrentGpuFrequencySelector
  );
  const { setMinFreq, setMaxFreq } = useSetGpuFrequency();

  if (!(min && max)) {
    return <span>Error: Missing GPU Information</span>;
  }

  return (
    <>
      <SliderField
        label={"Minimum Frequency Limit"}
        value={currentMin}
        step={50}
        description={`${currentMin} MHz`}
        min={min}
        max={currentMax}
        validValues="range"
        bottomSeparator="none"
        onChange={(newMin) => {
          return setMinFreq(newMin);
        }}
      />
      <SliderField
        label={"Maximum Frequency Limit"}
        value={currentMax}
        step={50}
        description={`${currentMax} MHz`}
        min={currentMin}
        max={max}
        validValues="range"
        bottomSeparator="none"
        onChange={(newMax) => {
          return setMaxFreq(newMax);
        }}
      />
    </>
  );
};

export default GpuRangeSliders;
