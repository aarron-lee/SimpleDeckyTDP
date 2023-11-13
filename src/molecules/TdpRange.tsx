// tdp range
// import { useEffect } from 'react'
import {
  PanelSection,
  PanelSectionRow,
} from "decky-frontend-lib";
import TdpDropdown from '../components/TdpDropdown'
import { useMinTdp, useMaxTdp } from '../hooks/useTdpRange'

const TdpRange = ({ logInfo, onFieldChange }: { logInfo: any, onFieldChange: any}) => {
  const [minTdp, setMinTdp] = useMinTdp();
  const [maxTdp, setMaxTdp] = useMaxTdp();

  logInfo(`${minTdp} ${maxTdp}`)

  return (
      <PanelSection title="TDP Range">
        <PanelSectionRow>
          <TdpDropdown
            tdpRange={[3,12]}
            label="Minimum TDP"
            name="minTdp"
            selected={minTdp}
            onChange={({ data: value }: { data: number}) => {
                setMinTdp(value)
                onFieldChange(
                  "minTdp",
                  value
                );
              }
            }
          />
        </PanelSectionRow>

        <PanelSectionRow>
          <TdpDropdown
            tdpRange={[15,30]}
            label="Max TDP"
            name="maxTdp"
            selected={maxTdp}
            onChange={({ data: value }: { data: number}) => {
                setMaxTdp(value)
                onFieldChange(
                  "maxTdp",
                  value
                )
              }
            }
          />
        </PanelSectionRow>
      </PanelSection>)
}

export default TdpRange