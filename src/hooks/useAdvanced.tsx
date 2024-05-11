import { useSelector } from "react-redux";
import { getAdvancedOptionsInfoSelector } from "../redux-modules/settingsSlice";
import { AdvancedOptionsEnum } from "../backend/utils";

export const useAdvancedOption = (option: AdvancedOptionsEnum) => {
  const { advancedState } = useSelector(getAdvancedOptionsInfoSelector);

  return Boolean(advancedState[option]);
};
