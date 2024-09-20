import { useDispatch, useSelector } from "react-redux";
import {
  initialLoadSelector,
  allStateSelector,
  updateInitialLoad,
} from "../redux-modules/settingsSlice";
import { getSettings } from "../backend/utils";
import { useEffect } from "react";
import { AppDispatch } from "../redux-modules/store";

export const useIsInitiallyLoading = () => useSelector(initialLoadSelector);

export const useSettingsState = () => useSelector(allStateSelector);

export const useFetchInitialStateEffect = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    getSettings().then((result) => {
      const results = result || {};

      //@ts-ignore
      dispatch(updateInitialLoad(...results));
    });
  }, []);
};
