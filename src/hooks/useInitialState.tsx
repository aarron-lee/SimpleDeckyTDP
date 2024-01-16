import { useDispatch, useSelector } from "react-redux";
import {
  initialLoadSelector,
  allStateSelector,
  updateInitialLoad,
} from "../redux-modules/settingsSlice";
import { createServerApiHelpers, getServerApi } from "../backend/utils";
import { useEffect } from "react";
import { AppDispatch } from "../redux-modules/store";

export const useIsInitiallyLoading = () => useSelector(initialLoadSelector);

export const useSettingsState = () => useSelector(allStateSelector);

export const useFetchInitialStateEffect = () => {
  const serverApi = getServerApi();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (serverApi) {
      const { getSettings } = createServerApiHelpers(serverApi);

      getSettings().then((result) => {
        if (result.success) {
          const results = result.result || {};

          //@ts-ignore
          dispatch(updateInitialLoad(...results));
        }
      });
    }
  }, []);
};
