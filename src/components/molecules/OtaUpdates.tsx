import { useEffect, useState } from "react";
import {
  getLatestVersionNum,
  getServerApi,
  otaUpdate,
} from "../../backend/utils";
import { useSelector } from "react-redux";
import { getInstalledVersionNumSelector } from "../../redux-modules/settingsSlice";
import {
  ButtonItem,
  Field,
  PanelSection,
  PanelSectionRow,
} from "decky-frontend-lib";

const OtaUpdates = () => {
  const [latestVersionNum, setLatestVersionNum] = useState("");
  const installedVersionNum = useSelector(getInstalledVersionNumSelector);

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
    <PanelSection title="Updates">
      <PanelSectionRow>
        <Field disabled label={"Installed Version"}>
          {installedVersionNum}
        </Field>
      </PanelSectionRow>

      {Boolean(latestVersionNum) && (
        <PanelSectionRow>
          <Field disabled label={"Latest Version"}>
            {latestVersionNum}
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
