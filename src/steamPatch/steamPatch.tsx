import { afterPatch, findModuleChild } from "@decky/ui";
import { logInfo } from "../backend/utils";
import { store } from "../redux-modules/store";
import {
  getGpuFrequencyRangeSelector,
  getSteamPatchDefaultTdpSelector,
  getSteamPatchEnabledSelector,
  tdpRangeSelector,
} from "../redux-modules/settingsSlice";
import { setTdp, setGpu } from "./utils";
import { noopAction } from "../redux-modules/extraActions";

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
let globalSteamPatchEnabled: boolean | undefined;

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
          if (globalSteamPatchEnabled) {
            // decky's unpatch doesn't work consistently, better to manually check patch status
            try {
              manageGpu();
              manageTdp();
            } catch (e) {
              logInfo({ info: e });
            }
          }
        }
        return ret;
      }
    );

    perfStore = getSteamPerfSettings();

    return () => {
      patch.unpatch();
    };
  } catch (e) {
    logInfo({ info: `failed to afterPatch ${e}` });
  }

  return () => {};
};

function manageGpu() {
  const { msgLimits, msgSettingsPerApp } = perfStore;

  if (
    msgLimits &&
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
        setGpu(updatedGpuFreq, updatedGpuFreq);
      }
    }
    // default GPU range
    else {
      // 0 resets gpu to auto
      setGpu(0, 0);
    }
  }
}

function manageTdp() {
  const { msgLimits, msgSettingsPerApp } = perfStore;

  if (
    msgLimits &&
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
        setTdp(updatedTDP);
      }
    } else {
      // default TDP
      setTdp(defaultTdp || 12);
    }
  }
}

let unpatch: any;

export const subscribeToTdpRangeChanges = () => {
  try {
    const listener = () => {
      let updateSteamQAM = false;

      const state = store.getState();

      const { min: updatedMinGpu, max: updatedMaxGpu } =
        getGpuFrequencyRangeSelector(state);
      defaultTdp = getSteamPatchDefaultTdpSelector(state);

      if (updatedMinGpu !== minGpuFreq || updatedMaxGpu !== maxGpuFreq) {
        updateSteamQAM = true;
      }

      minGpuFreq = updatedMinGpu;
      maxGpuFreq = updatedMaxGpu;

      const [updatedMinTdp, updatedMaxTdp] = tdpRangeSelector(state);

      if (updatedMinTdp !== minTdp || updatedMaxTdp !== maxTdp) {
        updateSteamQAM = true;
      }

      minTdp = updatedMinTdp;
      maxTdp = updatedMaxTdp;

      const steamPatchEnabled = getSteamPatchEnabledSelector(state);

      globalSteamPatchEnabled = steamPatchEnabled;

      if (steamPatchEnabled) {
        if (updateSteamQAM) {
          getSteamPerfSettings();
        }
      } else {
        // reset perf settings after unpatch
        // globalSteamPatchEnabled bool will stop steam patch from working
        getSteamPerfSettings();
      }
    };

    const unsubscribe = store.subscribe(listener);
    unpatch = findSteamPerfModule();

    // kickstart listener
    store.dispatch(noopAction());

    return () => {
      unsubscribe();
      unpatch && unpatch();
      unpatch = undefined;
    };
  } catch (e) {
    logInfo({ info: e });
  }
  return () => {
    unpatch && unpatch();
    unpatch = undefined;
  };
};

export default subscribeToTdpRangeChanges;
