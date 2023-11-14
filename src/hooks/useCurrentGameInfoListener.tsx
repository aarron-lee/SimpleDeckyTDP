import { Router } from 'decky-frontend-lib';
import { useEffect, useRef } from 'react';
import { useSettingsState } from './useInitialState';

let id: number | undefined;

function useInterval(callback: any, delay: number) {
  const savedCallback = useRef<any>();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current && savedCallback.current();
    }
    if (delay !== null) {
      if (!id) id = window.setInterval(tick, delay);
      // return () => clearInterval(id);
    }
  }, [delay]);
}

export const useCurrentGameInfoListener = ({
  logInfo,
  saveGameInfo,
}: {
  logInfo: any;
  saveGameInfo: any;
}) => {
  const allSettings = useSettingsState();

  useInterval(() => {
    saveGameInfo({
      currentGameId: `${Router.MainRunningApp?.appid}`,
      displayName: `${Router.MainRunningApp?.display_name}`,
    });
  }, 1000);

  logInfo(`reduxState = ${JSON.stringify(allSettings)}`);
  return [0, 'default'];
};
