import { FC, useEffect } from "react";
import { DeckyRow, DeckyToggle } from "./DeckyFrontendLib";
import { useDispatch, useSelector } from "react-redux";
import { selectTdpUncapEnabled, uiSlice } from "../../redux-modules/uiSlice";

export const TDP_CACHE_KEY = 'SimpleDeckyTDP-enable-max-tdp-override';

const TdpUncapToggle: FC = () => {
  const overrideEnabled = useSelector(selectTdpUncapEnabled)
  const dispatch = useDispatch()

  useEffect(() => {
    // initialize value from localstorage
    const v = window.localStorage.getItem(TDP_CACHE_KEY) === "true";
    dispatch(uiSlice.actions.setTdpOverride(v));
  }, [])

  return (
    <DeckyRow>
      <DeckyToggle
        label="(DANGER) Force Override Max TDP limit"
        description="Warning, only use this if you know what you are doing. Sets 120W max TDP limit"
        checked={overrideEnabled}
        onChange={(enabled: boolean) => {
          window.localStorage.setItem(TDP_CACHE_KEY, `${enabled}}`);
          dispatch(uiSlice.actions.setTdpOverride(enabled));
        }}
        highlightOnFocus
      />
    </DeckyRow>
  );
};

export default TdpUncapToggle;
