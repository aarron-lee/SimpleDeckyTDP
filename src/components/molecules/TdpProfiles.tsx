import { ToggleField, PanelSection, PanelSectionRow } from "decky-frontend-lib";
import { useTdpProfilesEnabled } from "../../hooks/useEnableTdpProfiles";

export function TdpProfiles() {
  const [tdpProfilesEnabled, setTdpProfilesEnabled] = useTdpProfilesEnabled();

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
