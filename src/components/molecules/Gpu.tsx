import GpuRangeSliders from "../atoms/GpuRangeSliders";
import GpuModeSlider from "../atoms/GpuModeSlider";
import useGpuMode from "../../hooks/useGpuMode";
import { GpuModes } from "../../backend/utils";
import { PanelSection, PanelSectionRow } from "decky-frontend-lib";
import { useSelector } from "react-redux";
import { getGpuFrequencyRangeSelector } from "../../redux-modules/settingsSlice";
import GpuFixedSlider from "../atoms/GpuFixedSlider";
import ErrorBoundary from "../ErrorBoundary";

const Gpu = () => {
  const { min, max } = useSelector(getGpuFrequencyRangeSelector);

  // hide GPU section if min/max not available
  if (!(min && max)) {
    return null;
  }

  const { gpuMode } = useGpuMode();
  return (
    <ErrorBoundary title="GPU">
      <PanelSectionRow>
        <GpuModeSlider showSeparator={gpuMode == GpuModes.DEFAULT} />
      </PanelSectionRow>

      {gpuMode === GpuModes.RANGE && (
        <PanelSectionRow>
          <GpuRangeSliders showSeparator />
        </PanelSectionRow>
      )}
      {gpuMode === GpuModes.FIXED && (
        <PanelSectionRow>
          <GpuFixedSlider />
        </PanelSectionRow>
      )}
    </ErrorBoundary>
  );
};

export default Gpu;
