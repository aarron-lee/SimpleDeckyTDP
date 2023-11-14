import {
  ServerAPI,
} from "decky-frontend-lib";
import { useEffect } from 'react';
import { createServerApiHelpers } from '../backend/utils'
import { get } from 'lodash'
import { useSelector, useDispatch } from 'react-redux';
import { updateInitialLoad, initialLoadSelector, InitialStateType, allStateSelector } from '../redux-modules/settingsSlice';


export const useInitialLoad = () => {
  const dispatch = useDispatch()

  return [
    useSelector(initialLoadSelector),
    ({minTdp, maxTdp, pollState, tdpProfiles, pollRate }: InitialStateType ) => 
      dispatch(
        updateInitialLoad({
        minTdp,
        maxTdp,
        pollState,
        tdpProfiles,
        pollRate
        })
      )
    ]
}

export const useIsInitiallyLoading = () => useSelector(initialLoadSelector)

export const useSettingsState = () => useSelector(allStateSelector)


// bootstrap initial state from python backend
export const useInitialState = (serverAPI: ServerAPI) => {
  const [loading, setInitialLoad] = useInitialLoad()
  const allSettings = useSettingsState()

  const { logInfo, getSettings } = createServerApiHelpers(serverAPI)
  // const { getSettings } = createServerApiHelpers(serverAPI)

  // persist settings from backend to redux state
  useEffect(() => {
    getSettings().then((result) => {
       if(result.success) {
        const { minTdp, maxTdp } = result.result as { minTdp: number, maxTdp: number };

        const pollState = Boolean(get(result, 'result.pollEnabled'));

        const tdpProfiles: undefined | { [profileName:string]: {tdp: number} } = get(result, 'result.tdpProfiles');

        // logInfo(`intiialload result ${JSON.stringify(result)}`)

        setInitialLoad({ minTdp, maxTdp, pollState, tdpProfiles })
      }
    })
  }, [])

   logInfo(`reduxState = ${JSON.stringify(allSettings)}`)
   return loading
}