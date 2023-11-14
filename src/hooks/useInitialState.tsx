import {
  ServerAPI,
} from "decky-frontend-lib";
import { useEffect } from 'react';
import { createServerApiHelpers } from '../backend/utils'
import { useInitialLoad, useSettingsState } from './useInitialLoad'
import { get } from 'lodash'


// bootstrap initial state from python backend
export const useInitialState = (serverAPI: ServerAPI) => {
  const [loading, setInitialLoad] = useInitialLoad()
  const allSettings = useSettingsState()

  const { logInfo, getSettings } = createServerApiHelpers(serverAPI)

  // persist settings from backend to redux state
  useEffect(() => {
    getSettings().then((result) => {
       if(result.success) {
        const { minTdp, maxTdp } = result.result as { minTdp: number, maxTdp: number };

        const pollState = Boolean(get(result, 'result.pollEnabled'));

        const tdpProfiles: undefined | { [profileName:string]: {tdp: number} } = get(result, 'result.tdpProfiles');

        logInfo(`intiialload result ${JSON.stringify(result)}`)

        setInitialLoad({ minTdp, maxTdp, pollState, tdpProfiles })
      }
    })
  }, [])

   logInfo(`reduxState = ${JSON.stringify(allSettings)}`)
   return loading
}