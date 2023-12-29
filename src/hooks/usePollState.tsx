import { useDispatch, useSelector } from "react-redux";
import {
  pollRateSelector,
  pollEnabledSelector,
  updatePollRate,
  setPolling,
  disableBackgroundPollingSelector,
  setDisableBackgroundPolling,
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

export const useSetPoll = () => {
  const dispatch = useDispatch();

  return (enabled: boolean) => {
    return dispatch(setPolling(enabled));
  };
};

export const useDisableBackgroundPolling = () => {
  const enabled = useSelector(disableBackgroundPollingSelector);
  const dispatch = useDispatch();
  const setter = (enabled: boolean) => {
    return dispatch(setDisableBackgroundPolling(enabled));
  };

  return {
    disableBackgroundPolling: enabled,
    setDisableBackgroundPolling: setter,
  };
};
