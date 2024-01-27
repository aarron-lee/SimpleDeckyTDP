import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { fetchPowerControlInfo } from "./thunks";
import { PowerControlInfo } from "../utils/constants";

type UiStateType = {
  powerControlInfo?: PowerControlInfo;
};

const initialState: UiStateType = {
  powerControlInfo: undefined,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchPowerControlInfo.fulfilled, (state, action) => {
      if (action.payload) {
        state.powerControlInfo = action.payload as PowerControlInfo;
      }
    });
  },
});

export const selectPowerControlInfo = (state: RootState) => {
  return state.ui.powerControlInfo;
};

export const selectScalingDriver = (state: RootState) => {
  return state.ui.powerControlInfo?.scalingDriver || "";
};
