import { combineReducers, configureStore } from "@reduxjs/toolkit";
import settingsReducer from "./settingsSlice";
import { settingsMiddleware } from "./settingsMiddleware";
import { commonMiddleware } from "./commonMiddleware";
import { uiSlice } from "./uiSlice";

const rootReducer = combineReducers({
  ui: uiSlice.reducer,
  settings: settingsReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([settingsMiddleware, commonMiddleware]),
});

// Infer the `RootState` and `AppDispatch` types from the root reducer (avoids a circular reference with the middleware types)
export type RootState = ReturnType<typeof rootReducer>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
