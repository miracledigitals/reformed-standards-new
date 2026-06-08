import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 max-w-md w-full shadow-lg">
            <div className="inline-flex items-center justify-center p-3 bg-red-100 dark:bg-red-900/40 rounded-full mb-6">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-display font-bold text-red-900 dark:text-red-100 mb-3">
              Something Went Wrong
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 font-serif mb-6 leading-relaxed">
              {this.props.fallbackMessage || 'An unexpected error occurred while rendering this section. This is usually temporary.'}
            </p>
            {this.state.error && (
              <p className="text-xs text-red-500 dark:text-red-400 font-mono bg-red-100 dark:bg-red-900/30 rounded-lg p-3 mb-6 break-all max-h-24 overflow-y-auto">
                {this.state.error.message}
              </p>
            )}
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 px-6 py-3 bg-reformed-800 hover:bg-reformed-700 text-white rounded-full font-bold text-sm transition-all transform active:scale-95 shadow-md"
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
