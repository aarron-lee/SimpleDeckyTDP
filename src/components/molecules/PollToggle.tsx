import {
  ToggleField,
  TextField,
  PanelSection,
  PanelSectionRow,
} from "decky-frontend-lib";
import { usePollInfo, useSetPoll } from '../../hooks/usePollState'


export function PollToggle() {
  const { enabled } = usePollInfo()
  const setPoll = useSetPoll()


  return  (<PanelSection title="Poll TDP">
    <PanelSectionRow>
      <ToggleField
        label="Enable Polling"
        checked={enabled}
        onChange={setPoll}
        highlightOnFocus
      />
    </PanelSectionRow>
  </PanelSection>)
}