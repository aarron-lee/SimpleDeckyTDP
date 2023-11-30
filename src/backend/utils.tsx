import { Router, ServerAPI } from "decky-frontend-lib";

export enum ServerAPIMethods {
  SET_SETTING = "set_setting",
  GET_SETTINGS = "get_settings",
  LOG_INFO = "log_info",
  SET_TDP = "set_tdp",
  SAVE_TDP = "save_tdp",
  SET_POLL_TDP = "set_poll_tdp",
}

export const createLogInfo = (serverAPI: ServerAPI) => async (info: any) => {
  await serverAPI.callPluginMethod(ServerAPIMethods.LOG_INFO, {
    info,
  });
};

export const createSetSetting =
  (serverAPI: ServerAPI) =>
  async ({ fieldName, fieldValue }: { fieldName: string; fieldValue: any }) =>
    await serverAPI.callPluginMethod(ServerAPIMethods.SET_SETTING, {
      name: fieldName,
      value: fieldValue,
    });

export const createGetSettings = (serverAPI: ServerAPI) => async () => {
  return await serverAPI.callPluginMethod(ServerAPIMethods.GET_SETTINGS, {});
};

export const createSetTdp = (serverAPI: ServerAPI) => async (tdp: number) => {
  return await serverAPI.callPluginMethod(ServerAPIMethods.SET_TDP, {
    tdp,
  });
};

export const createSaveTdp =
  (serverAPI: ServerAPI) => async (gameId: string, tdp: number) => {
    return await serverAPI.callPluginMethod(ServerAPIMethods.SAVE_TDP, {
      profileName: gameId,
      value: tdp,
    });
  };

export const createSetPollTdp =
  (serverAPI: ServerAPI) => async (currentGameId: string) => {
    return await serverAPI.callPluginMethod(ServerAPIMethods.SET_POLL_TDP, {
      currentGameId,
    });
  };

export const createServerApiHelpers = (serverAPI: ServerAPI) => {
  return {
    getSettings: createGetSettings(serverAPI),
    setSetting: createSetSetting(serverAPI),
    logInfo: createLogInfo(serverAPI),
    saveTdp: createSaveTdp(serverAPI),
    setTdp: createSetTdp(serverAPI),
    setPollTdp: createSetPollTdp(serverAPI),
  };
};

let serverApi: undefined | ServerAPI;

export const saveServerApi = (s: ServerAPI) => {
  serverApi = s;
};

export const getServerApi = () => {
  return serverApi;
};
