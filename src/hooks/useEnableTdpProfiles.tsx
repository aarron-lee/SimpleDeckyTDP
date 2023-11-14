import { useDispatch, useSelector } from 'react-redux';
import {
  setEnableTdpProfiles,
  tdpProfilesEnabled,
} from '../redux-modules/settingsSlice';
import { useCallback } from 'react';

export const useUpdateEnableTdpProfiles = () => {
  const dispatch = useDispatch();

  const f = useCallback((enabled: boolean) => {
    return dispatch(setEnableTdpProfiles(enabled));
  }, []);

  return f;
};

export const useTdpProfilesEnabled = () => {
  const setter = useUpdateEnableTdpProfiles();

  return [useSelector(tdpProfilesEnabled), setter];
};
