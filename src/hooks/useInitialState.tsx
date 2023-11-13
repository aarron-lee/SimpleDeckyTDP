import {
  ServerAPI,
} from "decky-frontend-lib";
import { useEffect } from 'react';
import { createServerApiHelpers } from '../backend/utils'
import { useInitialLoad, useSettingsState } from './useInitialLoad'


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
        setInitialLoad({ minTdp, maxTdp })
      }
    })
  }, [])

   logInfo(`reduxState = ${JSON.stringify(allSettings)}`)
   return loading
}