import { configureStore } from "@reduxjs/toolkit";
import settingsReducer from "./settingsSlice";
import { settingsMiddleware } from "./settingsMiddleware";
import { commonMiddleware } from "./commonMiddleware";
import { uiSlice } from "./uiSlice";
// import logger from "./logger";

export const store = configureStore({
  reducer: {
    ui: uiSlice.reducer,
    settings: settingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      settingsMiddleware,
      commonMiddleware,
      // dev only
      // logger,
    ]),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
