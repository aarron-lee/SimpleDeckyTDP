import { useTdpRange } from "../../hooks/useTdpRange";
import { useSetTdp } from "../../hooks/useTdpProfiles";
import { useSelector } from "react-redux";
import { getCurrentTdpInfoSelector } from "../../redux-modules/settingsSlice";
import { FC } from "react";
import ErrorBoundary from "../ErrorBoundary";
import { DeckyRow, DeckySlider } from "../atoms/DeckyFrontendLib";

export const TdpSlider: FC = () => {
  const [minTdp, maxTdp] = useTdpRange();
  const setTdp = useSetTdp();
  const { tdp } = useSelector(getCurrentTdpInfoSelector);

  return (
    <DeckyRow>
      <ErrorBoundary title="TDP Slider">
        <DeckySlider
          value={tdp}
          label="TDP (Watts)"
          min={minTdp}
          max={maxTdp}
          step={1}
          onChange={(newTdp) => setTdp(newTdp)}
          notchTicksVisible
          showValue
        />
      </ErrorBoundary>
    </DeckyRow>
  );
};
