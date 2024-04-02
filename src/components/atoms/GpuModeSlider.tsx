import { FC } from "react";
import { capitalize } from "lodash";
import useGpuMode from "../../hooks/useGpuMode";
import { DeckySlider, NotchLabel } from "./DeckyFrontendLib";

enum Mode {
  DEFAULT = 0,
  RANGE = 1,
  FIXED = 2,
}

const GpuModeSlider: FC<{ showSeparator: boolean }> = ({ showSeparator }) => {
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
      <DeckySlider
        label="GPU Frequency Mode"
        value={sliderValue || Mode.DEFAULT}
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
