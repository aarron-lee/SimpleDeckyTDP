import { createAsyncThunk } from "@reduxjs/toolkit";
import { getPowerControlInfo } from "../backend/utils";

export const fetchPowerControlInfo = createAsyncThunk(
  "ui/fetchPowerControlInfo",
  async () => {
    const result = await getPowerControlInfo();

    if (result && result.success) {
      return result.result;
    }
    return undefined;
  }
);
