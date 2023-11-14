import { ServerAPI } from 'decky-frontend-lib';

export enum ServerAPIMethods {
  SET_SETTING = 'set_setting',
  GET_SETTINGS = 'get_settings',
  LOG_INFO = 'log_info',
  SET_TDP = 'set_tdp',
  SET_GAME_INFO = 'set_game_info',
}

export const createLogInfo =
  (serverAPI: ServerAPI) => async (info: any) => {
    await serverAPI.callPluginMethod(ServerAPIMethods.LOG_INFO, {
      info,
    });
  };

export const createSaveGameInfo =
  (serverAPI: ServerAPI) =>
  async ({
    currentGameId,
    displayName,
  }: {
    currentGameId: string;
    displayName: string;
  }) => {
    await serverAPI.callPluginMethod(ServerAPIMethods.SET_GAME_INFO, {
      currentGameId,
      displayName,
    });
  };

export const createSetSetting =
  (serverAPI: ServerAPI) =>
  async ({
    fieldName,
    fieldValue,
  }: {
    fieldName: string;
    fieldValue: any;
  }) =>
    await serverAPI.callPluginMethod(ServerAPIMethods.SET_SETTING, {
      name: fieldName,
      value: fieldValue,
    });

export const createGetSettings =
  (serverAPI: ServerAPI) => async () => {
    return await serverAPI.callPluginMethod(
      ServerAPIMethods.GET_SETTINGS,
      {}
    );
  };

export const createSetDefaultTdp =
  (serverAPI: ServerAPI) => async (tdp: number) => {
    return await serverAPI.callPluginMethod(
      ServerAPIMethods.SET_TDP,
      {
        profileName: 'default',
        value: tdp,
      }
    );
  };

export const createServerApiHelpers = (serverAPI: ServerAPI) => {
  return {
    getSettings: createGetSettings(serverAPI),
    setSetting: createSetSetting(serverAPI),
    logInfo: createLogInfo(serverAPI),
    setDefaultTdp: createSetDefaultTdp(serverAPI),
  };
};
