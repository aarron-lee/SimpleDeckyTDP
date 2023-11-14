import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { merge } from "lodash";

export interface TdpRangeState {
  minTdp: number,
  maxTdp: number
}

export type TdpProfile = {
 tdp: number,
 [key: string]: number
}

export type TdpProfiles = {
  default: TdpProfile,
  [key:string]: TdpProfile
}

export interface PollState {
  poll: {
    rate: number,
    enabled: boolean
  }
}

export interface SettingsState extends TdpRangeState, PollState {
  initialLoad: boolean
  tdpProfiles: TdpProfiles
}

const initialState: SettingsState = {
  minTdp: 3,
  maxTdp: 15,
  initialLoad: true,
  tdpProfiles: {
    default: {
      tdp: 12
    },
  },
  poll: {
    rate: 1000,
    enabled: false,
  }
}

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateMinTdp: (state, action: PayloadAction<number>) => {
      state.minTdp = action.payload
    },
    updateMaxTdp: (state, action: PayloadAction<number>) => {
      state.maxTdp = action.payload
    },
    updateInitialLoad: (state, action: PayloadAction<TdpRangeState & { pollState: boolean }>) => {
      state.initialLoad = false;
      state.minTdp = action.payload.minTdp;
      state.maxTdp = action.payload.maxTdp;
      state.poll.enabled = action.payload.pollState;
    },
    updateTdpProfiles: (state, action: PayloadAction<TdpProfiles>) =>{
      merge(state.tdpProfiles, action.payload)
    },
    updatePollRate: (state, action: PayloadAction<number>) => {
      state.poll.rate = action.payload
    },
    setPolling: (state, action: PayloadAction<boolean>) => {
      state.poll.enabled = action.payload
    }
  },
})

export const allStateSelector = (state: any) => state
export const initialLoadSelector = (state: any) => state.settings.initialLoad

// tdp range selectors
export const minTdpSelector = (state: any) => state.settings.minTdp
export const maxTdpSelector = (state: any) => state.settings.maxTdp
export const tdpRangeSelector = (state: any) => [state.settings.minTdp, state.settings.maxTdp]

// tdp profile selectors
export const defaultTdpSelector = (state: any) => state.settings.tdpProfiles.default.tdp;

// poll rate selectors
export const pollRateSelector = (state: any) => state.settings.poll.rate;
export const pollEnabledSelector = (state: any) => state.settings.poll.enabled;


// Action creators are generated for each case reducer function
export const {
  updateMinTdp,
  updateMaxTdp,
  updateInitialLoad,
  updateTdpProfiles,
  updatePollRate,
  setPolling,
} = settingsSlice.actions

export default settingsSlice.reducer