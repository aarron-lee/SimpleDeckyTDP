import type {
  ComputedValue,
  ObservableObjectAdministration,
  ObservableValue,
} from "mobx/dist/internal";
type Nullable<T> = T | null | undefined;

/*
Credit:
https://github.com/0u73r-h34v3n/SDH-PlayTime/blob/ed25e1bc134b62be4127c8dd4156855b66e86545/src/app/middlewares/sleep.ts#L67
*/

export function isNil<T>(data: T): data is Extract<T, null | undefined> {
  return data === null || data === undefined;
}

// NOTE: https://github.com/FrogTheFrog/moondeck/blob/main/src/lib/appoverviewpatcher.ts#L122
function getMobxAdministrationSymbol(objectWithMobx: object): Nullable<symbol> {
  for (const symbol of Object.getOwnPropertySymbols(objectWithMobx)) {
    if (!symbol.description?.includes("mobx administration")) {
      continue;
    }

    return symbol;
  }

  return undefined;
}

export type MobxComputedValue<T> = ComputedValue<T>;
export type MobxObservableValue<T> = ObservableValue<T>;

export function getMobxObservable<T extends object, R>(
  steamObject: T,
  keyToObserve: string,
): MobxComputedValue<R> | MobxObservableValue<R> | undefined {
  const mobxSymbol = getMobxAdministrationSymbol(steamObject);

  if (isNil(mobxSymbol)) {
    return;
  }

  const steamUiStoreObservable = steamObject[
    mobxSymbol as keyof T
  ] as unknown as ObservableObjectAdministration;

  if (isNil(steamUiStoreObservable)) {
    return;
  }

  return steamUiStoreObservable.values_.get(keyToObserve);
}

export default getMobxObservable;
