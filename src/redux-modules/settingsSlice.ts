import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { clone, get, merge, set } from "lodash";
import {
  DEFAULT_POLL_RATE,
  DEFAULT_POWER_CONTROLS,
  DEFAULT_START_TDP,
  EppOption,
  MIN_TDP_RANGE,
  PowerGovernorOption,
} from "../utils/constants";
import { RootState } from "./store";
import { AdvancedOptionsEnum, GpuModes } from "../backend/utils";

type Partial<T> = {
  [P in keyof T]?: T[P];
};

export type AdvancedOption = {
  name: string;
  type: string;
  defaultValue: any;
  currentValue: any;
  statePath: string;
  description?: string;
  disabled?: { [k: string]: any };
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
  powerControls: {
    [key: string]: {
      powerGovernor?: PowerGovernorOption;
      epp?: EppOption;
    };
  };
};

export type TdpProfiles = {
  [key: string]: TdpProfile;
};

export interface PollState {
  pollRate: number;
}

interface GpuState {
  minGpuFrequency?: number;
  maxGpuFrequency?: number;
}

export interface SettingsState extends TdpRangeState, PollState, GpuState {
  initialLoad: boolean;
  tdpProfiles: TdpProfiles;
  previousGameId: string | undefined;
  currentGameId: string;
  gameDisplayNames: { [key: string]: string };
  enableTdpProfiles: boolean;
  advancedOptions: AdvancedOption[];
  advanced: { [optionName: string]: any };
  steamPatchDefaultTdp: number;
  pluginVersionNum: string;
  supportsCustomAcPowerManagement?: boolean;
  cpuVendor?: string;
  isAcPower?: boolean;
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
  minTdp: MIN_TDP_RANGE,
  maxTdp: 15,
  initialLoad: true,
  enableTdpProfiles: false,
  tdpProfiles: {
    default: {
      tdp: DEFAULT_START_TDP,
      cpuBoost: true,
      smt: true,
      gpuMode: GpuModes.BALANCE,
      minGpuFrequency: undefined,
      maxGpuFrequency: undefined,
      fixedGpuFrequency: undefined,
      powerControls: DEFAULT_POWER_CONTROLS,
    },
  },
  pollRate: DEFAULT_POLL_RATE, // milliseconds
  steamPatchDefaultTdp: 12,
  pluginVersionNum: "",
};

export const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setAcPower(state, action: PayloadAction<number>) {
      const event = action.payload;
      if (event === 2) {
        state.isAcPower = true;
      }
      if (event === 1) {
        state.isAcPower = false;
      }
    },
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

      handleAdvancedOptionsEdgeCases(state, statePath, value);
    },
    updatePowerGovernor: (
      state,
      action: PayloadAction<{ powerGovernor: string; scalingDriver: string }>
    ) => {
      const { powerGovernor, scalingDriver } = action.payload;
      const { currentGameId, enableTdpProfiles } = state;

      if (enableTdpProfiles) {
        set(
          state.tdpProfiles,
          `${currentGameId}.powerControls.${scalingDriver}.powerGovernor`,
          powerGovernor
        );
      } else {
        set(
          state.tdpProfiles,
          `default.powerControls.${scalingDriver}.powerGovernor`,
          powerGovernor
        );
      }
    },
    updateEpp: (
      state,
      action: PayloadAction<{ epp: string; scalingDriver: string }>
    ) => {
      const { epp, scalingDriver } = action.payload;
      const { currentGameId, enableTdpProfiles } = state;

      if (enableTdpProfiles) {
        set(
          state.tdpProfiles,
          `${currentGameId}.powerControls.${scalingDriver}.epp`,
          epp
        );
      } else {
        set(
          state.tdpProfiles,
          `default.powerControls.${scalingDriver}.epp`,
          epp
        );
      }
    },
    updateInitialLoad: (state, action: PayloadAction<InitialStateType>) => {
      const {
        minGpuFrequency,
        maxGpuFrequency,
        advancedOptions,
        pluginVersionNum,
        steamPatchDefaultTdp,
        supportsCustomAcPowerManagement,
        cpuVendor,
      } = action.payload;
      state.initialLoad = false;
      state.cpuVendor = cpuVendor;
      state.supportsCustomAcPowerManagement = supportsCustomAcPowerManagement;
      state.minTdp = action.payload.minTdp || MIN_TDP_RANGE;
      state.maxTdp = action.payload.maxTdp || 15;
      state.enableTdpProfiles = action.payload.enableTdpProfiles || false;
      state.pollRate = action.payload.pollRate || DEFAULT_POLL_RATE;
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
    setSteamPatchDefaultTdp: (state, action: PayloadAction<number>) => {
      const { minTdp, maxTdp } = state;
      let defaultTdp = action.payload;
      if (defaultTdp < minTdp) defaultTdp = minTdp;
      if (defaultTdp > maxTdp) defaultTdp = maxTdp;
      state.steamPatchDefaultTdp = defaultTdp;
    },
    setCurrentGameInfo: (
      state,
      action: PayloadAction<{ id: string; displayName: string }>
    ) => {
      const { isAcPower, advanced } = state;
      const { id, displayName } = action.payload;
      state.previousGameId = state.currentGameId;
      if (isAcPower && advanced[AdvancedOptionsEnum.AC_POWER_PROFILES]) {
        const newId = `${id}-ac-power`;
        state.currentGameId = newId;
        state.gameDisplayNames[newId] = `(AC) ${displayName}`;

        bootstrapTdpProfile(state, id, newId);
      } else {
        state.currentGameId = id;
        state.gameDisplayNames[id] = displayName;
        bootstrapTdpProfile(state, id);
      }
    },
  },
});

function bootstrapTdpProfile(state: any, id: string, acPowerId?: string) {
  if (acPowerId && !state.tdpProfiles[acPowerId]) {
    const tdpProfile = getDefaultAcProfile(state, id);
    state.tdpProfiles[acPowerId] = tdpProfile;
    return;
  }

  // bootstrap initial TDP profile if it doesn't exist
  if (!state.tdpProfiles[id]) {
    const defaultTdpProfile = clone(state.tdpProfiles.default);
    state.tdpProfiles[id] = defaultTdpProfile;
  }
}

function getDefaultAcProfile(state: any, id: string) {
  if (state.tdpProfiles[id]) {
    // return already existing non-ac profile for game id
    return clone(state.tdpProfiles[id]);
  } else if (state.tdpProfiles[`default-ac-power`]) {
    // return default ac-power profile
    return clone(state.tdpProfiles[`default-ac-power`]);
  } else {
    // return regular default profile
    return clone(state.tdpProfiles.default);
  }
}

export const allStateSelector = (state: any) => state;
export const initialLoadSelector = (state: any) => state.settings.initialLoad;

export const tdpControlEnabledSelector = (state: any) => {
  const { advancedState } = getAdvancedOptionsInfoSelector(state);

  return Boolean(advancedState[AdvancedOptionsEnum.ENABLE_TDP_CONTROL]);
};

export const gpuControlEnabledSelector = (state: any) => {
  const { advancedState } = getAdvancedOptionsInfoSelector(state);

  return Boolean(advancedState[AdvancedOptionsEnum.ENABLE_GPU_CONTROL]);
};

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
export const pollEnabledSelector = (state: any) => {
  const { advancedState } = getAdvancedOptionsInfoSelector(state);

  const pollingEnabled = Boolean(
    advancedState[AdvancedOptionsEnum.ENABLE_BACKGROUND_POLLING]
  );

  return pollingEnabled;
};

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

export const getSteamPatchEnabledSelector = (state: RootState) => {
  const { advancedState } = getAdvancedOptionsInfoSelector(state);
  const steamPatchEnabled = Boolean(
    advancedState[AdvancedOptionsEnum.STEAM_PATCH]
  );
  return steamPatchEnabled;
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

export const getPowerControlInfoSelector =
  (scalingDriver?: string) => (state: RootState) => {
    const {
      tdpProfile: { powerControls },
    } = activeTdpProfileSelector(state);
    if (!scalingDriver) {
      return {};
    }
    const { epp, powerGovernor } = powerControls[scalingDriver];

    return { epp, powerGovernor };
  };

export const cpuVendorSelector = (state: RootState) => state.settings.cpuVendor;

export const acPowerSelector = (state: RootState) => state.settings.isAcPower;

export const supportsCustomAcPowerSelector = (state: RootState) =>
  state.settings.supportsCustomAcPowerManagement;

function handleAdvancedOptionsEdgeCases(
  state: any,
  statePath: string,
  value: boolean
) {
  if (statePath === AdvancedOptionsEnum.USE_PLATFORM_PROFILE && value) {
    set(
      state,
      `advanced.${AdvancedOptionsEnum.ENABLE_BACKGROUND_POLLING}`,
      false
    );
  }
  if (statePath === AdvancedOptionsEnum.ENABLE_BACKGROUND_POLLING && value) {
    if (typeof state?.advanced?.platformProfile === "boolean") {
      set(state, `advanced.${AdvancedOptionsEnum.USE_PLATFORM_PROFILE}`, false);
    }
  }
  if (statePath === AdvancedOptionsEnum.AC_POWER_PROFILES) {
    set(state, `advanced.${AdvancedOptionsEnum.STEAM_PATCH}`, false);
  }
  if (statePath === AdvancedOptionsEnum.STEAM_PATCH) {
    set(state, `advanced.${AdvancedOptionsEnum.AC_POWER_PROFILES}`, false);
  }
  if (
    statePath === AdvancedOptionsEnum.FORCE_DISABLE_TDP_ON_RESUME &&
    value === true
  ) {
    set(state, `advanced.${AdvancedOptionsEnum.MAX_TDP_ON_RESUME}`, false);
  }

  if (statePath === AdvancedOptionsEnum.MAX_TDP_ON_RESUME && value === true) {
    set(
      state,
      `advanced.${AdvancedOptionsEnum.FORCE_DISABLE_TDP_ON_RESUME}`,
      false
    );
  }
}

// Action creators are generated for each case reducer function
export const {
  updateMinTdp,
  updateMaxTdp,
  updateInitialLoad,
  updateTdpProfiles,
  updatePollRate,
  setCurrentGameInfo,
  setEnableTdpProfiles,
  setCpuBoost,
  setSmt,
  setGpuMode,
  setGpuFrequency,
  setFixedGpuFrequency,
  updateAdvancedOption,
  setSteamPatchDefaultTdp,
  updatePowerGovernor,
  setReduxTdp,
  updateEpp,
  setAcPower,
} = settingsSlice.actions;

export default settingsSlice.reducer;
