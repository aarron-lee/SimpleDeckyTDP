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
        showValue
        step={50}
        valueSuffix="Hz"
        min={min}
        max={max}
        validValues="range"
        bottomSeparator="none"
        onChange={(newMin) => {
          if (newMin > currentMax) {
            return;
          }

          return setMinFreq(newMin);
        }}
      />
      <SliderField
        label={"Maximum Frequency Limit"}
        value={currentMax}
        showValue
        step={50}
        valueSuffix="Hz"
        min={min}
        max={max}
        validValues="range"
        bottomSeparator="none"
        onChange={(newMax) => {
          if (newMax < currentMin) {
            return;
          }

          return setMaxFreq(newMax);
        }}
      />
    </>
  );
};

export default GpuRangeSliders;
