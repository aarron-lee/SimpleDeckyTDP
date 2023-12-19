import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getGpuModeSelector, setGpuMode } from "../redux-modules/settingsSlice";

const useGpuMode = () => {
  const { activeGameId, gpuMode } = useSelector(getGpuModeSelector);
  const dispatch = useDispatch();

  const setMode = useCallback((mode) => {
    return dispatch(setGpuMode(mode));
  }, []);

  return { activeGameId, gpuMode, setGpuMode: setMode };
};

export default useGpuMode;
