import { useDispatch } from 'react-redux';
import {
  updateTdpProfiles,
  TdpProfiles,
} from '../redux-modules/settingsSlice';

export const useSetTdp = () => {
  const dispatch = useDispatch();

  const dispatcher = (gameId: string, tdp: number) => {
    const payload: TdpProfiles = {
      [gameId]: {
        tdp,
      },
    };
    return dispatch(updateTdpProfiles(payload));
  };

  return dispatcher;
};
