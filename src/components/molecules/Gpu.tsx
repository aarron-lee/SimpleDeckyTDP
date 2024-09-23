import GpuRangeSliders from "../atoms/GpuRangeSliders";
import GpuModeSlider from "../atoms/GpuModeSlider";
import useGpuMode from "../../hooks/useGpuMode";
import { GpuModes } from "../../backend/utils";
import { useSelector } from "react-redux";
import { getGpuFrequencyRangeSelector } from "../../redux-modules/settingsSlice";
import GpuFixedSlider from "../atoms/GpuFixedSlider";
import ErrorBoundary from "../ErrorBoundary";
import { DeckyRow } from "../atoms/DeckyFrontendLib";

const Gpu = () => {
  const { min, max } = useSelector(getGpuFrequencyRangeSelector);

  const { gpuMode } = useGpuMode();
  return (
    <ErrorBoundary title="GPU">
      <DeckyRow>
        <GpuModeSlider showSeparator={gpuMode == GpuModes.BALANCE} />
      </DeckyRow>

      {gpuMode === GpuModes.RANGE && (
        <DeckyRow>
          <GpuRangeSliders showSeparator />
        </DeckyRow>
      )}
      {gpuMode === GpuModes.FIXED && (
        <DeckyRow>
          <GpuFixedSlider />
        </DeckyRow>
      )}
    </ErrorBoundary>
  );
};

export default Gpu;
