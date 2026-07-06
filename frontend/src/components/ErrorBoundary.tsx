import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-slate-100">
          <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20 text-red-500">
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-100">Something went wrong</h2>
              <p className="text-slate-400 text-xs leading-relaxed font-medium">
                FarmAlert encountered an unexpected runtime error. We've logged the diagnostics and are ready to recover.
              </p>
            </div>

            {this.state.error && (
              <pre className="bg-slate-950 p-4 rounded-xl font-mono text-[10px] text-red-400 overflow-x-auto text-left leading-relaxed max-h-40 shadow-inner">
                {this.state.error.message || String(this.state.error)}
              </pre>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-3 text-sm font-bold shadow-lg shadow-emerald-950/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Retry & Reload
              </button>
              <a
                href="/"
                className="w-full border border-slate-700 hover:bg-slate-700 text-slate-300 rounded-xl py-3 text-sm font-bold active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Go to Safety
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
