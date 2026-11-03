import React, { Component, ErrorInfo, ReactNode, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Ignore external extension errors
    if (
      error.message?.includes('MetaMask') ||
      error.stack?.includes('chrome-extension://')
    ) {
      return;
    }
    console.error('Application Error Caught by Boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md p-8 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl">
            <h2 className="text-xl font-bold font-display text-brand-cyan mb-2">Something went wrong</h2>
            <p className="text-xs text-slate-400 font-mono mb-6">
              An unexpected error occurred. Please refresh the page to reload the application.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 rounded-xl bg-brand-cyan text-brand-ink font-mono font-bold text-xs hover:bg-brand-teal transition-colors cursor-pointer"
            >
              Refresh Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Restore path if redirected from static 404 handler
const redirectPath = sessionStorage.getItem('spa_redirect');
if (redirectPath) {
  sessionStorage.removeItem('spa_redirect');
  window.history.replaceState(null, '', redirectPath);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);

