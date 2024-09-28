import { useSelector } from "react-redux";
import { cpuVendorSelector } from "../redux-modules/settingsSlice";
import { CpuVendors } from "../utils/constants";

export const useIsIntel = () => {
  const cpuVendor = useSelector(cpuVendorSelector);

  if (cpuVendor === CpuVendors.INTEL) {
    // intel doesn't support different GPU modes, only gpu freq
    return true;
  }

  return false;
};

export default useIsIntel;
