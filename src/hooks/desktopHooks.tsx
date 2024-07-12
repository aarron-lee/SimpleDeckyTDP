import { useSelector } from "react-redux";
import { selectIsDesktop } from "../redux-modules/uiSlice";

export const useIsDesktop = () => {
  const isDesktop = useSelector(selectIsDesktop);

  return isDesktop;
};
