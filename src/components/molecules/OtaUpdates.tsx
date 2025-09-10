import { useEffect, useState } from "react";
import { getLatestVersionNum, otaUpdate, resetSettings, checkRyzenadjCoall } from "../../backend/utils";
import { useSelector } from "react-redux";
import { getInstalledVersionNumSelector } from "../../redux-modules/settingsSlice";
import { selectScalingDriver } from "../../redux-modules/uiSlice";
import {
  DeckyButton,
  DeckyField,
  DeckyRow,
  DeckySection,
} from "../atoms/DeckyFrontendLib";
import useDeviceName from "../../hooks/useDeviceName";
import useIsIntel from "../../hooks/useIsIntel";

const OtaUpdates = () => {
  const [latestVersionNum, setLatestVersionNum] = useState("");
  const [updateInProgress, setUpdateInProgress] = useState(false);
  const [resetSettingsInProgress, setResetSettingsInProgress] = useState(false);
  const [checkAmdUndervolt, setCheckAmdUndervolt] = useState(false);

  const installedVersionNum = useSelector(getInstalledVersionNumSelector);
  const scalingDriver = useSelector(selectScalingDriver);
  const deviceName = useDeviceName();
  const isIntel = useIsIntel()

  const isUpdated =
    installedVersionNum === latestVersionNum && Boolean(latestVersionNum);

  useEffect(() => {
    const fn = async () => {
      const fetchedVersionNum: unknown = await getLatestVersionNum();

      setLatestVersionNum(fetchedVersionNum as string);
    };

    fn();
  }, []);

  let buttonText = `Update to ${latestVersionNum}`;

  if (isUpdated) {
    buttonText = "Reinstall Plugin";
  }

  return (
    <DeckySection title="System Info">
      <DeckyRow>
        <DeckyField label={"Installed Version"} bottomSeparator="none">
          {installedVersionNum}
        </DeckyField>
      </DeckyRow>

      {Boolean(latestVersionNum) && (
        <DeckyRow>
          <DeckyField label={"Latest Version"} bottomSeparator="none">
            {latestVersionNum}
          </DeckyField>
        </DeckyRow>
      )}
      {Boolean(scalingDriver) && (
        <DeckyRow>
          <DeckyField label={"Scaling Driver"} bottomSeparator="none">
            {scalingDriver}
          </DeckyField>
        </DeckyRow>
      )}
      {Boolean(deviceName) && (
        <DeckyRow>
          <DeckyField label={"Device Name"} bottomSeparator="none">
            {deviceName}
          </DeckyField>
        </DeckyRow>
      )}
      {Boolean(latestVersionNum) && (
        <>
          <DeckyRow>
            <DeckyField label={"Info"} bottomSeparator="none">
              {isUpdated ? "Reinstall" : "Update"} can take up to 1 minute
            </DeckyField>
          </DeckyRow>
          <DeckyRow>
            <DeckyButton
              onClick={async () => {
                setUpdateInProgress(true);
                await otaUpdate();
                setUpdateInProgress(false);
              }}
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
              layout={"below"}
            >
              {updateInProgress ? "Updating..." : buttonText}
            </DeckyButton>
          </DeckyRow>
        </>
      )}
      <DeckyRow>
        <DeckyField label={"Reset Plugin Settings"} bottomSeparator="none">
          WARNING! This permanently deletes your current settings. This will also restart the Steam client, no Steam data will be affected.
        </DeckyField>
      </DeckyRow>
      <DeckyRow>
        <DeckyButton
          onClick={async () => {
            setResetSettingsInProgress(true);
            await resetSettings();
            setResetSettingsInProgress(false);
          }}
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          layout={"below"}
        >
          {resetSettingsInProgress ? "Resetting..." : 'Delete settings'}
        </DeckyButton>
      </DeckyRow>
      {!isIntel && (
        <>
          <DeckyRow>
            <DeckyField label={"Detect AMD undervolt"} bottomSeparator="none">
              Check if your device supports ryzenadj-based CPU undervolting. If it does, you should see a toggle appear in the advanced options. This will reboot Steam.
            </DeckyField>
          </DeckyRow>
          <DeckyRow>
            <DeckyButton
              onClick={async () => {
                setCheckAmdUndervolt(true);
                await checkRyzenadjCoall();
                setCheckAmdUndervolt(false);
              }}
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
              layout={"below"}
            >
              {checkAmdUndervolt ? "Updating..." : 'Check AMD undervolt'}
            </DeckyButton>
          </DeckyRow>
        </>
      )}
    </DeckySection>
  );
};

export default OtaUpdates;
