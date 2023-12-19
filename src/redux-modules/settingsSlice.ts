import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { get, merge, set } from "lodash";
import {
  DEFAULT_POLL_RATE,
  DEFAULT_START_TDP,
  extractCurrentGameId,
} from "../utils/constants";
import { RootState } from "./store";
import { GpuModes } from "../backend/utils";

type Partial<T> = {
  [P in keyof T]?: T[P];
};

export interface TdpRangeState {
  minTdp: number;
  maxTdp: number;
}

export type TdpProfile = {
  tdp: number;
  cpuBoost: boolean;
  smt: boolean;
  minGpuFrequency: number;
  maxGpuFrequency: number;
  fixedGpuFrequency: number;
  gpuMode: GpuModes;
};

export type TdpProfiles = {
  [key: string]: TdpProfile;
};

export interface PollState {
  pollEnabled: boolean;
  pollRate: number;
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
}

export type InitialStateType = Partial<SettingsState>;

const initialState: SettingsState = {
  previousGameId: undefined,
  currentGameId: "default",
  gameDisplayNames: {
    default: "default",
  },
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
      minGpuFrequency: 1200,
      maxGpuFrequency: 1200,
      fixedGpuFrequency: 1200,
    },
  },
  pollEnabled: false,
  pollRate: DEFAULT_POLL_RATE, // milliseconds
};

export const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    updateMinTdp: (state, action: PayloadAction<number>) => {
      state.minTdp = action.payload;
    },
    updateMaxTdp: (state, action: PayloadAction<number>) => {
      state.maxTdp = action.payload;
    },
    updateInitialLoad: (state, action: PayloadAction<InitialStateType>) => {
      const { minGpuFrequency, maxGpuFrequency } = action.payload;
      state.initialLoad = false;
      state.minTdp = action.payload.minTdp || 3;
      state.maxTdp = action.payload.maxTdp || 15;
      state.pollEnabled = action.payload.pollEnabled || false;
      state.enableTdpProfiles = action.payload.enableTdpProfiles || false;
      state.pollRate = action.payload.pollRate || 5000;
      if (action.payload.tdpProfiles) {
        merge(state.tdpProfiles, action.payload.tdpProfiles);
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
      state.currentGameId = extractCurrentGameId();
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
    setEnableTdpProfiles: (state, action: PayloadAction<boolean>) => {
      state.enableTdpProfiles = action.payload;
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
      // bootstrap initial TDP profile if it doesn't exist
      if (!state.tdpProfiles[id]) {
        const defaultTdpProfile = state.tdpProfiles.default;
        state.tdpProfiles[id] = defaultTdpProfile;
      }
    },
  },
});

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
} = settingsSlice.actions;

export default settingsSlice.reducer;
