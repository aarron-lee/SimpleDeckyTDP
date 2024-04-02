import { useTdpRange } from "../../hooks/useTdpRange";
import { FC } from "react";
import { useSteamPatchDefaultTdp } from "../../hooks/useSteamPatch";
import { DeckyRow, DeckySection, DeckySlider } from "../atoms/DeckyFrontendLib";

export const SteamPatchDefaultTdpSlider: FC = () => {
  const [minTdp, maxTdp] = useTdpRange();
  const { defaultTdp, setDefaultTdp } = useSteamPatchDefaultTdp();
  return (
    <DeckySection title={"Steam TDP Slider Default"}>
      <DeckyRow>
        <DeckySlider
          value={defaultTdp}
          label="Watts"
          min={minTdp}
          max={maxTdp}
          step={1}
          onChange={(newTdp) => setDefaultTdp(newTdp)}
          notchTicksVisible
          showValue
        />
      </DeckyRow>
    </DeckySection>
  );
};
