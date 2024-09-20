import { useDispatch } from "react-redux";
import { AppDispatch } from "../redux-modules/store";
import { fetchPowerControlInfo } from "../redux-modules/thunks";

export const useFetchPowerControlInfo = () => {
  const dispatch = useDispatch<AppDispatch>();

  return () => dispatch(fetchPowerControlInfo());
};
