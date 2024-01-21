import { debounce, get } from "lodash";
import { setSteamPatchGPU, setSteamPatchTDP } from "../backend/utils";
// import {
//   // cacheSteamPatchGpu,
//   cacheSteamPatchTdp,
// } from "../redux-modules/settingsSlice";
import { RootState, store } from "../redux-modules/store";
import { extractCurrentGameId } from "../utils/constants";

let previousTdp: number | undefined;
let previousGameIdForTdp: string | undefined;

const setTdpOriginal = (updatedTdp: number) => {
  const id = extractCurrentGameId();
  previousGameIdForTdp = id;
  previousTdp = updatedTdp;

  setSteamPatchTDP(updatedTdp);
  // store.dispatch(cacheSteamPatchTdp([id, updatedTdp]));
};

export const setTdp = debounce(setTdpOriginal, 100);

let previousMinGpu: number | undefined;
let previousMaxGpu: number | undefined;
let previousGameIdForGpu: string | undefined;

const setGpuOriginal = (updatedMinGpu: number, updatedMaxGpu: number) => {
  const id = extractCurrentGameId();

  previousGameIdForGpu = id;
  previousMinGpu = updatedMinGpu;
  previousMaxGpu = updatedMaxGpu;

  setSteamPatchGPU(updatedMinGpu, updatedMaxGpu);
  // store.dispatch(cacheSteamPatchGpu([id, updatedMinGpu, updatedMaxGpu]));
};

export const setGpu = debounce(setGpuOriginal, 100);

export const getProfileForCurrentIdSelector = (state: RootState) => {
  const id = extractCurrentGameId();
  const profile = get(state, `settings.tdpProfiles.${id}`);

  return profile;
};
