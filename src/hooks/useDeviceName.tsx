import { useSelector } from "react-redux";
import { selectDeviceName, selectIsSteamDeck } from "../redux-modules/uiSlice";

export const useDeviceName = () => {
  return useSelector(selectDeviceName);
};

export const useIsSteamDeck = () => {
  const isSteamDeck = useSelector(selectIsSteamDeck);

  return isSteamDeck;
};

export default useDeviceName;
