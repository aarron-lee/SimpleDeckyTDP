import { FC, useCallback } from "react";
import { SliderField, NotchLabel } from "decky-frontend-lib";
import { capitalize } from "lodash";
import { useDispatch, useSelector } from "react-redux";
import {
  getGpuModeSelector,
  setGpuMode,
} from "../../redux-modules/settingsSlice";

enum Mode {
  DEFAULT = 0,
  RANGE = 1,
}

const useGpuMode = () => {
  const { activeGameId, gpuMode } = useSelector(getGpuModeSelector);
  const dispatch = useDispatch();

  const setMode = useCallback((mode) => {
    return dispatch(setGpuMode(mode));
  }, []);

  return { activeGameId, gpuMode, setGpuMode: setMode };
};

const GpuModeSlider: FC = () => {
  const { gpuMode, setGpuMode } = useGpuMode();

  const handleSliderChange = (value: number) => {
    // enum does reverse mapping, including value to key
    return setGpuMode(Mode[value]);
  };

  const MODES: NotchLabel[] = Object.keys(Mode)
    .filter((key) => isNaN(Number(key)))
    .map((mode, idx) => {
      return { notchIndex: idx, label: capitalize(mode), value: idx };
    });

  // known bug: typescript has incorrect type for reverse mapping from enums
  const sliderValue = Mode[gpuMode] as any;

  return (
    <>
      <SliderField
        value={sliderValue || Mode.DEFAULT}
        min={0}
        max={MODES.length - 1}
        step={1}
        notchCount={MODES.length}
        notchLabels={MODES}
        notchTicksVisible={true}
        showValue={false}
        bottomSeparator={"none"}
        onChange={handleSliderChange}
      />
    </>
  );
};

export default GpuModeSlider;
