import { ServerAPI } from "decky-frontend-lib";
import { useEffect } from "react";
import { createServerApiHelpers } from "../backend/utils";
import { useSelector, useDispatch } from "react-redux";
import {
  updateInitialLoad,
  initialLoadSelector,
  InitialStateType,
  allStateSelector,
} from "../redux-modules/settingsSlice";
import { useCurrentGameInfoListener } from "./useCurrentGameInfoListener";

export const useInitialLoad = () => {
  const dispatch = useDispatch();

  return [
    useSelector(initialLoadSelector),
    ({
      minTdp,
      maxTdp,
      pollEnabled,
      tdpProfiles,
      pollRate,
      enableTdpProfiles,
    }: InitialStateType) =>
      dispatch(
        updateInitialLoad({
          minTdp,
          maxTdp,
          pollEnabled,
          tdpProfiles,
          pollRate,
          enableTdpProfiles,
        })
      ),
  ];
};

export const useIsInitiallyLoading = () => useSelector(initialLoadSelector);

export const useSettingsState = () => useSelector(allStateSelector);

// bootstrap initial state from python backend
export const useInitialState = () => {
  const [loading] = useInitialLoad();

  // start listener for active app changes
  useCurrentGameInfoListener();

  return loading;
};
