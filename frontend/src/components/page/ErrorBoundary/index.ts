import { ErrorBoundaryReal } from "./ErrorBoundaryReal";
import { ErrorBoundaryOff } from "./ErrorBoundaryOff";

// In development env CRA already provides an Error Boundary component.
// In test env it is unnecessary
// So, use actual component only in production mode.
export const ErrorBoundary =
  process.env.NODE_ENV === "production" ? ErrorBoundaryReal : ErrorBoundaryOff;
