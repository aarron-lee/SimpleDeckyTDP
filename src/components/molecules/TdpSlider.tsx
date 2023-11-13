import {
  SliderField,
  PanelSection,
  PanelSectionRow,
} from "decky-frontend-lib";
import { useTdpRange } from '../../hooks/useTdpRange'
import { useEffect } from 'react'
import { useDefaultTdp } from '../../hooks/useTdpProfiles'

export function TdpSlider({ persistToSettings }: { persistToSettings?: any }) {
  const [minTdp, maxTdp] = useTdpRange();
  const [defaultTdp, setDefaultTdp] = useDefaultTdp()

  useEffect(() => {
  	if(defaultTdp && persistToSettings) {
  		persistToSettings(defaultTdp)
  	}
  }, [defaultTdp])


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