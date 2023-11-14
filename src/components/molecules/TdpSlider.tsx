import {
  SliderField,
  PanelSection,
  PanelSectionRow,
  TextField,
} from 'decky-frontend-lib';
import { useTdpRange } from '../../hooks/useTdpRange';
import { useDefaultTdp } from '../../hooks/useTdpProfiles';
import { usePollTdpEffect } from '../../hooks/usePollState';
import { useSelector } from 'react-redux';
import { currentGameDisplayNameSelector } from '../../redux-modules/settingsSlice';

export function TdpSlider({
  persistToSettings,
}: {
  persistToSettings?: any;
}) {
  const [minTdp, maxTdp] = useTdpRange();
  const [defaultTdp, setDefaultTdp] = useDefaultTdp();
  const currentGame = useSelector(currentGameDisplayNameSelector);

  usePollTdpEffect(defaultTdp, persistToSettings);

  return (
    <PanelSection title="TDP">
      <PanelSectionRow>
        <SliderField
          value={defaultTdp}
          min={minTdp}
          max={maxTdp}
          step={1}
          onChange={setDefaultTdp}
          notchTicksVisible
          showValue
        />
      </PanelSectionRow>
      <PanelSection>
        <TextField value={currentGame} disabled />
      </PanelSection>
    </PanelSection>
  );
}
