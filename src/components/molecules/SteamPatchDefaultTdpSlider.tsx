import { SliderField, PanelSection, PanelSectionRow } from "decky-frontend-lib";
import { useTdpRange } from "../../hooks/useTdpRange";
import { FC } from "react";
import { useSteamPatchDefaultTdp } from "../../hooks/useSteamPatch";

export const SteamPatchDefaultTdpSlider: FC = () => {
  const [minTdp, maxTdp] = useTdpRange();
  const { defaultTdp, setDefaultTdp } = useSteamPatchDefaultTdp();
  return (
    <PanelSection title={"Steam TDP Slider Default"}>
      <PanelSectionRow>
        <SliderField
          value={defaultTdp}
          label="Watts"
          min={minTdp}
          max={maxTdp}
          step={1}
          onChange={(newTdp) => setDefaultTdp(newTdp)}
          notchTicksVisible
          showValue
        />
      </PanelSectionRow>
    </PanelSection>
  );
};
