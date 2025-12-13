import React, { useEffect, useRef } from 'react';
import { useChatStore } from '../../store/chatStore';
import { MessageItem } from './MessageItem';
import { ChatInput } from './ChatInput';
import { LoadingIndicator } from './LoadingIndicator';

export const ChatInterface: React.FC = () => {
    const { messages, isLoading, isSearching } = useChatStore();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    return (
        <div className="flex flex-col h-full max-w-5xl mx-auto px-4 pt-24 pb-6">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-4 px-2">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-textSecondary opacity-50">
                        <div className="w-16 h-16 mb-4 rounded-2xl bg-surface border border-border flex items-center justify-center">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <p>Start a new conversation...</p>
                    </div>
                ) : (
                    <>
                        {messages.map((msg) => (
                            <MessageItem key={msg.id} message={msg} />
                        ))}

                        {/* Loading indicator */}
                        {isLoading && (
                            <LoadingIndicator isSearching={isSearching} />
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
