import { useSelector } from "react-redux";

import { selectDeviceName } from "../redux-modules/uiSlice";

const useDeviceName = () => {
  return useSelector(selectDeviceName);
};

export default useDeviceName;
