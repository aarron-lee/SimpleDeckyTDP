import {
  ToggleField,
  PanelSection,
  PanelSectionRow,
} from 'decky-frontend-lib';
import { useEffect } from 'react';
import { useTdpProfilesEnabled } from '../../hooks/useEnableTdpProfiles';

export function TdpProfiles({
  persistState,
}: {
  persistState: any;
}) {
  const [tdpProfilesEnabled, setTdpProfilesEnabled] =
    useTdpProfilesEnabled();

  useEffect(() => {
    // persist to backend settings.json
    persistState('enableTdpProfiles', tdpProfilesEnabled);
  }, [tdpProfilesEnabled]);

  return (
    <PanelSection title="Per Game TDP Profile">
      <PanelSectionRow>
        <ToggleField
          label="Enable per-game profiles"
          checked={tdpProfilesEnabled}
          onChange={(enabled: boolean) => {
            setTdpProfilesEnabled(enabled);
          }}
          highlightOnFocus
        />
      </PanelSectionRow>
    </PanelSection>
  );
}
