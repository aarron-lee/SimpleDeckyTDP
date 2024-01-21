import { Dispatch } from "redux";
import {
  cacheSteamPatchGpu,
  cacheSteamPatchTdp,
  getAdvancedOptionsInfoSelector,
  setCurrentGameInfo,
  setSteamPatchDefaultTdp,
} from "./settingsSlice";
import {
  AdvancedOptionsEnum,
  createServerApiHelpers,
  getServerApi,
  saveSteamPatchTdpProfiles,
  setSteamPatchTDP,
} from "../backend/utils";
import { PayloadAction } from "@reduxjs/toolkit";
import { ServerAPI } from "decky-frontend-lib";
import { resumeAction } from "./extraActions";
import { getSteamPerfSettings } from "../steamPatch/steamPatch";
import { getProfileForCurrentIdSelector } from "../steamPatch/utils";

let setTdpTimeoutId: any;

const saveToBackendTypes = [
  cacheSteamPatchTdp.type,
  cacheSteamPatchGpu.type,
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

    if (steamPatchEnabled) {
      const steamPatchProfile = getProfileForCurrentIdSelector(state);

      if (action.type === setSteamPatchDefaultTdp.type) {
        setSetting({
          fieldName: "steamPatchDefaultTdp",
          fieldValue: state.settings.steamPatchDefaultTdp,
        });
      }

      if (action.type === resumeAction.type) {
        if (steamPatchEnabled) {
          if (steamPatchProfile?.tdp) {
            if (setTdpTimeoutId) {
              clearTimeout(setTdpTimeoutId);
              setTdpTimeoutId = undefined;
            }
            setTimeout(() => {
              setSteamPatchTDP(steamPatchProfile.tdp);
            }, 2000);
          }
          // getSteamPerfSettings();
        }
      }

      if (action.type === setCurrentGameInfo.type) {
        if (steamPatchEnabled) {
          if (steamPatchProfile?.tdp) {
            if (setTdpTimeoutId) {
              clearTimeout(setTdpTimeoutId);
              setTdpTimeoutId = undefined;
            }
            setTimeout(() => {
              setSteamPatchTDP(steamPatchProfile.tdp);
            }, 2000);
          }
          // get steam perf settings when currentGameId changes
          // getSteamPerfSettings();
        }
      }

      if (saveToBackendTypes.includes(action.type)) {
        saveSteamPatchTdpProfiles(state.settings.tdpProfiles, advancedState);
      }
    }

    return result;
  };
