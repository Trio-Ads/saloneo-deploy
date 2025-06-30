import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Mettre à jour l'état pour afficher l'UI de fallback
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 Error Boundary caught an error:', error, errorInfo);
    
    // Nettoyer le localStorage si l'erreur est liée aux données corrompues
    if (error.message.includes('not iterable') || error.message.includes('filter is not a function')) {
      console.warn('🧹 Cleaning corrupted localStorage data...');
      try {
        localStorage.removeItem('beauty-flow-appointments');
        localStorage.removeItem('beauty-flow-services');
        localStorage.removeItem('beauty-flow-clients');
        localStorage.removeItem('beauty-flow-team');
        console.log('✅ localStorage cleaned successfully');
      } catch (cleanupError) {
        console.error('❌ Error cleaning localStorage:', cleanupError);
      }
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    // Nettoyer tout le localStorage et recharger
    try {
      localStorage.clear();
      console.log('🧹 All localStorage data cleared');
      window.location.reload();
    } catch (error) {
      console.error('❌ Error clearing localStorage:', error);
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      // UI de fallback personnalisée
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h1 className="text-xl font-semibold text-gray-900 text-center mb-2">
              Oups ! Une erreur s'est produite
            </h1>
            
            <p className="text-gray-600 text-center mb-6">
              L'application a rencontré un problème. Cela peut être dû à des données corrompues dans le cache.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={this.handleReload}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Recharger la page
              </button>
              
              <button
                onClick={this.handleReset}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Réinitialiser l'application
              </button>
            </div>
            
            {this.state.error && (
              <details className="mt-4 p-3 bg-gray-100 rounded text-sm">
                <summary className="cursor-pointer text-gray-700 font-medium">
                  Détails de l'erreur
                </summary>
                <pre className="mt-2 text-xs text-gray-600 overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
