import { SliderField, PanelSection, PanelSectionRow } from "decky-frontend-lib";
import { useTdpRange } from "../../hooks/useTdpRange";
import { useSetTdp } from "../../hooks/useTdpProfiles";
import { useSelector } from "react-redux";
import { getCurrentTdpInfoSelector } from "../../redux-modules/settingsSlice";
import { FC } from "react";

export const TdpSlider: FC = () => {
  const [minTdp, maxTdp] = useTdpRange();
  const setTdp = useSetTdp();
  const { id, tdp, displayName } = useSelector(getCurrentTdpInfoSelector);
  const title =
    Boolean(displayName) && displayName.toLowerCase() !== "default"
      ? `TDP - ${displayName.substring(0, 20)}...`
      : `TDP - Default`;

  return (
    <PanelSection title={title}>
      <PanelSectionRow>
        <SliderField
          value={tdp}
          label="Watts"
          min={minTdp}
          max={maxTdp}
          step={1}
          onChange={(newTdp) => setTdp(id, newTdp)}
          notchTicksVisible
          showValue
        />
      </PanelSectionRow>
    </PanelSection>
  );
};
