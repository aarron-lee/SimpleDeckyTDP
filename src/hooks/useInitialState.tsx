import { useSelector } from "react-redux";
import {
  initialLoadSelector,
  allStateSelector,
} from "../redux-modules/settingsSlice";

export const useIsInitiallyLoading = () => useSelector(initialLoadSelector);

export const useSettingsState = () => useSelector(allStateSelector);
