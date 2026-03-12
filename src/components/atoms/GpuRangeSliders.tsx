// TDP Range Slider
import { useDispatch, useSelector } from "react-redux";
import {
  getCurrentGpuFrequencySelector,
  getGpuFrequencyRangeSelector,
  setGpuFrequency,
} from "../../redux-modules/settingsSlice";
import { FC } from "react";
import { DeckySlider } from "./DeckyFrontendLib";
import t from '../../i18n/i18n';

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

const GpuRangeSliders: FC<{ showSeparator: boolean }> = ({ showSeparator }) => {
  const { min, max } = useSelector(getGpuFrequencyRangeSelector);
  const { currentMin, currentMax } = useSelector(
    getCurrentGpuFrequencySelector
  );
  const { setMinFreq, setMaxFreq } = useSetGpuFrequency();

  if (!(min && max) || currentMin < 1) {
    return <span>{t('GPU_UNSUPPORTED', 'Unsupported on this device.')}</span>;
  }

  return (
    <>
      <DeckySlider
        label={t('GPU_MIN_FREQ_LIMIT', 'Minimum Frequency Limit')}
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
      <DeckySlider
        label={t('GPU_MAX_FREQ_LIMIT', 'Maximum Frequency Limit')}
        value={currentMax}
        step={50}
        description={`${currentMax} MHz`}
        min={currentMin}
        max={max}
        validValues="range"
        bottomSeparator={showSeparator ? "standard" : "none"}
        onChange={(newMax) => {
          return setMaxFreq(newMax);
        }}
      />
    </>
  );
};

export default GpuRangeSliders;
