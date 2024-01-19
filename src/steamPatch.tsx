import { afterPatch, findModuleChild } from "decky-frontend-lib";
import { logInfo } from "./backend/utils";
import { store } from "./redux-modules/store";
import {
  getAdvancedOptionsInfoSelector,
  getGpuFrequencyRangeSelector,
  tdpRangeSelector,
} from "./redux-modules/settingsSlice";

let steamPerfSettingsClass: any;
let perfStore: any;

let minTdp: any;
let maxTdp: any;
let minGpuFreq: any;
let maxGpuFreq: any;

const findSteamPerfModule = () => {
  try {
    steamPerfSettingsClass = findModuleChild((m: any) => {
      if (typeof m !== "object") return undefined;

      for (let prop in m) {
        if (m[prop]?.prototype?.SetDisplayRefreshRateManualHz) {
          return m[prop];
        }
      }
    });

    const patch = afterPatch(
      steamPerfSettingsClass,
      "Get",
      (args: any[], ret: any) => {
        if (perfStore) {
          const { msgLimits, msgSettingsPerApp } = perfStore;

          if (
            minGpuFreq &&
            maxGpuFreq &&
            typeof minGpuFreq === "number" &&
            typeof maxGpuFreq === "number"
          ) {
            msgLimits.gpu_performance_manual_min_mhz = minGpuFreq;
            msgLimits.gpu_performance_manual_max_mhz = maxGpuFreq;
          }
          if (
            maxTdp &&
            minTdp &&
            typeof minTdp === "number" &&
            typeof maxTdp === "number"
          ) {
            msgLimits.tdp_limit_min = minTdp;
            msgLimits.tdp_limit_max = maxTdp;
          }

          logInfo(
            `msgLimits ${Object.entries(
              msgLimits
            )} | msgSettingsPerApp ${Object.entries(msgSettingsPerApp)}`
          );
        }
        return ret;
      }
    );

    perfStore = steamPerfSettingsClass && steamPerfSettingsClass.Get();

    return () => {
      patch.unpatch();
    };
  } catch (e) {
    logInfo(`failed to afterPatch ${e}`);
  }

  return () => {};
};

let unpatch: any;

export const subscribeToTdpRangeChanges = () => {
  const listener = () => {
    const state = store.getState();

    const { advancedState } = getAdvancedOptionsInfoSelector(state);

    const steamPatchEnabled = Boolean(advancedState["steamPatch"]);

    if (steamPatchEnabled) {
      if (!unpatch) {
        unpatch = findSteamPerfModule();
      }
    } else {
      if (unpatch) {
        unpatch();
        unpatch = undefined;
      }
    }

    const { min: minGpu, max: maxGpu } = getGpuFrequencyRangeSelector(state);
    minGpuFreq = minGpu;
    maxGpuFreq = maxGpu;
    const [min, max] = tdpRangeSelector(state);
    minTdp = min;
    maxTdp = max;
  };

  const unsubscribe = store.subscribe(listener);

  return () => {
    unsubscribe();
    unpatch && unpatch();
  };
};

export default subscribeToTdpRangeChanges;
