import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface TdpRangeState {
  minTdp: number,
  maxTdp: number
}

const initialState: TdpRangeState = {
  minTdp: 3,
  maxTdp: 15
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
  },
})

export const minTdpSelector = (state: any) => state.settings.minTdp
export const maxTdpSelector = (state: any) => state.settings.maxTdp
export const tdpRangeSelector = (state: any) => state

// Action creators are generated for each case reducer function
export const { updateMinTdp, updateMaxTdp } = settingsSlice.actions

export default settingsSlice.reducer