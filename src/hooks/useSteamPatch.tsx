import { useDispatch, useSelector } from "react-redux";
import {
  getSteamPatchDefaultTdpSelector,
  setSteamPatchDefaultTdp,
} from "../redux-modules/settingsSlice";

export const useSteamPatchDefaultTdp = () => {
  const defaultTdp = useSelector(getSteamPatchDefaultTdpSelector);
  const dispatch = useDispatch();

  const dispatcher = (tdp: number) => {
    return dispatch(setSteamPatchDefaultTdp(tdp));
  };

  return { defaultTdp, setDefaultTdp: dispatcher };
};
