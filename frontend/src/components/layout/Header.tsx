import React from 'react';
import { useChatStore } from '../../store/chatStore';
import { Plus, Gear, TerminalWindow } from 'phosphor-react';
import { useSettingsStore } from '../../store/settingsStore';

/**
 * 🎯 Premium Header
 * 高端设计 + Phosphor 超细线条图标
 */
export const Header: React.FC = () => {
    const newConversation = useChatStore((state) => state.newConversation);
    const showTerminalLog = useChatStore((state) => state.showTerminalLog);
    const toggleTerminalLog = useChatStore((state) => state.toggleTerminalLog);
    const systemStatusLength = useChatStore((state) => state.systemStatus.length);
    const setSettingsModalOpen = useSettingsStore((state) => state.setModalOpen);

    const handleNewConversation = () => {
        newConversation();
    };

    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-xl border-b border-white/5 z-50 flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-surface/60 border border-white/10 flex items-center justify-center backdrop-blur-xl overflow-hidden">
                    <img src="/Agent_ask_icon.png" alt="agent_ask" className="w-full h-full object-cover" />
                </div>
                <div>
                    <p className="text-lg font-semibold tracking-tight text-text">
                        <span>Ask Smarter</span>
                        <span className="text-textSecondary mx-1.5">•</span>
                        <span>Create Faster</span>
                    </p>
                </div>
            </div>

            {/* Premium Button Group */}
            <div className="flex items-center gap-2">
                {systemStatusLength > 0 && (
                    <button
                        onClick={toggleTerminalLog}
                        className={`w-9 h-9 rounded-xl border transition-all duration-premium flex items-center justify-center
                                   ${showTerminalLog
                                       ? 'bg-white/10 border-white/20 text-white'
                                       : 'bg-surface/60 border-white/10 text-textSecondary hover:text-text hover:bg-white/5 backdrop-blur-xl'}`}
                        title={showTerminalLog ? 'Hide terminal log' : 'Show terminal log'}
                    >
                        <TerminalWindow weight="thin" size={18} />
                    </button>
                )}
                <button
                    onClick={() => setSettingsModalOpen(true)}
                    className="w-9 h-9 rounded-xl bg-surface/60 border border-white/10 text-textSecondary hover:text-text hover:bg-white/5
                               transition-all duration-premium flex items-center justify-center backdrop-blur-xl active:scale-95"
                    title="Settings"
                >
                    <Gear weight="thin" size={18} />
                </button>
                <button
                    onClick={handleNewConversation}
                    className="w-9 h-9 rounded-xl bg-surface/60 border border-white/10 text-textSecondary hover:text-text hover:bg-white/5
                               transition-all duration-premium flex items-center justify-center backdrop-blur-xl active:scale-95"
                    title="New Conversation"
                >
                    <Plus weight="thin" size={18} />
                </button>
                <div className="text-xs text-textSecondary px-3 py-1 rounded-full bg-surface/60 border border-white/10 backdrop-blur-xl">
                    v1.0.0
                </div>
            </div>
        </header>
    );
};
