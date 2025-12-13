import React from 'react';

interface LoadingIndicatorProps {
    isSearching?: boolean;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ isSearching = false }) => {
    const message = isSearching ? 'Agent is searching...' : 'Agent is responding...';

    return (
        <div className="flex items-start gap-3 px-2 py-3 animate-fade-in">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                <img
                    src="/Agent_ask_icon.png"
                    alt="Agent Ask"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Message content */}
            <div className="flex-1">
                <div className="inline-flex items-center gap-2 bg-surface/80 border border-border rounded-2xl px-4 py-3 max-w-fit">
                    <span className="text-text text-sm">{message}</span>

                    {/* Typing dots animation */}
                    <div className="flex items-center gap-1 ml-1">
                        <span className="w-1.5 h-1.5 bg-textSecondary rounded-full animate-pulse-dot-1"></span>
                        <span className="w-1.5 h-1.5 bg-textSecondary rounded-full animate-pulse-dot-2"></span>
                        <span className="w-1.5 h-1.5 bg-textSecondary rounded-full animate-pulse-dot-3"></span>
                    </div>
                </div>
            </div>
        </div>
    );
};