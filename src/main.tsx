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

// Restore path if redirected from static 404 handler or WordPress rewrite
try {
  const redirectPath = sessionStorage.getItem('spa_redirect');
  if (redirectPath) {
    sessionStorage.removeItem('spa_redirect');
    window.history.replaceState(null, '', redirectPath);
  } else {
    // Handle WordPress query-based redirects (e.g., ?route=/events, ?path=/events, ?p=/events)
    const params = new URLSearchParams(window.location.search);
    const queryRoute = 
      params.get('route') || 
      params.get('path') || 
      (params.get('p') && params.get('p')!.startsWith('/') ? params.get('p') : null);
      
    if (queryRoute) {
      params.delete('route');
      params.delete('path');
      if (params.get('p') === queryRoute) params.delete('p');
      const newSearch = params.toString() ? `?${params.toString()}` : '';
      const basePath = window.location.pathname.replace(/\/$/, '');
      window.history.replaceState(null, '', `${basePath}${queryRoute}${newSearch}${window.location.hash}`);
    }
  }
} catch {
  // Ignore URL/storage access restrictions
}

// Automatically detect base path for WordPress installations (e.g., /wordpress or /wp subfolder)
const getAppBasename = (): string => {
  if (typeof window === 'undefined') return '';
  
  // Custom global or meta tag defined by WordPress theme or host
  if (typeof (window as any).__WP_BASENAME__ === 'string') {
    return (window as any).__WP_BASENAME__;
  }
  const metaBase = document.querySelector('meta[name="wp-basename"]')?.getAttribute('content');
  if (metaBase) return metaBase.replace(/\/$/, '');

  // Base tag check
  const baseHref = document.querySelector('base')?.getAttribute('href');
  if (baseHref && baseHref !== '/' && baseHref.startsWith('/')) {
    return baseHref.replace(/\/$/, '');
  }

  // Dynamic detection for /wordpress or /wp subdirectories
  const pathname = window.location.pathname;
  if (pathname === '/wordpress' || pathname.startsWith('/wordpress/')) {
    return '/wordpress';
  }
  if (pathname === '/wp' || pathname.startsWith('/wp/')) {
    return '/wp';
  }

  return '';
};

const appBasename = getAppBasename();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter basename={appBasename}>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);

