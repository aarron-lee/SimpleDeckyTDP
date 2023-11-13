import { useDispatch, useSelector } from 'react-redux'
import { defaultTdpSelector, updateTdpProfiles, TdpProfiles } from '../redux-modules/settingsSlice'

export const useDefaultTdp = () => {
  const dispatch = useDispatch()

  const dispatcher = (tdp: number) =>  {
	const payload: TdpProfiles = {
	  default: {
	  	tdp
	  }
	}
	return dispatch(updateTdpProfiles(payload))
  }

  return [useSelector(defaultTdpSelector), dispatcher]
}
