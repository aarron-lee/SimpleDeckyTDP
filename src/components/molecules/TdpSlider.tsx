import { useTdpRange } from "../../hooks/useTdpRange";
import { useSetTdp } from "../../hooks/useTdpProfiles";
import { useSelector } from "react-redux";
import { getCurrentTdpInfoSelector } from "../../redux-modules/settingsSlice";
import ErrorBoundary from "../ErrorBoundary";
import { DeckyRow, DeckySlider } from "../atoms/DeckyFrontendLib";
import t from '../../i18n/i18n';

export const TdpSlider = ({ disabled = false }: { disabled: boolean }) => {
  const [minTdp, maxTdp] = useTdpRange();
  const setTdp = useSetTdp();
  const { tdp } = useSelector(getCurrentTdpInfoSelector);

  return (
    <DeckyRow>
      <ErrorBoundary title="TDP Slider">
        <DeckySlider
          value={tdp}
          label={t('TDP_SLIDER_LABEL', 'TDP (Watts)')}
          min={minTdp}
          max={maxTdp}
          step={1}
          disabled={disabled}
          onChange={(newTdp) => setTdp(newTdp)}
          notchTicksVisible
          showValue
        />
      </ErrorBoundary>
    </DeckyRow>
  );
};
