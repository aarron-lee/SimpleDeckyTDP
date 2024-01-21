import { Dispatch } from "redux";
import {
  activeGameIdSelector,
  getAdvancedOptionsInfoSelector,
  setCpuBoost,
  setEnableTdpProfiles,
  setSmt,
  updateAdvancedOption,
  updateMaxTdp,
  updateMinTdp,
} from "./settingsSlice";
import {
  AdvancedOptionsEnum,
  createServerApiHelpers,
  getServerApi,
} from "../backend/utils";
import { PayloadAction } from "@reduxjs/toolkit";
import { ServerAPI } from "decky-frontend-lib";
import { extractCurrentGameId } from "../utils/constants";

const changeCpuStateTypes = [setCpuBoost.type, setSmt.type] as string[];

export const commonMiddleware =
  (store: any) => (dispatch: Dispatch) => (action: PayloadAction<any>) => {
    const serverApi = getServerApi();
    const { setSetting, saveTdpProfiles } = createServerApiHelpers(
      serverApi as ServerAPI
    );

    const result = dispatch(action);

    const state = store.getState();

    const { advancedState } = getAdvancedOptionsInfoSelector(state);
    const steamPatchEnabled = Boolean(
      advancedState[AdvancedOptionsEnum.STEAM_PATCH]
    );

    const activeGameId = steamPatchEnabled
      ? extractCurrentGameId()
      : activeGameIdSelector(state);

    if (action.type === setEnableTdpProfiles.type) {
      setSetting({
        fieldName: "enableTdpProfiles",
        fieldValue: action.payload,
      });
    }
    if (action.type === updateMinTdp.type) {
      setSetting({
        fieldName: "minTdp",
        fieldValue: action.payload,
      });
    }
    if (action.type === updateMaxTdp.type) {
      setSetting({
        fieldName: "maxTdp",
        fieldValue: action.payload,
      });
    }

    if (
      changeCpuStateTypes.includes(action.type) ||
      action.type === updateAdvancedOption.type
    ) {
      saveTdpProfiles(state.settings.tdpProfiles, activeGameId, advancedState);
    }

    return result;
  };
