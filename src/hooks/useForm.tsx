import { useReducer } from 'react';

export enum Actions {
  SET,
  RESET,
}

type ActionType = {
  field?: string;
  type: Actions;
  payload?: unknown;
};

const formReducer = (state: Record<string, unknown>, action: ActionType): Record<string, unknown> => {
  if (action.type === Actions.SET && action.field) {
    return { ...state, [action.field]: action.payload };
  }
  if (action.type === Actions.RESET) {
    return {};
  }
  return state;
};

function useForm(initialState = {}) {
  const [state, dispatch] = useReducer(formReducer, initialState);

  const updateField = (e: React.ChangeEvent<HTMLInputElement>) =>
    dispatch({
      type: Actions.SET,
      field: e.target.name,
      payload: e.target.value,
    });

  const updateValue = ({
    name,
    value,
  }: {
    name: string;
    value: unknown;
  }) => {
    dispatch({
      type: Actions.SET,
      field: name,
      payload: value,
    });
  };

  const resetForm = () =>
    dispatch({
      type: Actions.RESET,
    });
  return { formState: state, updateField, updateValue, resetForm };
}

export default useForm;
