import { useSelector, useDispatch } from 'react-redux';
import { updateInitialLoad, initialLoadSelector, InitialStateType, allStateSelector } from '../redux-modules/settingsSlice';




export const useInitialLoad = () => {
	const dispatch = useDispatch()

	return [
	  useSelector(initialLoadSelector),
	  ({minTdp, maxTdp, pollState, tdpProfiles }: InitialStateType ) => dispatch(updateInitialLoad({minTdp, maxTdp, pollState, tdpProfiles}))
	]
}

export const useIsInitiallyLoading = () => useSelector(initialLoadSelector)

export const useSettingsState = () => useSelector(allStateSelector)