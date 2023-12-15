import { useDispatch, useSelector } from "react-redux";
import {
  getCurrentCpuBoostSelector,
  setCpuBoost,
} from "../redux-modules/settingsSlice";
import { useCallback } from "react";

export const useCpuBoost = () => {
  const cpuBoost = useSelector(getCurrentCpuBoostSelector);
  const dispatch = useDispatch();

  const setter = useCallback((enabled: boolean) => {
    return dispatch(setCpuBoost(enabled));
  }, []);

  return { cpuBoost, setCpuBoost: setter };
};
