import {
  ToggleField,
  PanelSection,
  PanelSectionRow,
  DropdownItem,
} from "decky-frontend-lib";
import { useEffect } from 'react';
import { usePollInfo, useSetPoll, useSetPollRate } from '../../hooks/usePollState'
import { range } from 'lodash';


export function PollToggle({ persistPollState }: { persistPollState: any }) {
  const { enabled, pollRate } = usePollInfo()
  const setPoll = useSetPoll()
  const setPollRate = useSetPollRate()

  useEffect(() => {
    // persist to backend settings.json
    persistPollState('pollEnabled', enabled);
  }, [enabled])

  const dropdownOptions = range(1, 21).map(seconds => {
    return {
      data: seconds,
      label: `${seconds} seconds`,
      value: seconds
    }
  })

  return  (<PanelSection title="Poll TDP">
    <PanelSectionRow>
      <ToggleField
        label="Enable Polling"
        checked={enabled}
        onChange={(enabled: boolean) => {
            setPoll(enabled)
          }
        }
        highlightOnFocus
      />
    </PanelSectionRow>
    <PanelSectionRow>
      <DropdownItem
        label="Poll Rate"
        description="Rate in Seconds"
        menuLabel="Poll Rate"
        rgOptions={dropdownOptions.map(o => {
          return {
            data: o.data,
            label: o.label,
            value: o.value
          }
        })}
        selectedOption={
          dropdownOptions.find(o =>  {
            return o.data === pollRate/1000
          })?.data || 0
        }
        onChange={({ data: seconds }) => {
          setPollRate(seconds*1000)
        }}
      />
    </PanelSectionRow>
  </PanelSection>)
}