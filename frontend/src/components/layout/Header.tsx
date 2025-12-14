import React from 'react';
import { useChatStore } from '../../store/chatStore';
import { Plus } from 'lucide-react';

export const Header: React.FC = () => {
    const newConversation = useChatStore((state) => state.newConversation);

    const handleNewConversation = () => {
        newConversation();
    };

    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-b border-border/50 z-50 flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface/50 backdrop-blur-sm border border-border/50 flex items-center justify-center shadow-lg shadow-primary/20">
                    <img src="/Agent_ask_icon.png" alt="agent_ask" className="w-7 h-7 rounded-md" />
                </div>
                <div>
                    <p className="text-lg font-semibold tracking-tight">
                        <span className="text-emerald-500">Ask Smarter</span>
                        <span className="text-textSecondary mx-1.5">•</span>
                        <span className="text-cyan-500">Create Faster</span>
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={handleNewConversation}
                    className="w-9 h-9 rounded-lg bg-surface border border-border/50 text-textSecondary hover:text-primary hover:border-primary/50 transition-all flex items-center justify-center group"
                    title="New Conversation"
                >
                    <Plus className="w-4 h-4" />
                </button>
                <div className="text-xs text-textSecondary px-3 py-1 rounded-full bg-surface border border-border/50">
                    v1.0.0
                </div>
            </div>
        </header>
    );
};
