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

  return (
    <PanelSection title="Updates">
      <PanelSectionRow>
        <Field disabled label={"Installed Version"}>
          {installedVersionNum}
        </Field>
      </PanelSectionRow>

      {Boolean(latestVersionNum) && (
        <PanelSectionRow>
          <Field disabled label={"Newest Version"}>
            {latestVersionNum}
          </Field>
        </PanelSectionRow>
      )}
      {installedVersionNum !== latestVersionNum &&
        Boolean(latestVersionNum) && (
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
              Update to {latestVersionNum}
            </ButtonItem>
          </PanelSectionRow>
        )}
    </PanelSection>
  );
};

export default OtaUpdates;
