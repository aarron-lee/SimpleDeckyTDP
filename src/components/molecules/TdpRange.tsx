// tdp range
// import { useEffect } from 'react'
import { PanelSection, PanelSectionRow } from "decky-frontend-lib";
import TdpRangeSlider from "../atoms/TdpRangeSlider";
import { useMinTdp, useMaxTdp } from "../../hooks/useTdpRange";
import { useIsSteamPatchEnabled } from "./AdvancedOptions";
import { MIN_TDP_RANGE } from "../../utils/constants";
import ErrorBoundary from "../ErrorBoundary";

const TdpRange = () => {
  const [minTdp, setMinTdp] = useMinTdp();
  const [maxTdp, setMaxTdp] = useMaxTdp();

  const steamPatchEnabled = useIsSteamPatchEnabled();

  const title = steamPatchEnabled ? "Steam TDP Slider range" : "TDP Range";

  return (
    <PanelSection title={title}>
      <ErrorBoundary title="Tdp Range">
        <PanelSectionRow>
          <TdpRangeSlider
            tdpRange={[MIN_TDP_RANGE, 12]}
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
      </ErrorBoundary>
    </PanelSection>
  );
};

export default TdpRange;
