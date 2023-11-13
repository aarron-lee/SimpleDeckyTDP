import { useDispatch, useSelector } from 'react-redux'
import { defaultTdpSelector, updateTdpProfiles } from '../redux-modules/settingsSlice'



// export const useTdpRange = () => {
// 	return useSelector(tdpRangeSelector);
// }

export const useDefaultTdp = () => {
  const dispatch = useDispatch()

  const dispatcher = (tdp: number) =>  {
	const payload = {
	  default: {
	  	tdp
	  }
	}
	return dispatch(updateTdpProfiles(payload))
  }

  return [useSelector(defaultTdpSelector), dispatcher]
}

// export const useMaxTdp = () => {
//   const dispatch = useDispatch()

//   return [useSelector(maxTdpSelector), (value: number) => dispatch(updateMaxTdp(value))]
// }
