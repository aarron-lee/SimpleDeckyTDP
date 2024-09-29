import { debounce } from "lodash";
import { persistGpu, persistTdp } from "../backend/utils";

import { extractCurrentGameId } from "../utils/constants";

let previousTdp: number | undefined;
let previousGameIdForTdp: string | undefined;

const setTdpOriginal = (updatedTdp: number) => {
  const id = extractCurrentGameId();

  if (previousTdp !== updatedTdp || previousGameIdForTdp !== id) {
    previousGameIdForTdp = id;
    previousTdp = updatedTdp;

    persistTdp({ tdp: updatedTdp, gameId: id });
  }
};

export const setTdp = debounce(setTdpOriginal, 800);

let previousMinGpu: number | undefined;
let previousMaxGpu: number | undefined;
let previousGameIdForGpu: string | undefined;

export const setGpuOriginal = (
  updatedMinGpu: number,
  updatedMaxGpu: number
) => {
  const id = extractCurrentGameId();

  if (
    previousGameIdForGpu !== id ||
    previousMinGpu !== updatedMinGpu ||
    previousMaxGpu !== updatedMaxGpu
  ) {
    previousGameIdForGpu = id;
    previousMinGpu = updatedMinGpu;
    previousMaxGpu = updatedMaxGpu;

    persistGpu({
      minGpuFrequency: updatedMinGpu,
      maxGpuFrequency: updatedMaxGpu,
      gameId: id,
    });
  }
};

export const setGpu = debounce(setGpuOriginal, 800);
