import { getMobxObservable } from "./getMobxObservable";

/*
Credit:
https://github.com/0u73r-h34v3n/SDH-PlayTime/blob/ed25e1bc134b62be4127c8dd4156855b66e86545/src/app/middlewares/sleep.ts#L67
*/

const mobxAdministrationSymbol = Symbol("mobx administration");
const mobxStoredAnnotationsSymbol = Symbol("mobx-stored-annotations");

interface SuspendResumeStoreType {
  m_bResuming: boolean;
  m_bShowResumeUI: boolean;
  m_bSuspending: boolean;
  m_cSuspendBlockers: number;
  m_eSuspendResumeProgress: number;
  m_nSuspendSleepMS: number;

  // BShowSuspendResumeDialogs();
  // BlockSuspendAction();
  // GetSuspendResumeState();
  // Init();
  // InitiateResume();
  // InitiateSleep();
  // NotifyResumeUIDone();

  [mobxAdministrationSymbol]: unknown;
  [mobxStoredAnnotationsSymbol]: unknown;
}

declare global {
  // https://github.com/ricewind012/steam-sharedjscontext-types/blob/master/generated/SuspendResumeStore.ts
  let SuspendResumeStore: SuspendResumeStoreType;
}

export function getSuspendObservable() {
  const suspendingMobXObservable = getMobxObservable(
    SuspendResumeStore,
    "m_bSuspending",
  );
  return suspendingMobXObservable;
}

export function getResumeObservable() {
  const resumingMobXObservable = getMobxObservable(
    SuspendResumeStore,
    "m_bResuming",
  );

  return resumingMobXObservable;
}
