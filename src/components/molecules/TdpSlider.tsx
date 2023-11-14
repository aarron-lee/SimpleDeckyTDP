import {
  SliderField,
  PanelSection,
  PanelSectionRow,
} from "decky-frontend-lib";
import { useTdpRange } from '../../hooks/useTdpRange'
import { useDefaultTdp } from '../../hooks/useTdpProfiles'
import { usePollTdpEffect } from '../../hooks/usePollState'

export function TdpSlider({ persistToSettings }: { persistToSettings?: any }) {
  const [minTdp, maxTdp] = useTdpRange();
  const [defaultTdp, setDefaultTdp] = useDefaultTdp()

  usePollTdpEffect(defaultTdp, persistToSettings);


  return  (<PanelSection title="TDP">
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
  </PanelSection>)
}