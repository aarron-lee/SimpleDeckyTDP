import { logInfo } from "../backend/utils";

export const logger = (store: any) => (next: any) => async (action: any) => {
  await logInfo({
    info: `----------------before ${action.type} ${JSON.stringify(
      action.payload
    )}-------------`,
  });
  await logInfo({ info: store.getState() });
  await logInfo({ info: `-----------------------` });

  const result = next(action);

  await logInfo({
    info: `----------------after ${action.type} ${JSON.stringify(
      action.payload
    )}-------------`,
  });
  await logInfo({ info: store.getState() });
  await logInfo({ info: `-----------------------` });

  return result;
};

export default logger;
