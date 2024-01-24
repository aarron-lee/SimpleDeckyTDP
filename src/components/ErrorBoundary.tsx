//@ts-nocheck
import { Field } from "decky-frontend-lib";
import { Component } from "react";
import { logInfo } from "../backend/utils";

type PropsType = {
  children: any;
  title?: string;
};
type StateType = {
  hasError: boolean;
  title?: string;
};

class ErrorBoundary extends Component<PropsType, StateType> {
  constructor(props) {
    super(props);
    this.state = { hasError: false, title: props?.title };
  }

  static getDerivedStateFromError(error) {
    logInfo(JSON.stringify(error));
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    logInfo({
      error: JSON.stringify(error),
      errorInfo: JSON.stringify(errorInfo),
    });
  }
  render() {
    if (this.state.hasError) {
      return (
        <Field disabled label="Error">
          Error while trying to render {this.props.title}
        </Field>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
