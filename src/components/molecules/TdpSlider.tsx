import {
  SliderField,
  PanelSection,
  PanelSectionRow,
} from "decky-frontend-lib";
import { useTdpRange } from '../../hooks/useTdpRange'
import { useDefaultTdp } from '../../hooks/useTdpProfiles'

export function TdpSlider() {
  const [minTdp, maxTdp] = useTdpRange();
  const [defaultTdp, setDefaultTdp] = useDefaultTdp()


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