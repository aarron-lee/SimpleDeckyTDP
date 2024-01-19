import {
  afterPatch,
  findModuleChild,
  LifetimeNotification,
} from "decky-frontend-lib";
import {
  AdvancedOptionsEnum,
  logInfo,
  setSteamPatchGPU,
  setSteamPatchTDP,
} from "./backend/utils";
import { store } from "./redux-modules/store";
import {
  getAdvancedOptionsInfoSelector,
  getGpuFrequencyRangeSelector,
  getSteamPatchDefaultTdpSelector,
  setCurrentGameInfo,
  tdpRangeSelector,
} from "./redux-modules/settingsSlice";
import { debounce } from "lodash";
import { extractCurrentGameInfo } from "./utils/constants";

enum GpuPerformanceLevel {
  ENABLED = 2,
  DISABLED = 1,
}

let steamPerfSettingsClass: any;
export const getSteamPerfSettings = () =>
  steamPerfSettingsClass && steamPerfSettingsClass.Get();
let perfStore: any;

let minTdp: any;
let maxTdp: any;
let minGpuFreq: any;
let maxGpuFreq: any;
let defaultTdp: any;

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
          manageGpu();
          manageTdp();
        }
        return ret;
      }
    );

    perfStore = getSteamPerfSettings();

    return () => {
      patch.unpatch();
    };
  } catch (e) {
    logInfo(`failed to afterPatch ${e}`);
  }

  return () => {};
};

let debouncedSetGPU = debounce(setSteamPatchGPU, 100);

function manageGpu() {
  const { msgLimits, msgSettingsPerApp } = perfStore;

  if (
    minGpuFreq &&
    maxGpuFreq &&
    typeof minGpuFreq === "number" &&
    typeof maxGpuFreq === "number"
  ) {
    // set frequency limits
    msgLimits.gpu_performance_manual_min_mhz = minGpuFreq;
    msgLimits.gpu_performance_manual_max_mhz = maxGpuFreq;

    // setGpuFrequency
    if (
      msgSettingsPerApp &&
      msgSettingsPerApp?.gpu_performance_level === GpuPerformanceLevel.ENABLED
    ) {
      // per game GPU override
      const updatedGpuFreq = msgSettingsPerApp?.gpu_performance_manual_mhz;

      if (
        updatedGpuFreq &&
        typeof updatedGpuFreq === "number" &&
        updatedGpuFreq >= minGpuFreq &&
        updatedGpuFreq <= maxGpuFreq
      ) {
        debouncedSetGPU(updatedGpuFreq, updatedGpuFreq);
      }
    }
    // default GPU range
    else {
      // 0 resets gpu to auto
      debouncedSetGPU(0, 0);
    }
  }
}

const debouncedSetTdp = debounce(setSteamPatchTDP, 100);

function manageTdp() {
  const { msgLimits, msgSettingsPerApp } = perfStore;

  if (
    maxTdp &&
    minTdp &&
    typeof minTdp === "number" &&
    typeof maxTdp === "number"
  ) {
    // set TDP Range
    msgLimits.tdp_limit_min = minTdp;
    msgLimits.tdp_limit_max = maxTdp;

    // set TDP
    if (msgSettingsPerApp && Boolean(msgSettingsPerApp?.is_tdp_limit_enabled)) {
      // per-game TDP
      const updatedTDP = msgSettingsPerApp?.tdp_limit;
      if (
        updatedTDP &&
        typeof updatedTDP === "number" &&
        updatedTDP >= minTdp &&
        updatedTDP <= maxTdp
      ) {
        // set TDP
        debouncedSetTdp(updatedTDP);
      }
    } else {
      // default TDP
      debouncedSetTdp(defaultTdp || 12);
    }
  }
}

let unregisterAppLifetimeNotifications: any;

const registerForAppLifetimeNotifications = () => {
  const { unregister } =
    window.SteamClient.GameSessions.RegisterForAppLifetimeNotifications(
      (data: LifetimeNotification) => {
        const { bRunning: running, unAppID } = data;
        const results = extractCurrentGameInfo();

        if (running) {
          store.dispatch(setCurrentGameInfo({ ...results, id: `${unAppID}` }));
        }
      }
    );
  unregisterAppLifetimeNotifications = unregister;
};

let unpatch: any;

export const subscribeToTdpRangeChanges = () => {
  try {
    const listener = () => {
      const state = store.getState();

      const { min: minGpu, max: maxGpu } = getGpuFrequencyRangeSelector(state);
      defaultTdp = getSteamPatchDefaultTdpSelector(state);
      minGpuFreq = minGpu;
      maxGpuFreq = maxGpu;
      const [min, max] = tdpRangeSelector(state);
      minTdp = min;
      maxTdp = max;

      const { advancedState } = getAdvancedOptionsInfoSelector(state);

      const steamPatchEnabled = Boolean(
        advancedState[AdvancedOptionsEnum.STEAM_PATCH]
      );

      if (steamPatchEnabled) {
        if (!unpatch) {
          unpatch = findSteamPerfModule();
        }
        if (!unregisterAppLifetimeNotifications) {
          registerForAppLifetimeNotifications();
        }
        // get on every redux state change, which should update TDP values, etc
        getSteamPerfSettings();
      } else {
        if (unpatch) {
          unpatch();
          unpatch = undefined;
        }
        if (
          unregisterAppLifetimeNotifications &&
          typeof unregisterAppLifetimeNotifications === "function"
        ) {
          unregisterAppLifetimeNotifications();
          unregisterAppLifetimeNotifications = undefined;
        }
      }
    };

    const unsubscribe = store.subscribe(listener);

    return () => {
      unsubscribe();
      unpatch && unpatch();
      unpatch = undefined;
    };
  } catch (e) {
    logInfo(e);
  }
  return () => {
    unpatch && unpatch();
    unpatch = undefined;
  };
};

export default subscribeToTdpRangeChanges;
