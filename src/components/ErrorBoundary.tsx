//@ts-nocheck
import { Field } from "decky-frontend-lib";
import { Component } from "react";

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
    console.log(error);
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.log(error, errorInfo);
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
