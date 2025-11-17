import React, { Component, ReactNode } from 'react';
import './ErrorBoundary.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <div className="error-icon">💥</div>
            <h1 className="error-title">GAME OVER</h1>
            <p className="error-message">
              Something went wrong on the court!
            </p>
            <div className="error-details">
              <p>Error: {this.state.error?.message || 'Unknown error'}</p>
            </div>
            <button 
              className="error-retry-btn"
              onClick={() => window.location.reload()}
            >
              🔄 RESTART GAME
            </button>
          </div>
          <div className="error-background">
            <div className="broken-backboard"></div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;