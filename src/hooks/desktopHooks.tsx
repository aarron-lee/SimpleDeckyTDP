import { useDispatch, useSelector } from "react-redux";
import { selectIsDesktop } from "../redux-modules/uiSlice";
import { useEffect } from "react";
import { setCurrentGameInfo } from "../redux-modules/settingsSlice";
import { getCurrentGameInfo } from "../components/atoms/DeckyFrontendLib";

export const useIsDesktop = () => {
  const isDesktop = useSelector(selectIsDesktop);

  return isDesktop;
};

export const useDesktopProfileChangeEffect = (tdpProfilesEnabled: boolean) => {
  const isDesktop = useIsDesktop();
  const dispatch = useDispatch();

  useEffect(() => {
    if (isDesktop) {
      if (tdpProfilesEnabled) {
        dispatch(
          setCurrentGameInfo({
            id: "default-desktop",
            displayName: "Default - Desktop",
          })
        );
      } else {
        dispatch(setCurrentGameInfo(getCurrentGameInfo()));
      }
    }
  }, [tdpProfilesEnabled]);
};
