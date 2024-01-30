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

    persistTdp(updatedTdp, id);
  }
};

export const setTdp = debounce(setTdpOriginal, 100);

let previousMinGpu: number | undefined;
let previousMaxGpu: number | undefined;
let previousGameIdForGpu: string | undefined;

export const setGpu = (updatedMinGpu: number, updatedMaxGpu: number) => {
  const id = extractCurrentGameId();

  if (
    previousGameIdForGpu !== id ||
    previousMinGpu !== updatedMinGpu ||
    previousMaxGpu !== updatedMaxGpu
  ) {
    previousGameIdForGpu = id;
    previousMinGpu = updatedMinGpu;
    previousMaxGpu = updatedMaxGpu;

    persistGpu(updatedMinGpu, updatedMaxGpu, id);
  }
};
