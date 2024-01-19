import { afterPatch, findModuleChild } from "decky-frontend-lib";
import {
  AdvancedOptionsEnum,
  GpuModes,
  logInfo,
  setSteamPatchGPU,
  setSteamPatchTDP,
} from "./backend/utils";
import { RootState, store } from "./redux-modules/store";
import {
  cacheSteamPatchGpu,
  cacheSteamPatchTdp,
  getAdvancedOptionsInfoSelector,
  getGpuFrequencyRangeSelector,
  getSteamPatchDefaultTdpSelector,
  tdpRangeSelector,
} from "./redux-modules/settingsSlice";
import { throttle } from "lodash";
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
          manageTdp();
          manageGpu();
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

const setGpu = (updatedGpuMin: number, updatedGpuMax: number) => {
  setSteamPatchGPU(updatedGpuMin, updatedGpuMax);
  const { id } = extractCurrentGameInfo();

  store.dispatch(cacheSteamPatchGpu([id, updatedGpuMin, updatedGpuMax]));
};

let throttledSetGPU = throttle(setGpu, 100);

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
        throttledSetGPU(updatedGpuFreq, maxGpuFreq);
      }
    }
    // default GPU range
    else {
      // 0 resets gpu to auto
      throttledSetGPU(0, 0);
    }
  }
}

const setTdp = (updatedTdp: number) => {
  setSteamPatchTDP(updatedTdp);
  const { id } = extractCurrentGameInfo();

  // cache most recently used TDP for a game
  store.dispatch(cacheSteamPatchTdp([id, updatedTdp]));
};

const throttledSetTdp = throttle(setTdp, 100);

function manageTdp() {
  const { msgLimits, msgSettingsPerApp } = perfStore;

  if (
    maxTdp &&
    minTdp &&
    typeof minTdp === "number" &&
    typeof maxTdp === "number" &&
    msgLimits?.tdp_limit_min &&
    msgLimits?.tdp_limit_max
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
        throttledSetTdp(updatedTDP);
      }
    } else {
      // default TDP
      throttledSetTdp(defaultTdp || 12);
    }
  }
}

let activeGameChangesGpuTimeoutId: any;

export const handleActiveGameChanges = (state: RootState, id: string) => {
  const profile = state.settings?.tdpProfiles[id];

  if (profile && profile.tdp) {
    setSteamPatchTDP(profile.tdp);
  }
  if (
    profile &&
    profile.gpuMode &&
    profile.minGpuFrequency &&
    profile.maxGpuFrequency
  ) {
    const { gpuMode, minGpuFrequency, maxGpuFrequency, fixedGpuFrequency } =
      profile;

    if (activeGameChangesGpuTimeoutId) {
      clearTimeout(activeGameChangesGpuTimeoutId);
    }
    // workaround for GPU settings to stick/persist after reboot
    activeGameChangesGpuTimeoutId = setTimeout(() => {
      if (gpuMode === GpuModes.DEFAULT) {
        setSteamPatchGPU(0, 0);
      } else if (gpuMode === GpuModes.FIXED && fixedGpuFrequency) {
        setSteamPatchGPU(fixedGpuFrequency, fixedGpuFrequency);
      } else {
        setSteamPatchGPU(minGpuFrequency, maxGpuFrequency);
      }
    }, 8000);
  }
};

let unpatch: any;
let reduxChangeTimeoutId: any;

export const subscribeToTdpRangeChanges = () => {
  try {
    const listener = () => {
      const state = store.getState();
      const { id } = extractCurrentGameInfo();

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

      if (reduxChangeTimeoutId) {
        clearTimeout(reduxChangeTimeoutId);
      }

      if (steamPatchEnabled) {
        if (!unpatch) {
          unpatch = findSteamPerfModule();
        }
        // get on every redux state change, which should update TDP values, etc
        reduxChangeTimeoutId = window.setTimeout(() => {
          handleActiveGameChanges(state, id);
        }, 500);
      } else {
        if (unpatch) {
          unpatch();
          unpatch = undefined;
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
