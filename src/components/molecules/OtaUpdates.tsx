import { useEffect, useState } from "react";
import {
  getLatestVersionNum,
  getServerApi,
  otaUpdate,
} from "../../backend/utils";
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
  const installedVersionNum = useSelector(getInstalledVersionNumSelector);
  const scalingDriver = useSelector(selectScalingDriver);

  useEffect(() => {
    const fn = async () => {
      const serverApi = getServerApi();

      if (serverApi) {
        const fetchedVersionNum = await getLatestVersionNum(serverApi);

        setLatestVersionNum(fetchedVersionNum);
      }
    };

    fn();
  }, []);

  let buttonText = `Update to ${latestVersionNum}`;

  if (installedVersionNum === latestVersionNum && Boolean(latestVersionNum)) {
    buttonText = "Reinstall Plugin";
  }

  return (
    <DeckySection title="System Info">
      <DeckyRow>
        <DeckyField disabled label={"Installed Version"} bottomSeparator="none">
          {installedVersionNum}
        </DeckyField>
      </DeckyRow>

      {Boolean(latestVersionNum) && (
        <DeckyRow>
          <DeckyField disabled label={"Latest Version"} bottomSeparator="none">
            {latestVersionNum}
          </DeckyField>
        </DeckyRow>
      )}
      {Boolean(scalingDriver) && (
        <DeckyRow>
          <DeckyField disabled label={"Scaling Driver"} bottomSeparator="none">
            {scalingDriver}
          </DeckyField>
        </DeckyRow>
      )}
      {Boolean(latestVersionNum) && (
        <>
          <DeckyRow>
            <DeckyButton
              onClick={() => {
                const serverApi = getServerApi();
                if (serverApi) otaUpdate(serverApi);
              }}
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
              layout={"below"}
            >
              {buttonText}
            </DeckyButton>
          </DeckyRow>
          <DeckyRow>
            <DeckyField label={"Info"} bottomSeparator="none">
              requires reboot to take effect
            </DeckyField>
          </DeckyRow>
        </>
      )}
    </DeckySection>
  );
};

export default OtaUpdates;
