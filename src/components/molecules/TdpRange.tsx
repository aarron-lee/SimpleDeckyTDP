// tdp range
// import { useEffect } from 'react'
import { PanelSection, PanelSectionRow } from "decky-frontend-lib";
import TdpDropdown from "../atoms/TdpDropdown";
import { useMinTdp, useMaxTdp } from "../../hooks/useTdpRange";

const TdpRange = () => {
  const [minTdp, setMinTdp] = useMinTdp();
  const [maxTdp, setMaxTdp] = useMaxTdp();

  return (
    <PanelSection title="TDP Range">
      <PanelSectionRow>
        <TdpDropdown
          tdpRange={[3, 12]}
          label="Minimum TDP"
          selected={minTdp}
          onChange={({ data: value }: { data: number }) => {
            setMinTdp(value);
          }}
        />
      </PanelSectionRow>

      <PanelSectionRow>
        <TdpDropdown
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
