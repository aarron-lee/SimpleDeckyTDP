import { useEffect, useState } from "react";
import {
  getLatestVersionNum,
  getServerApi,
  otaUpdate,
} from "../../backend/utils";
import { useSelector } from "react-redux";
import {
  getInstalledVersionNumSelector,
  getScalingDriverSelector,
} from "../../redux-modules/settingsSlice";
import {
  ButtonItem,
  Field,
  PanelSection,
  PanelSectionRow,
} from "decky-frontend-lib";

const OtaUpdates = () => {
  const [latestVersionNum, setLatestVersionNum] = useState("");
  const installedVersionNum = useSelector(getInstalledVersionNumSelector);
  const scalingDriver = useSelector(getScalingDriverSelector);

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
    <PanelSection title="System Info">
      <PanelSectionRow>
        <Field disabled label={"Installed Version"} bottomSeparator="none">
          {installedVersionNum}
        </Field>
      </PanelSectionRow>

      {Boolean(latestVersionNum) && (
        <PanelSectionRow>
          <Field disabled label={"Latest Version"} bottomSeparator="none">
            {latestVersionNum}
          </Field>
        </PanelSectionRow>
      )}
      {Boolean(scalingDriver) && (
        <PanelSectionRow>
          <Field disabled label={"Scaling Driver"} bottomSeparator="none">
            {scalingDriver}
          </Field>
        </PanelSectionRow>
      )}
      {Boolean(latestVersionNum) && (
        <PanelSectionRow>
          <ButtonItem
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
          </ButtonItem>
        </PanelSectionRow>
      )}
    </PanelSection>
  );
};

export default OtaUpdates;
