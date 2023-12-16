// tdp range
// import { useEffect } from 'react'
import { PanelSection, PanelSectionRow } from "decky-frontend-lib";
import TdpSlider from "../atoms/TdpSlider";
import { useMinTdp, useMaxTdp } from "../../hooks/useTdpRange";

const TdpRange = () => {
  const [minTdp, setMinTdp] = useMinTdp();
  const [maxTdp, setMaxTdp] = useMaxTdp();

  return (
    <PanelSection title="TDP Range">
      <PanelSectionRow>
        <TdpSlider
          tdpRange={[3, 12]}
          label="Minimum TDP"
          selected={minTdp}
          onChange={({ data: value }: { data: number }) => {
            setMinTdp(value);
          }}
        />
      </PanelSectionRow>

      <PanelSectionRow>
        <TdpSlider
          tdpRange={[15, 40]}
          label="Max TDP"
          selected={maxTdp}
          onChange={({ data: value }: { data: number }) => {
            setMaxTdp(value);
          }}
        />
      </PanelSectionRow>
    </PanelSection>
  );
};

export default TdpRange;
