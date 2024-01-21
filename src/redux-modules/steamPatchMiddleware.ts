import { Dispatch } from "redux";
import {
  cacheSteamPatchGpu,
  cacheSteamPatchTdp,
  getAdvancedOptionsInfoSelector,
  setCpuBoost,
  setCurrentGameInfo,
  setSmt,
  setSteamPatchDefaultTdp,
} from "./settingsSlice";
import {
  AdvancedOptionsEnum,
  createServerApiHelpers,
  getServerApi,
  saveSteamPatchTdpProfiles,
  setSteamPatchTDP,
  setTdpForGameId,
} from "../backend/utils";
import { PayloadAction } from "@reduxjs/toolkit";
import { ServerAPI } from "decky-frontend-lib";
import { resumeAction } from "./extraActions";
import { getSteamPerfSettings } from "../steamPatch/steamPatch";
import { extractCurrentGameId } from "../utils/constants";

const saveToBackendTypes = [
  cacheSteamPatchTdp.type,
  cacheSteamPatchGpu.type,
  setSmt.type,
  setCpuBoost.type,
] as string[];

export const steamPatchMiddleware =
  (store: any) => (dispatch: Dispatch) => (action: PayloadAction<any>) => {
    const result = dispatch(action);

    const serverApi = getServerApi();

    const { setSetting } = createServerApiHelpers(serverApi as ServerAPI);

    const state = store.getState();

    const { advancedState } = getAdvancedOptionsInfoSelector(state);
    const steamPatchEnabled = Boolean(
      advancedState[AdvancedOptionsEnum.STEAM_PATCH]
    );

    const id = extractCurrentGameId();

    if (steamPatchEnabled) {
      if (action.type === setSteamPatchDefaultTdp.type) {
        setSetting({
          fieldName: "steamPatchDefaultTdp",
          fieldValue: state.settings.steamPatchDefaultTdp,
        });
      }

      if (action.type === resumeAction.type) {
        if (steamPatchEnabled) {
          setTdpForGameId(id);
        }
      }

      if (action.type === setCurrentGameInfo.type) {
        if (steamPatchEnabled) {
          setTdpForGameId(id);
        }
      }

      if (saveToBackendTypes.includes(action.type)) {
        saveSteamPatchTdpProfiles(state.settings.tdpProfiles, advancedState);
      }
    }

    return result;
  };
