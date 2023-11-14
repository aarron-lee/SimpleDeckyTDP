import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { merge } from 'lodash';

type Partial<T> = {
  [P in keyof T]?: T[P];
};

export interface TdpRangeState {
  minTdp: number;
  maxTdp: number;
}

export type TdpProfile = {
  tdp: number;
  [key: string]: number;
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
  currentGameId: string | undefined;
  gameDisplayNames: { [key: string]: string };
}

export type InitialStateType = Partial<SettingsState>;

const initialState: SettingsState = {
  currentGameId: 'default',
  gameDisplayNames: {},
  minTdp: 3,
  maxTdp: 15,
  initialLoad: true,
  tdpProfiles: {
    default: {
      tdp: 12,
    },
  },
  pollEnabled: false,
  pollRate: 5000, // milliseconds
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateMinTdp: (state, action: PayloadAction<number>) => {
      state.minTdp = action.payload;
    },
    updateMaxTdp: (state, action: PayloadAction<number>) => {
      state.maxTdp = action.payload;
    },
    updateInitialLoad: (
      state,
      action: PayloadAction<InitialStateType>
    ) => {
      state.initialLoad = false;
      state.minTdp = action.payload.minTdp || 3;
      state.maxTdp = action.payload.maxTdp || 15;
      state.pollEnabled = action.payload.pollEnabled || false;
      state.pollRate = action.payload.pollRate || 5000;
      if (action.payload.tdpProfiles) {
        merge(state.tdpProfiles, action.payload.tdpProfiles);
      }
      if (action.payload.gameDisplayNames) {
        merge(
          state.gameDisplayNames,
          action.payload.gameDisplayNames
        );
      }
    },
    updateTdpProfiles: (
      state,
      action: PayloadAction<TdpProfiles>
    ) => {
      merge(state.tdpProfiles, action.payload);
    },
    updatePollRate: (state, action: PayloadAction<number>) => {
      state.pollRate = action.payload;
    },
    setPolling: (state, action: PayloadAction<boolean>) => {
      state.pollEnabled = action.payload;
    },
    setCurrentGameInfo: (
      state,
      action: PayloadAction<{ id: string; displayName: string }>
    ) => {
      const { id, displayName } = action.payload;
      state.currentGameId = id;
      state.gameDisplayNames[id] = displayName;
    },
  },
});

export const allStateSelector = (state: any) => state;
export const initialLoadSelector = (state: any) =>
  state.settings.initialLoad;

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
export const pollRateSelector = (state: any) =>
  state.settings.pollRate;
export const pollEnabledSelector = (state: any) =>
  state.settings.pollEnabled;

// currentGameId selector
export const currentGameIdSelector = (state: any) =>
  state.settings.currentGameId;
export const currentGameDisplayNameSelector = (state: any) => {
  const { currentGameId } = state.settings;

  return state.settings.gameDisplayNames[currentGameId];
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
} = settingsSlice.actions;

export default settingsSlice.reducer;
