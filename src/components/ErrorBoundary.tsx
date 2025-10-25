import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Icon } from '@grafana/ui';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * Error Boundary component to catch and handle React errors gracefully.
 * Prevents the entire panel from crashing when an error occurs.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error details for debugging
    console.error('Error caught by boundary:', error);
    console.error('Error info:', errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div
          style={{
            padding: '16px',
            textAlign: 'center',
            color: 'var(--text-secondary)',
            background: 'var(--empty-state-bg)',
            borderRadius: '12px',
            border: '2px solid var(--empty-state-border)',
          }}
        >
          <Icon name="exclamation-triangle" size="lg" style={{ marginBottom: '8px', color: 'var(--error)' }} />
          <div style={{ fontWeight: 600, marginBottom: '8px' }}>Something went wrong</div>
          <div style={{ fontSize: '12px', marginBottom: '8px' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </div>
          <div style={{ fontSize: '11px', opacity: 0.7 }}>
            Please check the panel configuration or browser console for details.
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
