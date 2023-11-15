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
