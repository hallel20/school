import { Component, ErrorInfo, ReactNode } from 'react';
import InternalServerError from '../pages/500ErrorPage';
import api from '../services/api';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
  };

  // This lifecycle method is called when an error is thrown in a child component
  // It updates the state to indicate that an error has occurred
  // and triggers a re-render with the fallback UI
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to your backend
    api
      .post('/logs', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        details: errorInfo.componentStack,
      })
      .catch(console.error); // Avoid crashing if logging fails
  }

  render() {
    if (this.state.hasError) {
      return <InternalServerError />;
    }

    return this.props.children;
  }
}
