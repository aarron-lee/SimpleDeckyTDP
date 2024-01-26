import { useDispatch } from "react-redux";
import { setReduxTdp } from "../redux-modules/settingsSlice";

export const useSetTdp = () => {
  const dispatch = useDispatch();

  const dispatcher = (tdp: number) => {
    return dispatch(setReduxTdp(tdp));
  };

  return dispatcher;
};
