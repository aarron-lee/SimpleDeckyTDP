import { FC } from "react";
import { capitalize } from "lodash";
import useGpuMode from "../../hooks/useGpuMode";
import { DeckySlider, NotchLabel } from "./DeckyFrontendLib";
import useIsIntel from "../../hooks/useIsIntel";

enum Mode {
  BATTERY = 0,
  BALANCE = 1,
  PERFORMANCE = 2,
  RANGE = 3,
  FIXED = 4,
}

const GpuModeSlider: FC<{ showSeparator: boolean }> = ({ showSeparator }) => {
  const { gpuMode, setGpuMode } = useGpuMode();
  const isIntel = useIsIntel();

  if (isIntel) {
    // intel doesn't support different GPU modes, only gpu freq
    return null;
  }

  const handleSliderChange = (value: number) => {
    // enum does reverse mapping, including value to key
    return setGpuMode(Mode[value]);
  };

  const MODES: NotchLabel[] = Object.keys(Mode)
    .filter((key) => isNaN(Number(key)))
    .map((mode, idx) => {
      return {
        notchIndex: idx,
        label: capitalize(mode.slice(0, 7) + " " + mode.slice(7)),
        value: idx,
      };
    });

  // known bug: typescript has incorrect type for reverse mapping from enums
  const sliderValue = Mode[gpuMode] as any;

  return (
    <>
      <DeckySlider
        label="GPU Mode"
        value={sliderValue}
        min={0}
        max={MODES.length - 1}
        step={1}
        notchCount={MODES.length}
        notchLabels={MODES}
        notchTicksVisible={true}
        showValue={false}
        bottomSeparator={showSeparator ? "standard" : "none"}
        onChange={handleSliderChange}
      />
    </>
  );
};

export default GpuModeSlider;
