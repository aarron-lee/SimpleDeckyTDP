import { useDispatch, useSelector } from 'react-redux';
import {
  minTdpSelector,
  maxTdpSelector,
  updateMinTdp,
  updateMaxTdp,
  tdpRangeSelector,
} from '../redux-modules/settingsSlice';

export const useTdpRange = () => {
  return useSelector(tdpRangeSelector);
};

export const useMinTdp = () => {
  const dispatch = useDispatch();

  return [
    useSelector(minTdpSelector),
    (value: number) => dispatch(updateMinTdp(value)),
  ];
};

export const useMaxTdp = () => {
  const dispatch = useDispatch();

  return [
    useSelector(maxTdpSelector),
    (value: number) => dispatch(updateMaxTdp(value)),
  ];
};
