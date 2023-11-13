import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface TdpRangeState {
  minTdp: number,
  maxTdp: number
}

export interface SettingsState extends TdpRangeState {
  initialLoad: boolean
}

const initialState: SettingsState = {
  minTdp: 3,
  maxTdp: 15,
  initialLoad: true,
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
    }
  },
})

export const minTdpSelector = (state: any) => state.settings.minTdp
export const maxTdpSelector = (state: any) => state.settings.maxTdp
export const initialLoadSelector = (state: any) => state.settings.initialLoad
export const tdpRangeSelector = (state: any) => state

// Action creators are generated for each case reducer function
export const { updateMinTdp, updateMaxTdp, updateInitialLoad } = settingsSlice.actions

export default settingsSlice.reducer