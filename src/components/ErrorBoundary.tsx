import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, ArrowLeft } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    errorMsg: string;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        errorMsg: ''
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, errorMsg: error.toString() };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 px-4">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                        <Sparkles className="w-8 h-8 text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white text-center">Something went wrong</h2>
                    <p className="text-gray-400 max-w-md text-center leading-relaxed">
                        RoamIQ couldn't load this itinerary. Information may be temporarily unavailable for this destination.
                    </p>
                    <div className="text-xs font-mono bg-black/40 text-red-300 p-4 rounded-xl border border-red-500/10 break-words w-full max-w-lg mt-4">
                        {this.state.errorMsg}
                    </div>
                    <a href="/plan" className="mt-6 flex items-center space-x-2 bg-iqoo-yellow text-black font-bold py-3 px-6 rounded-xl hover:bg-white transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Planner</span>
                    </a>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
