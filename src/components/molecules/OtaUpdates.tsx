import { useEffect, useState } from "react";
import {
  getLatestVersionNum,
  otaUpdate,
  resetSettings,
  checkRyzenadjCoall,
} from "../../backend/utils";
import { useSelector } from "react-redux";
import {
  getInstalledVersionNumSelector,
  getSystemLangSelector,
} from "../../redux-modules/settingsSlice";
import { selectScalingDriver } from "../../redux-modules/uiSlice";
import {
  DeckyButton,
  DeckyField,
  DeckyRow,
  DeckySection,
} from "../atoms/DeckyFrontendLib";
import useDeviceName from "../../hooks/useDeviceName";
import useIsIntel from "../../hooks/useIsIntel";
import t from '../../i18n/i18n';

const OtaUpdates = () => {
  const [latestVersionNum, setLatestVersionNum] = useState("");
  const [updateInProgress, setUpdateInProgress] = useState(false);
  const [resetSettingsInProgress, setResetSettingsInProgress] = useState(false);
  const [checkAmdUndervolt, setCheckAmdUndervolt] = useState(false);

  const installedVersionNum = useSelector(getInstalledVersionNumSelector);
  const systemLang = useSelector(getSystemLangSelector);
  const scalingDriver = useSelector(selectScalingDriver);
  const deviceName = useDeviceName();
  const isIntel = useIsIntel();

  const isUpdated =
    installedVersionNum === latestVersionNum && Boolean(latestVersionNum);

  useEffect(() => {
    const fn = async () => {
      const fetchedVersionNum: unknown = await getLatestVersionNum();

      setLatestVersionNum(fetchedVersionNum as string);
    };

    fn();
  }, []);

  let buttonText = `${t('SYSTEM_INFO_UPDATE_TO', 'Update to')} ${latestVersionNum}`;

  if (isUpdated) {
    buttonText = t('SYSTEM_INFO_REINSTALL', 'Reinstall Plugin');
  }

  return (
    <DeckySection title={t('SYSTEM_INFO_TITLE', 'System Info')}>
      <DeckyRow>
        <DeckyField label={t('SYSTEM_INFO_SYSTEM_LANGUAGE', 'System Language')} bottomSeparator="none">
          {systemLang || "Error: None Found"}
        </DeckyField>
      </DeckyRow>
      <DeckyRow>
        <DeckyField label={t('SYSTEM_INFO_INSTALLED_VERSION', 'Installed Version')} bottomSeparator="none">
          {installedVersionNum}
        </DeckyField>
      </DeckyRow>

      {Boolean(latestVersionNum) && (
        <DeckyRow>
          <DeckyField label={t('SYSTEM_INFO_LATEST_VERSION', 'Latest Version')} bottomSeparator="none">
            {latestVersionNum}
          </DeckyField>
        </DeckyRow>
      )}
      {Boolean(scalingDriver) && (
        <DeckyRow>
          <DeckyField label={t('SYSTEM_INFO_SCALING_DRIVER', 'Scaling Driver')} bottomSeparator="none">
            {scalingDriver}
          </DeckyField>
        </DeckyRow>
      )}
      {Boolean(deviceName) && (
        <DeckyRow>
          <DeckyField label={t('SYSTEM_INFO_DEVICE_NAME', 'Device Name')} bottomSeparator="none">
            {deviceName}
          </DeckyField>
        </DeckyRow>
      )}
      <DeckyRow>
        <DeckyField label={t('SYSTEM_INFO_RESET_SETTINGS', 'Reset Plugin Settings')} bottomSeparator="none">
          {t('SYSTEM_INFO_RESET_WARNING', 'WARNING! This permanently deletes your current settings. This will also restart the Steam client, no Steam data will be affected.')}
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
          {resetSettingsInProgress ? t('SYSTEM_INFO_RESETTING', 'Resetting...') : t('SYSTEM_INFO_DELETE_SETTINGS', 'Delete settings')}
        </DeckyButton>
      </DeckyRow>
      {Boolean(latestVersionNum) && (
        <>
          <DeckyRow>
            <DeckyField label={t('SYSTEM_INFO_INFO', 'Info')} bottomSeparator="none">
              {isUpdated ? t('SYSTEM_INFO_REINSTALL_TIME', 'Reinstall can take up to 1 minute') : t('SYSTEM_INFO_UPDATE_TIME', 'Update can take up to 1 minute')}
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
              {updateInProgress ? t('SYSTEM_INFO_UPDATING', 'Updating...') : buttonText}
            </DeckyButton>
          </DeckyRow>
        </>
      )}
      {!isIntel && (
        <>
          <DeckyRow>
            <DeckyField label={t('SYSTEM_INFO_DETECT_AMD_UNDERVOLT', 'Detect AMD undervolt')} bottomSeparator="none">
              {t('SYSTEM_INFO_DETECT_AMD_UNDERVOLT_DESC', 'Check if your device supports ryzenadj-based CPU undervolting. If it does, you should see a toggle appear in the advanced options. This will reboot Steam.')}
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
              {checkAmdUndervolt ? t('SYSTEM_INFO_UPDATING', 'Updating...') : t('SYSTEM_INFO_CHECK_AMD_UNDERVOLT', 'Check AMD undervolt')}
            </DeckyButton>
          </DeckyRow>
        </>
      )}
    </DeckySection>
  );
};

export default OtaUpdates;
