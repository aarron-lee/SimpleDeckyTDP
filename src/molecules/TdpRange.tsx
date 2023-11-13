// tdp range
// import { useEffect } from 'react'
import {
  PanelSection,
  PanelSectionRow,
} from "decky-frontend-lib";
import TdpDropdown from '../components/TdpDropdown'
import { useDispatch, useSelector } from 'react-redux'
import { updateMinTdp, updateMaxTdp, tdpRangeSelector } from '../redux-modules/tdpRangeSlice'

const TdpRange = ({ minTdp, maxTdp, logInfo, onFieldChange }: { minTdp: number, maxTdp: number, logInfo: any, onFieldChange: any}) => {
  const dispatch = useDispatch()
  const tdpState = useSelector(tdpRangeSelector)

  logInfo(`${minTdp} ${maxTdp} ${JSON.stringify(tdpState)}`)

  return (
      <PanelSection title="TDP Range">
        <PanelSectionRow>
          <TdpDropdown
            tdpRange={[3,12]}
            label="Minimum TDP"
            name="minTdp"
            selected={minTdp}
            onChange={({ data: value }: { data: number}) => {
                dispatch(updateMinTdp(value));
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
                dispatch(updateMaxTdp(value))
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