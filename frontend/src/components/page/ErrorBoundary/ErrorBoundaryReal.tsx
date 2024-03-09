import { ErrorInfo, PropsWithChildren, PureComponent } from "react";
import { ErrorPage } from "../ErrorPage";

// https://reactjs.org/docs/error-boundaries.html

interface P {}

interface State {
  hasError: boolean;
  error?: unknown;
}

export class ErrorBoundaryReal extends PureComponent<
  PropsWithChildren<P>,
  State
> {
  state: State = {
    hasError: false,
  };

  static getDerivedStateFromError = (error: any): Partial<State> => ({
    hasError: true,
    error,
  });

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (import.meta.env.PROD) {
      console.error(error);
    } else {
      console.error(error, "in", errorInfo);
    }
  }

  render() {
    const { hasError, error } = this.state;
    if (hasError) {
      return <ErrorPage error={error} />;
    }

    return this.props.children;
  }
}
