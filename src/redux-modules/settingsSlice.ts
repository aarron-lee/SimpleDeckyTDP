import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { get, merge } from "lodash";
import {
  DEFAULT_POLL_RATE,
  DEFAULT_START_TDP,
  extractCurrentGameId,
} from "../utils/constants";
import { RootState } from "./store";

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
  previousGameId: string | undefined;
  currentGameId: string | undefined;
  gameDisplayNames: { [key: string]: string };
  enableTdpProfiles: boolean;
}

export type InitialStateType = Partial<SettingsState>;

const initialState: SettingsState = {
  previousGameId: undefined,
  currentGameId: undefined,
  gameDisplayNames: {},
  minTdp: 3,
  maxTdp: 15,
  initialLoad: true,
  enableTdpProfiles: false,
  tdpProfiles: {
    default: {
      tdp: DEFAULT_START_TDP,
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
      state.initialLoad = false;
      state.minTdp = action.payload.minTdp || 3;
      state.maxTdp = action.payload.maxTdp || 15;
      state.pollEnabled = action.payload.pollEnabled || false;
      state.enableTdpProfiles = action.payload.enableTdpProfiles || false;
      state.pollRate = action.payload.pollRate || 5000;
      if (action.payload.tdpProfiles) {
        merge(state.tdpProfiles, action.payload.tdpProfiles);
      }
      state.currentGameId = extractCurrentGameId();
    },
    updateTdpProfiles: (state, action: PayloadAction<TdpProfiles>) => {
      merge(state.tdpProfiles, action.payload);
    },
    updatePollRate: (state, action: PayloadAction<number>) => {
      state.pollRate = action.payload;
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

// currentGameId selector
export const currentGameIdSelector = (state: any) =>
  state.settings.currentGameId;
export const currentGameDisplayNameSelector = (state: any) => {
  const { currentGameId } = state.settings;

  return state.settings.gameDisplayNames[currentGameId];
};

// enableTdpProfiles selectors
export const tdpProfilesEnabled = (state: any) =>
  state.settings.enableTdpProfiles;
export const getCurrentTdpInfoSelector = (state: RootState) => {
  const { settings } = state;
  const defaultTdp = get(settings, "tdpProfiles.default.tdp");
  const currentGameId = extractCurrentGameId();

  if (settings.enableTdpProfiles) {
    // tdp from game tdp profile
    const gameTdp = get(
      settings,
      `tdpProfiles.${currentGameId}.tdp`,
      // default if it doesn't exist yet
      defaultTdp
    );
    const displayName = get(settings, `gameDisplayNames.${currentGameId}`, "");
    return { id: currentGameId, tdp: gameTdp, displayName };
  } else {
    // tdp from default profile
    return { id: "default", tdp: defaultTdp, displayName: "Default" };
  }
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
} = settingsSlice.actions;

export default settingsSlice.reducer;
