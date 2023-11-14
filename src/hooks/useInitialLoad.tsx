import { useSelector, useDispatch } from 'react-redux';
import { updateInitialLoad, initialLoadSelector, TdpRangeState, allStateSelector } from '../redux-modules/settingsSlice';

export const useInitialLoad = () => {
	const dispatch = useDispatch()

	return [
	  useSelector(initialLoadSelector),
	  ({minTdp, maxTdp, pollState }: TdpRangeState & { pollState: boolean }) => dispatch(updateInitialLoad({minTdp, maxTdp, pollState}))
	]
}

export const useIsInitiallyLoading = () => useSelector(initialLoadSelector)

export const useSettingsState = () => useSelector(allStateSelector)