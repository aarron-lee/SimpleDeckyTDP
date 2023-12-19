import GpuRangeSliders from "../atoms/GpuRangeSliders";
import GpuModeSlider from "../atoms/GpuModeSlider";
import useGpuMode from "../../hooks/useGpuMode";
import { GpuModes } from "../../backend/utils";
import { PanelSection, PanelSectionRow } from "decky-frontend-lib";
import { useSelector } from "react-redux";
import { getGpuFrequencyRangeSelector } from "../../redux-modules/settingsSlice";
import GpuFixedSlider from "../atoms/GpuFixedSlider";

const Gpu = () => {
  const { min, max } = useSelector(getGpuFrequencyRangeSelector);

  // hide GPU section if min/max not available
  if (!(min && max)) {
    return null;
  }

  const { gpuMode } = useGpuMode();
  return (
    <PanelSection title="GPU">
      <PanelSectionRow>
        <GpuModeSlider />
      </PanelSectionRow>

      {gpuMode === GpuModes.RANGE && (
        <PanelSectionRow>
          <GpuRangeSliders />
        </PanelSectionRow>
      )}
      {gpuMode === GpuModes.FIXED && (
        <PanelSectionRow>
          <GpuFixedSlider />
        </PanelSectionRow>
      )}
    </PanelSection>
  );
};

export default Gpu;
