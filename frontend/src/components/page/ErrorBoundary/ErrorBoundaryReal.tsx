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
    if (process.env.NODE_ENV === "development") {
      console.error(error, "in", errorInfo);
    } else if (process.env.NODE_ENV === "production") {
      console.error(error);
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
