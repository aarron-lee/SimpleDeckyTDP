import { createAction } from "@reduxjs/toolkit";

export const cleanupAction = createAction("cleanupAction");

export const suspendAction = createAction("suspendAction");

export const resumeAction = createAction("resumeAction");

export const noopAction = createAction("noop");
