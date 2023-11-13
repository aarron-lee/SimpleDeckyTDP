import { useSelector, useDispatch } from 'react-redux';
import { updateInitialLoad, initialLoadSelector, TdpRangeState, tdpRangeSelector } from '../redux-modules/settingsSlice';

export const useInitialLoad = () => {
	const dispatch = useDispatch()

	return [useSelector(initialLoadSelector), ({minTdp, maxTdp}: TdpRangeState) => dispatch(updateInitialLoad({minTdp, maxTdp}))]
}

export const useIsInitiallyLoading = () => useSelector(initialLoadSelector)

export const useSettingsState = () => useSelector(tdpRangeSelector)