import { useDispatch, useSelector } from "react-redux";
import {
  pollRateSelector,
  pollEnabledSelector,
  updatePollRate,
} from "../redux-modules/settingsSlice";

export const usePollInfo = () => {
  return {
    enabled: useSelector(pollEnabledSelector),
    pollRate: useSelector(pollRateSelector),
  };
};

export const useSetPollRate = () => {
  const dispatch = useDispatch();

  return (pollRate: number) => {
    return dispatch(updatePollRate(pollRate));
  };
};
