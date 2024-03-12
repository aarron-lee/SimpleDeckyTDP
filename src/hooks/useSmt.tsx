import { useDispatch, useSelector } from "react-redux";
import {
  getCurrentSmtSelector,
  setSmt,
} from "../redux-modules/settingsSlice";
import { useCallback } from "react";

export const useSmt = () => {
  const smt = useSelector(getCurrentSmtSelector);
  const dispatch = useDispatch();

  const setter = useCallback((enabled: boolean) => {
    return dispatch(setSmt(enabled));
  }, []);

  return { smt, setSmt: setter };
};
