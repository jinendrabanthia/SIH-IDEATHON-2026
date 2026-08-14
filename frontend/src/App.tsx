import React, { Component, ErrorInfo, ReactNode, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './i18n/config';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { PlannerPage } from './pages/PlannerPage';
import { AttractionExplorerPage } from './pages/AttractionExplorerPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6 text-slate-800">
          <div className="max-w-lg w-full bg-white p-8 rounded-2xl shadow-xl border border-red-200 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <span className="text-2xl font-bold">⚠️ Application Error</span>
            </div>
            <p className="text-sm text-slate-600">
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
            <pre className="text-xs bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto">
              {this.state.error?.stack}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-all text-sm"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
              <div className="text-slate-600 font-medium animate-pulse text-sm">
                Loading MargDarshak...
              </div>
            </div>
          }
        >
          <BrowserRouter>
            <div className="min-h-screen flex flex-col bg-slate-50">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/planner" element={<PlannerPage />} />
                  <Route path="/explore" element={<AttractionExplorerPage />} />
                  <Route path="/attractions" element={<AttractionExplorerPage />} />
                  <Route path="*" element={<HomePage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </Suspense>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
