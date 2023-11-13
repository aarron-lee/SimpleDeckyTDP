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

export interface SettingsState extends TdpRangeState {
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
    updateInitialLoad: (state, action: PayloadAction<TdpRangeState>) => {
      state.initialLoad = false;
      state.minTdp = action.payload.minTdp;
      state.maxTdp = action.payload.maxTdp;
    },
    updateTdpProfiles: (state, action: PayloadAction<TdpProfiles>) =>{
      merge(state.tdpProfiles, action.payload)
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


// Action creators are generated for each case reducer function
export const { updateMinTdp, updateMaxTdp, updateInitialLoad, updateTdpProfiles } = settingsSlice.actions

export default settingsSlice.reducer