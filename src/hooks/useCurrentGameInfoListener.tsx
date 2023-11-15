import { Router } from 'decky-frontend-lib';
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { setCurrentGameInfo } from '../redux-modules/settingsSlice';

let id: any;

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
      id = setInterval(tick, delay);
    }
    return () => {
      if (id) {
        clearInterval(id);
      }
    };
  }, [delay]);
}

export const useCurrentGameInfoListener = () => {
  const dispatch = useDispatch();

  useInterval(() => {
    const results = {
      id: `${Router.MainRunningApp?.appid || 'default'}`,
      displayName: `${
        Router.MainRunningApp?.display_name || 'default'
      }`,
    };
    dispatch(setCurrentGameInfo(results));
  }, 2000);
};
