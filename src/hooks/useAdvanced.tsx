import { useSelector } from "react-redux";
import { getAdvancedOptionsInfoSelector } from "../redux-modules/settingsSlice";
import {
  AdvancedOptionsEnum,
  LegionGoAdvancedOptions,
  RogAllyAdvancedOptions,
  SteamDeckAdvancedOptions,
} from "../backend/utils";

export const useAdvancedOption = (
  option:
    | AdvancedOptionsEnum
    | SteamDeckAdvancedOptions
    | RogAllyAdvancedOptions
    | LegionGoAdvancedOptions
) => {
  const { advancedState } = useSelector(getAdvancedOptionsInfoSelector);

  return Boolean(advancedState[option]);
};
