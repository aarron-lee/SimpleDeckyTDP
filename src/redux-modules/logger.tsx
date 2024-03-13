import { getLogInfo } from "../backend/utils";

export const logger = (store: any) => (next: any) => async (action: any) => {
  const logInfo = getLogInfo();
  await logInfo(
    `----------------before ${action.type} ${JSON.stringify(
      action.payload
    )}-------------`
  );
  await logInfo(store.getState());
  await logInfo(`-----------------------`);

  const result = next(action);

  await logInfo(
    `----------------after ${action.type} ${JSON.stringify(
      action.payload
    )}-------------`
  );
  await logInfo(store.getState());
  await logInfo(`-----------------------`);

  return result;
};

export default logger;
