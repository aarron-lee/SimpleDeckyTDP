import { useTdpProfilesEnabled } from "../../hooks/useEnableTdpProfiles";
import { useSelector } from "react-redux";
import { getCurrentTdpInfoSelector } from "../../redux-modules/settingsSlice";
import ErrorBoundary from "../ErrorBoundary";
import { DeckyRow, DeckyToggle } from "../atoms/DeckyFrontendLib";

export function TdpProfiles() {
  const [tdpProfilesEnabled, setTdpProfilesEnabled] = useTdpProfilesEnabled();

  const { displayName } = useSelector(getCurrentTdpInfoSelector);

  const description =
    Boolean(displayName) && displayName.toLowerCase() !== "default"
      ? `Using - ${displayName.substring(0, 20)}...`
      : `Using - Default`;

  return (
    <DeckyRow>
      <ErrorBoundary title="Tdp Profiles">
        <DeckyToggle
          label="Enable per-game profiles"
          checked={tdpProfilesEnabled}
          onChange={(enabled: boolean) => {
            setTdpProfilesEnabled(enabled);
          }}
          description={tdpProfilesEnabled ? description : ""}
          highlightOnFocus
        />
      </ErrorBoundary>
    </DeckyRow>
  );
}
