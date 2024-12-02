import { useEffect, useState } from "react";
import { getLatestVersionNum, otaUpdate } from "../../backend/utils";
import { useSelector } from "react-redux";
import { getInstalledVersionNumSelector } from "../../redux-modules/settingsSlice";
import { selectScalingDriver } from "../../redux-modules/uiSlice";
import {
  DeckyButton,
  DeckyField,
  DeckyRow,
  DeckySection,
} from "../atoms/DeckyFrontendLib";

const OtaUpdates = () => {
  const [latestVersionNum, setLatestVersionNum] = useState("");
  const [updateInProgress, setUpdateInProgress] = useState(false);

  const installedVersionNum = useSelector(getInstalledVersionNumSelector);
  const scalingDriver = useSelector(selectScalingDriver);

  const isUpdated =
    installedVersionNum === latestVersionNum && Boolean(latestVersionNum);

  useEffect(() => {
    const fn = async () => {
      const fetchedVersionNum = await getLatestVersionNum();

      setLatestVersionNum(fetchedVersionNum);
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
    </DeckySection>
  );
};

export default OtaUpdates;
