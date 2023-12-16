// tdp range
// import { useEffect } from 'react'
import { PanelSection, PanelSectionRow } from "decky-frontend-lib";
import TdpRangeSlider from "../atoms/TdpRangeSlider";
import { useMinTdp, useMaxTdp } from "../../hooks/useTdpRange";

const TdpRange = () => {
  const [minTdp, setMinTdp] = useMinTdp();
  const [maxTdp, setMaxTdp] = useMaxTdp();

  return (
    <PanelSection title="TDP Range">
      <PanelSectionRow>
        <TdpRangeSlider
          tdpRange={[3, 12]}
          label="Minimum TDP"
          value={minTdp}
          onChange={setMinTdp}
        />
      </PanelSectionRow>

      <PanelSectionRow>
        <TdpRangeSlider
          tdpRange={[15, 40]}
          label="Max TDP"
          value={maxTdp}
          onChange={setMaxTdp}
        />
      </PanelSectionRow>
    </PanelSection>
  );
};

export default TdpRange;
