import React from 'react';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

// Component that throws an error
const ThrowError: React.FC<{ shouldThrow?: boolean; message?: string }> = ({ shouldThrow = true, message = 'Test error' }) => {
  if (shouldThrow) {
    throw new Error(message);
  }
  return <div>No error</div>;
};

// Suppress console.error for these tests since we expect errors
beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  (console.error as jest.Mock).mockRestore();
});

describe('ErrorBoundary', () => {
  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should render error UI when child component throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('should display custom error message from thrown error', () => {
    render(
      <ErrorBoundary>
        <ThrowError message="Custom error message" />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('should display error icon', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    // Check for the presence of an icon by test id
    const icon = screen.getByTestId('exclamation-triangle');
    expect(icon).toBeInTheDocument();
  });

  it('should display helpful message to check console', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Please check the panel configuration or browser console for details/i)).toBeInTheDocument();
  });

  it('should render custom fallback UI when provided', () => {
    const customFallback = <div>Custom error fallback</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error fallback')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('should log error to console', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error');

    render(
      <ErrorBoundary>
        <ThrowError message="Logged error" />
      </ErrorBoundary>
    );

    expect(consoleErrorSpy).toHaveBeenCalled();
    // Check if error was logged with our message
    const errorCalls = consoleErrorSpy.mock.calls;
    const hasErrorMessage = errorCalls.some(call =>
      call.some(arg => arg instanceof Error && arg.message === 'Logged error')
    );
    expect(hasErrorMessage).toBe(true);
  });

  it('should not crash when error message is undefined', () => {
    const ThrowUndefinedError: React.FC = () => {
      throw new Error();
    };

    render(
      <ErrorBoundary>
        <ThrowUndefinedError />
      </ErrorBoundary>
    );

    expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument();
  });

  it('should catch errors in deeply nested components', () => {
    render(
      <ErrorBoundary>
        <div>
          <div>
            <div>
              <ThrowError message="Nested error" />
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Nested error')).toBeInTheDocument();
  });

  it('should maintain error state after re-render', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Re-render with same props
    rerender(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should maintain error state until unmounted', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Note: Error boundaries don't automatically recover in React
    // This behavior is by design - once error boundary catches an error,
    // it stays in error state until the component is unmounted and remounted

    // Re-render to verify error state persists
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});
