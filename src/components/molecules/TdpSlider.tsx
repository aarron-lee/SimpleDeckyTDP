import {
  SliderField,
  PanelSection,
  PanelSectionRow,
} from "decky-frontend-lib";
import { useTdpRange } from '../../hooks/useTdpRange'

export function TdpSlider() {
  const [minTdp, maxTdp] = useTdpRange();


  return  (<PanelSection title="TDP">
    <PanelSectionRow>
      <SliderField
        value={15}
        min={minTdp}
        max={maxTdp}
        step={1}
        notchTicksVisible
        showValue
        editableValue
      />
    </PanelSectionRow>
  </PanelSection>)
}