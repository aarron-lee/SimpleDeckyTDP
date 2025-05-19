import { RootState } from "../redux-modules/store";
import { Devices } from "../backend/utils";
import { get } from "lodash";

export const selectDeviceName = (state: RootState) => {
  return get(state, "ui.powerControlInfo.deviceName", "");
};

export const selectIsSteamDeck = (state: RootState) => {
  const deviceName = selectDeviceName(state);

  return isSteamDeck(deviceName);
};

export function isSteamDeck(deviceName: string) {
  if (
    deviceName.includes(Devices.STEAM_DECK_LCD) ||
    deviceName.includes(Devices.STEAM_DECK_OLED)
  ) {
    return true;
  }
  return false;
}
