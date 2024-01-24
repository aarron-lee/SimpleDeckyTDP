import { ToggleField, PanelSection, PanelSectionRow } from "decky-frontend-lib";
import { useTdpProfilesEnabled } from "../../hooks/useEnableTdpProfiles";
import { useSelector } from "react-redux";
import { getCurrentTdpInfoSelector } from "../../redux-modules/settingsSlice";

export function TdpProfiles() {
  const [tdpProfilesEnabled, setTdpProfilesEnabled] = useTdpProfilesEnabled();

  const { displayName } = useSelector(getCurrentTdpInfoSelector);

  const description =
    Boolean(displayName) && displayName.toLowerCase() !== "default"
      ? `Using - ${displayName.substring(0, 20)}...`
      : `Using - Default`;

  return (
    <PanelSection>
      <PanelSectionRow>
        <ToggleField
          label="Enable per-game profiles"
          checked={tdpProfilesEnabled}
          onChange={(enabled: boolean) => {
            setTdpProfilesEnabled(enabled);
          }}
          description={description}
          highlightOnFocus
        />
      </PanelSectionRow>
    </PanelSection>
  );
}
