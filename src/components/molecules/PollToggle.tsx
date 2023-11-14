import {
  ToggleField,
  PanelSection,
  PanelSectionRow,
} from "decky-frontend-lib";
import { useEffect } from 'react';
import { usePollInfo, useSetPoll } from '../../hooks/usePollState'


export function PollToggle({ persistPollState }: { persistPollState: any }) {
  const { enabled } = usePollInfo()
  const setPoll = useSetPoll()

  useEffect(() => {
    // persist to backend settings.json
    persistPollState('pollEnabled', enabled);
  }, [enabled])


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
  </PanelSection>)
}