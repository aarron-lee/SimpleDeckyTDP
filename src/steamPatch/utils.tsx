import { get } from "lodash";
import { setSteamPatchTDP } from "../backend/utils";
import { cacheSteamPatchTdp } from "../redux-modules/settingsSlice";
import { RootState, store } from "../redux-modules/store";
import { extractCurrentGameId } from "../utils/constants";

let previousTdp: number | undefined;
let previousGameIdForTdp: string | undefined;

export const debouncedSetTdp = (updatedTdp: number) => {
  const id = extractCurrentGameId();
  if (previousTdp !== updatedTdp || id !== previousGameIdForTdp) {
    previousGameIdForTdp = id;
    previousTdp = updatedTdp;

    setSteamPatchTDP(updatedTdp);
    store.dispatch(cacheSteamPatchTdp([id, updatedTdp]));
  }
};

export const getProfileForCurrentIdSelector = (state: RootState) => {
  const id = extractCurrentGameId();
  const profile = get(state, `settings.tdpProfiles.${id}`);

  return profile;
};
