//@ts-nocheck
import { Component } from "react";
import { logInfo } from "../backend/utils";
import { DeckyField } from "./atoms/DeckyFrontendLib";

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
        <DeckyField disabled label="Error">
          Error while trying to render {this.props.title}
        </DeckyField>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
