import GpuRangeSliders from "../atoms/GpuRangeSliders";
import GpuModeSlider from "../atoms/GpuModeSlider";
import useGpuMode from "../../hooks/useGpuMode";
import { GpuModes } from "../../backend/utils";
import GpuFixedSlider from "../atoms/GpuFixedSlider";
import ErrorBoundary from "../ErrorBoundary";
import { DeckyRow } from "../atoms/DeckyFrontendLib";
import useIsIntel from "../../hooks/useIsIntel";

const Gpu = () => {
  const isIntel = useIsIntel();

  if (isIntel) {
    // intel currently doesn't support manual GPU clocks on iGPU
    return null;
  }

  const { gpuMode } = useGpuMode();
  return (
    <ErrorBoundary title="GPU">
      {!isIntel && (
        <DeckyRow>
          <GpuModeSlider showSeparator={gpuMode == GpuModes.BALANCE} />
        </DeckyRow>
      )}

      {(gpuMode === GpuModes.RANGE || isIntel) && (
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
