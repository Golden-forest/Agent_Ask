import React, { useEffect, useRef } from 'react';
import { useChatStore } from '../../store/chatStore';
import { MessageItem } from './MessageItem';
import { ChatInput } from './ChatInput';
import { LoadingIndicator } from './LoadingIndicator';
import { TerminalLog } from '../ui/TerminalLog';

const EXAMPLE_PROMPTS = [
    'I want to build a todo app',
    'I need a tool to analyze CSV files',
    'I want to create a text adventure game',
];

export const ChatInterface: React.FC = () => {
    const { messages, isLoading, systemStatus, showTerminalLog, setInput } = useChatStore();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleExampleClick = (prompt: string) => {
        setInput(prompt);
    };

    return (
        <div className="flex flex-col h-full max-w-5xl mx-auto px-4 pt-24 pb-6">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-4 px-2">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center">
                        <div className="w-16 h-16 mb-5 rounded-2xl bg-surface border border-border flex items-center justify-center">
                            <img src="/Agent_ask_icon.png" alt="agent_ask" className="w-10 h-10 rounded-xl" />
                        </div>
                        <p className="text-text font-medium text-lg mb-2">What do you want to build?</p>
                        <p className="text-textSecondary text-sm mb-8 text-center max-w-md">
                            Describe a rough idea and the AI will guide you step by step to clarify your requirements.
                        </p>
                        <div className="flex flex-col gap-2 w-full max-w-md">
                            {EXAMPLE_PROMPTS.map((prompt, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleExampleClick(prompt)}
                                    className="text-left px-4 py-3 bg-surface border border-border rounded-xl text-textSecondary hover:text-text hover:border-white/20 hover:bg-surfaceHover transition-all text-sm"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map((msg) => (
                            <MessageItem key={msg.id} message={msg} />
                        ))}

                        {/* Loading indicator */}
                        {isLoading && (
                            <LoadingIndicator />
                        )}

                        {/* Terminal Status Log */}
                        {showTerminalLog && systemStatus.length > 0 && (
                            <div className="my-2">
                                <TerminalLog logs={systemStatus} maxLogs={5} />
                            </div>
                        )}
                    </>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="mt-auto pt-4 bg-background/95 backdrop-blur-sm sticky bottom-0 z-10">
                <ChatInput />
            </div>
        </div>
    );
};
