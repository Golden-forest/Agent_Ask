import React, { useRef } from 'react';
import { Button } from '../ui/Button';
import { Send, X } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';

export const ChatInput: React.FC = () => {
    const { input, setInput, sendMessage, isLoading, selectedOptions, toggleOption } = useChatStore();
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if ((input.trim() || selectedOptions.length > 0) && !isLoading) {
            sendMessage(input);
            // Reset height
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        // Auto-resize
        e.target.style.height = 'auto';
        e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
    };

    return (
        <div className="relative w-full max-w-4xl mx-auto">
            {/* Selected options display */}
            {selectedOptions.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                    {selectedOptions.map((option: string, index: number) => (
                        <div
                            key={index}
                            className="px-2.5 py-1 bg-primary/10 border border-primary/30 text-primary rounded-lg text-xs flex items-center gap-1.5 animate-fade-in"
                        >
                            <span>{option}</span>
                            <button
                                onClick={() => toggleOption(option)}
                                className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <form onSubmit={handleSubmit} className="relative flex items-end gap-2 bg-surface/80 backdrop-blur-md border border-border rounded-2xl p-1.5 shadow-lg shadow-black/20 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all duration-200">
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your requirements, or select options above..."
                    rows={1}
                    disabled={isLoading}
                    className="w-full bg-transparent text-text placeholder-textSecondary border-none focus:ring-0 resize-none py-2.5 px-3 max-h-[150px] custom-scrollbar text-sm"
                    style={{ minHeight: '44px' }}
                />
                <div className="flex gap-1.5 mb-0.5 mr-0.5">
                    <Button
                        type="button"
                        onClick={() => sendMessage('Accept')}
                        disabled={isLoading}
                        className="h-9 px-3 rounded-xl flex items-center justify-center bg-green-600/10 text-green-500 hover:bg-green-600/20 border border-green-600/30 transition-all text-sm font-medium"
                        title="Accept & Generate Prompt"
                    >
                        Accept
                    </Button>
                    <Button
                        type="submit"
                        disabled={(!input.trim() && selectedOptions.length === 0) || isLoading}
                        className={`
                            h-9 w-9 p-0 rounded-xl flex items-center justify-center transition-all shrink-0
                            ${(input.trim() || selectedOptions.length > 0) ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-surfaceHover text-textSecondary'}
                        `}
                        variant={(input.trim() || selectedOptions.length > 0) ? 'primary' : 'ghost'}
                    >
                        <Send className="w-4 h-4 shrink-0" />
                    </Button>
                </div>
            </form>
            <div className="text-center mt-2 text-xs text-textSecondary">
                Press Enter to send, Shift + Enter for new line
            </div>
        </div>
    );
};
