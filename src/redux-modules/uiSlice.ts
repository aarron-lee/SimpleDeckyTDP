import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { fetchPowerControlInfo } from "./thunks";
import { PowerControlInfo } from "../utils/constants";

type UiStateType = {
  powerControlInfo?: PowerControlInfo;
  isDesktop: boolean;
  tdpOverrideEnabled: boolean;
};

const initialState: UiStateType = {
  powerControlInfo: undefined,
  isDesktop: false,
  tdpOverrideEnabled: false,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    // setIsDesktop(state, action: PayloadAction<boolean>) {
    //   state.isDesktop = action.payload;
    // },
    setTdpOverride(state, action: PayloadAction<boolean>) {
      state.tdpOverrideEnabled = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchPowerControlInfo.fulfilled, (state, action: any) => {
      if (action.payload) {
        state.powerControlInfo = action.payload as PowerControlInfo;
      }
    });
  },
});

export const selectTdpUncapEnabled = (state: RootState) => {
  return state.ui.tdpOverrideEnabled;
}

export const selectPowerControlInfo = (state: RootState) => {
  return state.ui.powerControlInfo;
};

export const selectScalingDriver = (state: RootState) => {
  return state.ui.powerControlInfo?.scalingDriver || "";
};

export const selectIsDesktop = (state: RootState) => {
  return state.ui.isDesktop;
};
