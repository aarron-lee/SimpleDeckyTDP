import { useSelector } from "react-redux";

import { selectDeviceName } from "../redux-modules/uiSlice";
import { Devices } from "../backend/utils";

export const useDeviceName = () => {
  return useSelector(selectDeviceName);
};

export const useIsSteamDeck = () => {
  const deviceName = useSelector(selectDeviceName);

  if (
    deviceName.includes(Devices.STEAM_DECK_LCD) ||
    deviceName.includes(Devices.STEAM_DECK_OLED)
  ) {
    return true;
  }
  return false;
};

export default useDeviceName;
