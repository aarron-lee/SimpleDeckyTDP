// tdp range
// import { useEffect } from 'react'
import TdpRangeSlider from "../atoms/TdpRangeSlider";
import { useMinTdp, useMaxTdp } from "../../hooks/useTdpRange";
import { useIsSteamPatchEnabled } from "./AdvancedOptions";
import { MIN_TDP_RANGE } from "../../utils/constants";
import ErrorBoundary from "../ErrorBoundary";
import { DeckyRow, DeckySection } from "../atoms/DeckyFrontendLib";
import useIsIntel from "../../hooks/useIsIntel";
import { useDeviceName, useIsSteamDeck } from "../../hooks/useDeviceName";
import { Devices, SteamDeckAdvancedOptions } from "../../backend/utils";
import { useAdvancedOption } from "../../hooks/useAdvanced";

const useMaxSupportedTdpValue = () => {
  let maxTdp = 40;

  const deviceName = useDeviceName();

  if (
    deviceName.includes(Devices.ASUS_FLOW_Z13) ||
    deviceName.includes(Devices.ASUS_FLOW_Z13_SHORT)
  ) {
    maxTdp = 120;
  }

  return maxTdp;
};

const TdpRange = () => {
  const [minTdp, setMinTdp] = useMinTdp();
  const [maxTdp, setMaxTdp] = useMaxTdp();

  const steamPatchEnabled = useIsSteamPatchEnabled();
  const isSteamDeck = useIsSteamDeck();
  const tdpRangeSlidersEnabled = useAdvancedOption(
    SteamDeckAdvancedOptions.DECK_CUSTOM_TDP_LIMITS
  );
  const isIntel = useIsIntel();
  const maxSupportedTdpValue = useMaxSupportedTdpValue();

  if (isIntel) {
    // intel provides TDP limit values, custom TDP range is unnecessary
    return null;
  }

  if (isSteamDeck && tdpRangeSlidersEnabled === false) {
    // no tdp range slider for Deck
    return null;
  }

  const title = steamPatchEnabled ? "Steam TDP Slider range" : "TDP Range";

  return (
    <DeckySection title={title}>
      <ErrorBoundary title="Tdp Range">
        <DeckyRow>
          <TdpRangeSlider
            tdpRange={[MIN_TDP_RANGE, 12]}
            label="Minimum TDP"
            value={minTdp}
            onChange={setMinTdp}
          />
        </DeckyRow>
        <DeckyRow>
          <TdpRangeSlider
            tdpRange={[15, maxSupportedTdpValue]}
            label="Max TDP"
            value={maxTdp}
            onChange={setMaxTdp}
          />
        </DeckyRow>
      </ErrorBoundary>
    </DeckySection>
  );
};

export default TdpRange;
