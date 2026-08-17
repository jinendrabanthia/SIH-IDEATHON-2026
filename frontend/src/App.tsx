import React, { Component, ErrorInfo, ReactNode, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './i18n/config';
import { AuthProvider } from './lib/AuthContext';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { PlanTripPage } from './pages/PlanTripPage';
import { ExploreIndia } from './pages/ExploreIndiaPage';
import { MapsPage } from './pages/MapsPage';
import { MyTripsPage } from './pages/MyTripsPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { WeatherPage } from './pages/WeatherPage';
import { NearbyPage } from './pages/NearbyPage';
import { EmergencyPage } from './pages/EmergencyPage';
import { AccessibilityPage } from './pages/AccessibilityPage';
import { TravelGuidePage } from './pages/TravelGuidePage';
import { HomePage } from './pages/HomePage';
import { PlannerPage } from './pages/PlannerPage';
import { AttractionExplorerPage } from './pages/AttractionExplorerPage';
import { SharedTripPage } from './pages/SharedTripPage';
import { TripDetailsPage } from './pages/TripDetailsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { DestinationPage } from './pages/DestinationPage';
import { ProfilePage } from './pages/ProfilePage';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
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
        <AuthProvider>
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
              <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/plan-trip" element={<PlanTripPage />} />
                <Route path="/explore" element={<ExploreIndia />} />
                <Route path="/maps" element={<MapsPage />} />
                <Route path="/my-trips" element={<ProtectedRoute><MyTripsPage /></ProtectedRoute>} />
                <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
                <Route path="/weather" element={<WeatherPage />} />
                <Route path="/nearby" element={<NearbyPage />} />
                <Route path="/accessibility" element={<AccessibilityPage />} />
                <Route path="/travel-guide" element={<TravelGuidePage />} />
                <Route path="/emergency" element={<EmergencyPage />} />
                <Route path="/planner" element={<PlannerPage />} />
                <Route path="/attractions" element={<AttractionExplorerPage />} />
                <Route path="/share/:token" element={<SharedTripPage />} />
                <Route path="/trips/:id" element={<TripDetailsPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/destination/:id" element={<DestinationPage />} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </BrowserRouter>
          </Suspense>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
