import { Component, ErrorInfo, ReactNode } from 'react';
import InternalServerError from '../pages/500ErrorPage';
import api from '../services/api';
import DevelopmentErrorDisplay from './DevError';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: undefined,
    errorInfo: undefined,
  };

  // This lifecycle method is called when an error is thrown in a child component
  // It updates the state to indicate that an error has occurred
  // and triggers a re-render with the fallback UI
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const isDevelopment = import.meta.env.DEV;

    if (isDevelopment) {
      // In development, set the error and errorInfo in state to display them
      this.setState({ error, errorInfo });
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    } else {
      // In production, log error to your backend
      api
        .post('/logs', {
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          // details: errorInfo.componentStack, // 'details' might be redundant if componentStack is already sent
        })
        .catch(console.error); // Avoid crashing if logging fails
    }
  }

  render() {
    const isDevelopment = import.meta.env.DEV;

    if (this.state.hasError) {
      // If in development and we have the detailed error information, show the dev overlay
      if (isDevelopment && this.state.error && this.state.errorInfo) {
        return (
          <DevelopmentErrorDisplay
            error={this.state.error}
            errorInfo={this.state.errorInfo}
          />
        );
      }
      // Otherwise, show the generic error page (for production or if details are missing)
      return <InternalServerError />;
    }

    return this.props.children;
  }
}
