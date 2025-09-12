import { FC } from "react";
import { DeckyRow, DeckyToggle } from "./DeckyFrontendLib";
import { useDispatch, useSelector } from "react-redux";
import { selectTdpUncapEnabled, uiSlice } from "../../redux-modules/uiSlice";


const TdpUncapToggle: FC = () => {
  const overrideEnabled = useSelector(selectTdpUncapEnabled)
  const dispatch = useDispatch()

  return (
    <DeckyRow>
      <DeckyToggle
        label="(DANGER) Force Override Max TDP limit"
        description="Warning, only use this if you know what you are doing. Sets 120W max TDP limit"
        checked={overrideEnabled}
        onChange={(enabled: boolean) => {
          dispatch(uiSlice.actions.setTdpOverride(!!enabled));
        }}
        highlightOnFocus
      />
    </DeckyRow>
  );
};

export default TdpUncapToggle;
