import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  pollRateSelector,
  pollEnabledSelector,
  updatePollRate,
  setPolling,
} from '../redux-modules/settingsSlice';

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

let intervalId: number | undefined;

/// persists tdp to backend settings.json and sets up interval for polling
export const usePollTdpEffect = (
  tdp: number,
  persistToSettings: any
) => {
  const { enabled: pollEnabled, pollRate } = usePollInfo();

  useEffect(() => {
    if (tdp && persistToSettings) {
      if (intervalId) {
        clearInterval(intervalId);
      }
      persistToSettings(tdp);
      if (pollEnabled && pollRate) {
        intervalId = window.setInterval(() => {
          persistToSettings(tdp);
        }, pollRate);
      }
    }
  }, [tdp, pollRate, pollEnabled, persistToSettings]);
};
