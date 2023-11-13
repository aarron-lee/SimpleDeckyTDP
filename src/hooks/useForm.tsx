import { useReducer } from 'react';



export enum Actions {
  SET,
  RESET
}

type ActionType = {
  field?: string,
  type: Actions,
  payload?: any,
  logInfo?: any
}


const formReducer = (state: any, action: ActionType) => {
  if (action.type === Actions.SET && action.field) {
    let newState = { ...state, [action.field]: action.payload };
    action?.logInfo && action.logInfo(`useForm action ${JSON.stringify(action)} newstate ${JSON.stringify(newState)}`)

    return newState
  }
  if (action.type === Actions.RESET) {
    return {};
  }
};

function useForm(initialState = {}) {
  const [state, dispatch] = useReducer(formReducer, initialState);

  const updateField = (e: React.ChangeEvent<HTMLInputElement>) =>
    dispatch({
      type: Actions.SET,
      field: e.target.name,
      payload: e.target.value,
    });

  const updateValue = ({ name, value, logInfo }: { name: string, value: any, logInfo?: any }) => {
    logInfo(`updateValue ${name} ${value}`)
    dispatch({
      type: Actions.SET,
      field: name,
      payload: value,
      logInfo
    });
  }

  const resetForm = () =>
    dispatch({
      type: Actions.RESET,
    });
  return { formState: state, updateField, updateValue, resetForm };
}

export default useForm;
