import { Router } from 'decky-frontend-lib';
import { useEffect } from 'react';

// return value: currentId, game info

let intervalId: undefined | number;

const apps: { [key: string]: any } = {};

export const useCurrentGameInfoEffect = (logInfo?: any) => {
  useEffect(() => {
    intervalId = window.setInterval(() => {
      if (Router.MainRunningApp?.appid) {
        // MainRunningApp.display_name
        apps[Router.MainRunningApp.appid] = Router.MainRunningApp;
        logInfo && logInfo(JSON.stringify(apps));
      }
    }, 2000);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  return [0, 'default'];
};
