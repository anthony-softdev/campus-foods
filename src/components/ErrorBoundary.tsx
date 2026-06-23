import React from 'react';

interface Props { children: React.ReactNode; }
interface State { hasError: boolean; error: string; }

export default class ErrorBoundary extends React.Component<Props, State> {
  props!: Props;
  state: State = { hasError: false, error: '' };
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-4">
          <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 max-w-md text-center space-y-4">
            <div className="text-5xl">😕</div>
            <h2 className="font-display font-extrabold text-2xl text-[#1a1a1a]">Something went wrong</h2>
            <p className="text-gray-400 text-sm font-sans">We hit an unexpected error. Please refresh the page to try again.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-brand-orange text-white font-bold px-6 py-3 rounded-2xl text-sm hover:bg-[#e07f00] transition-colors cursor-pointer"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
