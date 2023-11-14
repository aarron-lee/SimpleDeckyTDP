import {
  SliderField,
  PanelSection,
  PanelSectionRow,
} from 'decky-frontend-lib';
import { useTdpRange } from '../../hooks/useTdpRange';
import { useSetTdp } from '../../hooks/useTdpProfiles';
import { usePollTdpEffect } from '../../hooks/usePollState';
import { useSelector } from 'react-redux';
import { getCurrentTdpInfoSelector } from '../../redux-modules/settingsSlice';
import { FC, useEffect } from 'react';

export const TdpSlider: FC<{
  saveTdp: (gameId: string, tdp: number) => void;
  setRyzenadjTdp: (tdp: number) => void;
}> = ({ saveTdp, setRyzenadjTdp }) => {
  const [minTdp, maxTdp] = useTdpRange();
  const setReduxTdp = useSetTdp();
  const { id, tdp, displayName } = useSelector(
    getCurrentTdpInfoSelector
  );
  const title =
    Boolean(displayName) && displayName.toLowerCase() !== 'default'
      ? `TDP - ${displayName.substring(0, 20)}...`
      : `TDP - Default`;

  useEffect(() => {
    saveTdp(id, tdp);
  }, [id, tdp]);

  usePollTdpEffect(tdp, setRyzenadjTdp);

  return (
    <PanelSection title={title}>
      <PanelSectionRow>
        <SliderField
          value={tdp}
          label="Watts"
          min={minTdp}
          max={maxTdp}
          step={1}
          onChange={(newTdp) => setReduxTdp(id, newTdp)}
          notchTicksVisible
          showValue
        />
      </PanelSectionRow>
    </PanelSection>
  );
};
