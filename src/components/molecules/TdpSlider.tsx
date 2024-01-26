import { SliderField, PanelSection, PanelSectionRow } from "decky-frontend-lib";
import { useTdpRange } from "../../hooks/useTdpRange";
import { useSetTdp } from "../../hooks/useTdpProfiles";
import { useSelector } from "react-redux";
import { getCurrentTdpInfoSelector } from "../../redux-modules/settingsSlice";
import { FC } from "react";

export const TdpSlider: FC = () => {
  const [minTdp, maxTdp] = useTdpRange();
  const setTdp = useSetTdp();
  const { tdp } = useSelector(getCurrentTdpInfoSelector);

  return (
    <PanelSectionRow>
      <SliderField
        value={tdp}
        label="TDP (Watts)"
        min={minTdp}
        max={maxTdp}
        step={1}
        onChange={(newTdp) => setTdp(newTdp)}
        notchTicksVisible
        showValue
      />
    </PanelSectionRow>
  );
};
