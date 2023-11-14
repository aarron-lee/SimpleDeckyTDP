import {
  SliderField,
  PanelSection,
  PanelSectionRow,
} from "decky-frontend-lib";
import { useTdpRange } from '../../hooks/useTdpRange'
import { useEffect } from 'react'
import { useDefaultTdp } from '../../hooks/useTdpProfiles'
import { usePollInfo } from '../../hooks/usePollState'


let intervalId: number | undefined;

export function TdpSlider({ persistToSettings }: { persistToSettings?: any }) {
  const [minTdp, maxTdp] = useTdpRange();
  const [defaultTdp, setDefaultTdp] = useDefaultTdp()
  const { enabled: pollEnabled, pollRate } = usePollInfo()

  useEffect(() => {
  	if(defaultTdp && persistToSettings) {
  		persistToSettings(defaultTdp)
  		if(intervalId) {
  			clearInterval(intervalId)
  		}
  		if(pollEnabled && pollRate) {
	  		intervalId = window.setInterval(() => {
	  			persistToSettings(defaultTdp)
	  		}, pollRate)
  		}
  	}
  }, [defaultTdp, pollRate, pollEnabled])


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