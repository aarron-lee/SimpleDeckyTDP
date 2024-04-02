import { useTdpProfilesEnabled } from "../../hooks/useEnableTdpProfiles";
import { useSelector } from "react-redux";
import { getCurrentTdpInfoSelector } from "../../redux-modules/settingsSlice";
import ErrorBoundary from "../ErrorBoundary";
import { DeckyRow, DeckyToggle } from "../atoms/DeckyFrontendLib";

export function TdpProfiles({ isDesktop }: { isDesktop: boolean }) {
  const [tdpProfilesEnabled, setTdpProfilesEnabled] = useTdpProfilesEnabled();

  const { displayName } = useSelector(getCurrentTdpInfoSelector);

  const description = getDescription(
    isDesktop,
    displayName,
    tdpProfilesEnabled
  );

  const label = isDesktop
    ? "Enable Desktop Profile"
    : "Enable per-game profiles";

  return (
    <DeckyRow>
      <ErrorBoundary title="Tdp Profiles">
        <DeckyToggle
          label={label}
          checked={tdpProfilesEnabled}
          onChange={(enabled: boolean) => {
            setTdpProfilesEnabled(enabled);
          }}
          description={description}
          highlightOnFocus
        />
      </ErrorBoundary>
    </DeckyRow>
  );
}

function getDescription(
  isDesktop: boolean,
  displayName: string,
  tdpProfilesEnabled: boolean
) {
  if (!isDesktop) {
    if (tdpProfilesEnabled) {
      return Boolean(displayName) && displayName.toLowerCase() !== "default"
        ? `Using - ${displayName.substring(0, 20)}...`
        : `Using - Default`;
    }
    return "";
  } else if (isDesktop) {
    if (tdpProfilesEnabled) {
      return "Using - Default (Desktop)";
    }
    return "Using - Default";
  }
  return "";
}
