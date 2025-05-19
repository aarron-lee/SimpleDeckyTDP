import { RootState } from "../redux-modules/store";
import { Devices } from "../backend/utils";
import { get } from "lodash";

export const selectDeviceName = (state: RootState) => {
  return get(state, "ui.powerControlInfo.deviceName", "");
};

export const selectIsSteamDeck = (state: RootState) => {
  const deviceName = selectDeviceName(state);

  if (
    deviceName.includes(Devices.STEAM_DECK_LCD) ||
    deviceName.includes(Devices.STEAM_DECK_OLED)
  ) {
    return true;
  }
  return false;
};
