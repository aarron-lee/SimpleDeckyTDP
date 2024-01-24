import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { clone, get, merge, set } from "lodash";
import {
  DEFAULT_POLL_RATE,
  DEFAULT_START_TDP,
  EppOption,
  EppOptions,
  PowerGovernorOption,
  PowerGovernorOptions,
} from "../utils/constants";
import { RootState } from "./store";
import { GpuModes } from "../backend/utils";

type Partial<T> = {
  [P in keyof T]?: T[P];
};

type AdvancedOption = {
  name: string;
  type: string;
  defaultValue: any;
  currentValue: any;
  statePath: string;
  description?: string;
};

export interface TdpRangeState {
  minTdp: number;
  maxTdp: number;
}

export type TdpProfile = {
  tdp: number;
  cpuBoost: boolean;
  smt: boolean;
  minGpuFrequency?: number;
  maxGpuFrequency?: number;
  fixedGpuFrequency?: number;
  gpuMode: GpuModes;
  powerGovernor: PowerGovernorOption;
  epp?: EppOption;
};

export type TdpProfiles = {
  [key: string]: TdpProfile;
};

export interface PollState {
  pollEnabled: boolean;
  pollRate: number;
  disableBackgroundPolling: boolean;
}
export interface SettingsState extends TdpRangeState, PollState {
  initialLoad: boolean;
  tdpProfiles: TdpProfiles;
  previousGameId: string | undefined;
  currentGameId: string;
  gameDisplayNames: { [key: string]: string };
  enableTdpProfiles: boolean;
  minGpuFrequency?: number;
  maxGpuFrequency?: number;
  advancedOptions: AdvancedOption[];
  advanced: { [optionName: string]: any };
  steamPatchDefaultTdp: number;
  pluginVersionNum: string;
  supportsEpp: boolean;
  powerGovernorOptions: PowerGovernorOption[];
  eppOptions?: EppOption[];
}

export type InitialStateType = Partial<SettingsState>;

const initialState: SettingsState = {
  previousGameId: undefined,
  currentGameId: "default",
  gameDisplayNames: {
    default: "default",
  },
  advanced: {},
  advancedOptions: [],
  minTdp: 3,
  maxTdp: 15,
  initialLoad: true,
  enableTdpProfiles: false,
  tdpProfiles: {
    default: {
      tdp: DEFAULT_START_TDP,
      cpuBoost: true,
      smt: true,
      gpuMode: GpuModes.DEFAULT,
      minGpuFrequency: undefined,
      maxGpuFrequency: undefined,
      fixedGpuFrequency: undefined,
      powerGovernor: PowerGovernorOptions.POWER_SAVE,
      epp: EppOptions.POWER_SAVE,
    },
  },
  pollEnabled: false,
  pollRate: DEFAULT_POLL_RATE, // milliseconds
  disableBackgroundPolling: false,
  steamPatchDefaultTdp: 12,
  pluginVersionNum: "",
  supportsEpp: false,
  powerGovernorOptions: [],
  eppOptions: [],
};

export const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setReduxTdp: (state, action: PayloadAction<number>) => {
      const tdp = action.payload;
      const { currentGameId, enableTdpProfiles } = state;

      if (enableTdpProfiles) {
        set(state.tdpProfiles, `${currentGameId}.tdp`, tdp);
      } else {
        set(state.tdpProfiles, `default.tdp`, tdp);
      }
    },
    updateMinTdp: (state, action: PayloadAction<number>) => {
      state.minTdp = action.payload;
    },
    updateMaxTdp: (state, action: PayloadAction<number>) => {
      state.maxTdp = action.payload;
    },
    updateAdvancedOption: (
      state,
      action: PayloadAction<{ statePath: string; value: any }>
    ) => {
      const { statePath, value } = action.payload;

      set(state, `advanced.${statePath}`, value);
    },
    updatePowerGovernor: (state, action: PayloadAction<string>) => {
      const powerGovernor = action.payload;
      const { currentGameId, enableTdpProfiles } = state;

      if (enableTdpProfiles) {
        set(state.tdpProfiles, `${currentGameId}.powerGovernor`, powerGovernor);
      } else {
        set(state.tdpProfiles, `default.powerGovernor`, powerGovernor);
      }
    },
    updateInitialLoad: (state, action: PayloadAction<InitialStateType>) => {
      const {
        minGpuFrequency,
        maxGpuFrequency,
        advancedOptions,
        pluginVersionNum,
        supportsEpp,
        eppOptions,
        powerGovernorOptions,
        steamPatchDefaultTdp,
      } = action.payload;
      state.initialLoad = false;
      state.minTdp = action.payload.minTdp || 3;
      state.maxTdp = action.payload.maxTdp || 15;
      state.pollEnabled = action.payload.pollEnabled || false;
      state.enableTdpProfiles = action.payload.enableTdpProfiles || false;
      state.disableBackgroundPolling =
        action.payload.disableBackgroundPolling || false;
      state.pollRate = action.payload.pollRate || 5000;
      if (action.payload.tdpProfiles) {
        merge(state.tdpProfiles, action.payload.tdpProfiles);
      }
      if (typeof steamPatchDefaultTdp === "number") {
        state.steamPatchDefaultTdp = steamPatchDefaultTdp;
      }
      if (pluginVersionNum) {
        state.pluginVersionNum = pluginVersionNum;
      }
      if (advancedOptions) {
        state.advancedOptions = advancedOptions;
        advancedOptions.forEach((option) => {
          set(state, `advanced.${option.statePath}`, option.currentValue);
        });
      }
      if (powerGovernorOptions) {
        state.powerGovernorOptions = powerGovernorOptions;
      }
      if (supportsEpp) {
        state.supportsEpp = supportsEpp;
        state.eppOptions = eppOptions;
      }
      state.minGpuFrequency = minGpuFrequency;
      state.maxGpuFrequency = maxGpuFrequency;
      // set default min/max gpu frequency if not set
      if (!state.tdpProfiles.default.minGpuFrequency && minGpuFrequency) {
        state.tdpProfiles.default.minGpuFrequency = minGpuFrequency;
      }
      if (!state.tdpProfiles.default.maxGpuFrequency && maxGpuFrequency) {
        state.tdpProfiles.default.maxGpuFrequency = maxGpuFrequency;
      }
      if (
        !state.tdpProfiles.default.fixedGpuFrequency &&
        minGpuFrequency &&
        maxGpuFrequency
      ) {
        state.tdpProfiles.default.fixedGpuFrequency = Math.floor(
          (minGpuFrequency + maxGpuFrequency) / 2
        );
      }
    },
    cacheSteamPatchTdp: (
      state,
      action: PayloadAction<[id: string, tdp: number]>
    ) => {
      const [id, tdp] = action.payload;

      bootstrapTdpProfile(state, id);

      state.tdpProfiles[id].tdp = tdp;
    },
    cacheSteamPatchGpu: (
      state,
      action: PayloadAction<
        [id: string, updatedGpuMin: number, updatedGpuMax: number]
      >
    ) => {
      const [id, minGpu, maxGpu] = action.payload;

      bootstrapTdpProfile(state, id);

      if (minGpu === 0 && maxGpu === 0) {
        // default/auto gpuMode
        state.tdpProfiles[id].gpuMode = GpuModes.DEFAULT;
      } else if (minGpu === maxGpu && minGpu > 0) {
        state.tdpProfiles[id].gpuMode = GpuModes.FIXED;
        state.tdpProfiles[id].fixedGpuFrequency = minGpu;
      } else {
        state.tdpProfiles[id].gpuMode = GpuModes.RANGE;
        state.tdpProfiles[id].minGpuFrequency = minGpu;
        state.tdpProfiles[id].maxGpuFrequency = maxGpu;
      }
    },
    updateTdpProfiles: (state, action: PayloadAction<TdpProfiles>) => {
      merge(state.tdpProfiles, action.payload);
    },
    updatePollRate: (state, action: PayloadAction<number>) => {
      state.pollRate = action.payload;
    },
    setCpuBoost: (state, action: PayloadAction<boolean>) => {
      const cpuBoost = action.payload;
      const { currentGameId, enableTdpProfiles } = state;

      if (enableTdpProfiles) {
        set(state.tdpProfiles, `${currentGameId}.cpuBoost`, cpuBoost);
      } else {
        set(state.tdpProfiles, `default.cpuBoost`, cpuBoost);
      }
    },
    setGpuFrequency: (
      state,
      action: PayloadAction<{ min?: number; max?: number }>
    ) => {
      const { min, max } = action.payload;

      const { currentGameId, enableTdpProfiles } = state;

      if (min) {
        // set min value
        if (enableTdpProfiles) {
          state.tdpProfiles[currentGameId].minGpuFrequency = min;
        } else {
          state.tdpProfiles.default.minGpuFrequency = min;
        }
      }
      if (max) {
        // set max value
        if (enableTdpProfiles) {
          state.tdpProfiles[currentGameId].maxGpuFrequency = max;
        } else {
          state.tdpProfiles.default.maxGpuFrequency = max;
        }
      }
    },
    setFixedGpuFrequency: (state, action: PayloadAction<number>) => {
      const fixedFreq = action.payload;

      const { currentGameId, enableTdpProfiles } = state;

      if (enableTdpProfiles) {
        state.tdpProfiles[currentGameId].fixedGpuFrequency = fixedFreq;
      } else {
        state.tdpProfiles.default.fixedGpuFrequency = fixedFreq;
      }
    },
    setGpuMode: (state, action: PayloadAction<GpuModes>) => {
      const newGpuMode = action.payload;
      const { currentGameId, enableTdpProfiles } = state;

      if (enableTdpProfiles) {
        set(state.tdpProfiles, `${currentGameId}.gpuMode`, newGpuMode);
        // for users on older version of plugin, gpu freq might not be populated. Populate it here
        if (!state.tdpProfiles[currentGameId].minGpuFrequency) {
          state.tdpProfiles[currentGameId].minGpuFrequency =
            state.tdpProfiles.default.minGpuFrequency;
        }
        if (!state.tdpProfiles[currentGameId].maxGpuFrequency) {
          state.tdpProfiles[currentGameId].maxGpuFrequency =
            state.tdpProfiles.default.maxGpuFrequency;
        }
        if (!state.tdpProfiles[currentGameId].fixedGpuFrequency) {
          state.tdpProfiles[currentGameId].fixedGpuFrequency =
            state.tdpProfiles.default.fixedGpuFrequency;
        }
      } else {
        set(state.tdpProfiles, `default.gpuMode`, newGpuMode);
      }
    },
    setSmt: (state, action: PayloadAction<boolean>) => {
      const smt = action.payload;
      const { currentGameId, enableTdpProfiles } = state;

      if (enableTdpProfiles) {
        set(state.tdpProfiles, `${currentGameId}.smt`, smt);
      } else {
        set(state.tdpProfiles, `default.smt`, smt);
      }
    },
    setDisableBackgroundPolling: (state, action: PayloadAction<boolean>) => {
      const enabled = action.payload;
      state.disableBackgroundPolling = enabled;
    },
    setEnableTdpProfiles: (state, action: PayloadAction<boolean>) => {
      state.enableTdpProfiles = action.payload;
    },
    setSteamPatchDefaultTdp: (state, action: PayloadAction<number>) => {
      const { minTdp, maxTdp } = state;
      let defaultTdp = action.payload;
      if (defaultTdp < minTdp) defaultTdp = minTdp;
      if (defaultTdp > maxTdp) defaultTdp = maxTdp;
      state.steamPatchDefaultTdp = defaultTdp;
    },
    setPolling: (state, action: PayloadAction<boolean>) => {
      state.pollEnabled = action.payload;
    },
    setCurrentGameInfo: (
      state,
      action: PayloadAction<{ id: string; displayName: string }>
    ) => {
      const { id, displayName } = action.payload;
      state.previousGameId = state.currentGameId;
      state.currentGameId = id;
      state.gameDisplayNames[id] = displayName;
      bootstrapTdpProfile(state, id);
    },
  },
});

function bootstrapTdpProfile(state: any, id: string) {
  // bootstrap initial TDP profile if it doesn't exist
  if (!state.tdpProfiles[id]) {
    const defaultTdpProfile = clone(state.tdpProfiles.default);
    state.tdpProfiles[id] = defaultTdpProfile;
  }
}

export const allStateSelector = (state: any) => state;
export const initialLoadSelector = (state: any) => state.settings.initialLoad;

// tdp range selectors
export const minTdpSelector = (state: any) => state.settings.minTdp;
export const maxTdpSelector = (state: any) => state.settings.maxTdp;
export const tdpRangeSelector = (state: any) => [
  state.settings.minTdp,
  state.settings.maxTdp,
];

// tdp profile selectors
export const defaultTdpSelector = (state: any) =>
  state.settings.tdpProfiles.default.tdp;

// poll rate selectors
export const pollRateSelector = (state: any) => state.settings.pollRate;
export const pollEnabledSelector = (state: any) => state.settings.pollEnabled;
export const disableBackgroundPollingSelector = (state: RootState) =>
  state.settings.disableBackgroundPolling;

// enableTdpProfiles selectors
export const tdpProfilesEnabled = (state: any) =>
  state.settings.enableTdpProfiles;

export const activeGameIdSelector = (state: RootState) => {
  const { settings } = state;
  const activeGameId = state.settings.currentGameId;

  if (settings.enableTdpProfiles) {
    return activeGameId;
  } else {
    return "default";
  }
};

export const activeTdpProfileSelector = (state: RootState) => {
  const { settings } = state;
  const activeGameId = state.settings.currentGameId;

  if (settings.enableTdpProfiles) {
    const tdpProfile = settings.tdpProfiles[activeGameId];
    return { activeGameId, tdpProfile };
  } else {
    // tdp from default profile
    return {
      activeGameId: "default",
      tdpProfile: settings.tdpProfiles.default,
    };
  }
};

export const getCurrentCpuBoostSelector = (state: RootState) => {
  const { tdpProfile: activeTdpProfile } = activeTdpProfileSelector(state);

  return Boolean(activeTdpProfile.cpuBoost);
};

export const getCurrentSmtSelector = (state: RootState) => {
  const { tdpProfile: activeTdpProfile } = activeTdpProfileSelector(state);

  return Boolean(activeTdpProfile.smt);
};

export const getCurrentTdpInfoSelector = (state: RootState) => {
  const { settings } = state;
  const { activeGameId, tdpProfile: activeTdpProfile } =
    activeTdpProfileSelector(state);
  const tdp = activeTdpProfile.tdp;

  if (settings.enableTdpProfiles) {
    // tdp from game tdp profile
    const displayName = get(settings, `gameDisplayNames.${activeGameId}`, "");
    return { id: activeGameId, tdp, displayName };
  } else {
    // tdp from default profile
    return { id: "default", tdp, displayName: "Default" };
  }
};

// GPU selectors

export const getCurrentGpuFrequencySelector = (state: RootState) => {
  const activeGameId = activeGameIdSelector(state);

  return {
    currentMin: state.settings.tdpProfiles[activeGameId].minGpuFrequency,
    currentMax: state.settings.tdpProfiles[activeGameId].maxGpuFrequency,
  };
};

export const getCurrentFixedGpuFrequencySelector = (state: RootState) => {
  const activeGameId = activeGameIdSelector(state);

  return state.settings.tdpProfiles[activeGameId].fixedGpuFrequency;
};

export const getGpuFrequencyRangeSelector = (state: RootState) => {
  return {
    min: state.settings.minGpuFrequency,
    max: state.settings.maxGpuFrequency,
  };
};

export const getGpuModeSelector = (state: RootState) => {
  const {
    activeGameId,
    tdpProfile: { gpuMode },
  } = activeTdpProfileSelector(state);

  return { activeGameId, gpuMode };
};

export const getAdvancedOptionsInfoSelector = (state: RootState) => {
  const { advanced, advancedOptions } = state.settings;

  return { advancedState: advanced, advancedOptions };
};

export const getInstalledVersionNumSelector = (state: RootState) => {
  const { pluginVersionNum } = state.settings;

  return pluginVersionNum;
};

export const getSteamPatchDefaultTdpSelector = (state: RootState) => {
  const { steamPatchDefaultTdp } = state.settings;

  return steamPatchDefaultTdp;
};

export const getCachedSteamPatchProfile =
  (gameId: string) => (state: RootState) => {
    const { tdpProfiles } = state.settings;

    return tdpProfiles[gameId];
  };

export const supportsEppSelector = (state: RootState) =>
  state.settings.supportsEpp;

export const getPowerControlInfoSelector = (state: RootState) => {
  const {
    tdpProfile: { epp, powerGovernor },
  } = activeTdpProfileSelector(state);
  const {
    settings: { powerGovernorOptions, eppOptions },
  } = state;
  const supportsEpp = supportsEppSelector(state);

  return { supportsEpp, epp, powerGovernor, powerGovernorOptions, eppOptions };
};

// Action creators are generated for each case reducer function
export const {
  updateMinTdp,
  updateMaxTdp,
  updateInitialLoad,
  updateTdpProfiles,
  updatePollRate,
  setPolling,
  setCurrentGameInfo,
  setEnableTdpProfiles,
  setCpuBoost,
  setSmt,
  setGpuMode,
  setGpuFrequency,
  setFixedGpuFrequency,
  setDisableBackgroundPolling,
  updateAdvancedOption,
  setSteamPatchDefaultTdp,
  cacheSteamPatchTdp,
  cacheSteamPatchGpu,
  updatePowerGovernor,
  setReduxTdp,
} = settingsSlice.actions;

export default settingsSlice.reducer;
