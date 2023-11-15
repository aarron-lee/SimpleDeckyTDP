import { useReducer } from 'react';

export enum Actions {
  SET,
  RESET,
}

type ActionType = {
  field?: string;
  type: Actions;
  payload?: any;
};

const formReducer = (state: any, action: ActionType) => {
  if (action.type === Actions.SET && action.field) {
    let newState = { ...state, [action.field]: action.payload };
    return newState;
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

  const updateValue = ({
    name,
    value,
  }: {
    name: string;
    value: any;
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
