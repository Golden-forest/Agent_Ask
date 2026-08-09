import React, { useRef, useCallback } from 'react';
import { Send, X, Paperclip } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import { isSupportedFile, formatSize } from '../../services/fileParser';
import toast from 'react-hot-toast';

const ACCEPTED_EXTENSIONS = '.txt,.md,.json,.csv,.pdf,.docx,.doc';

export const ChatInput: React.FC = () => {
    const { input, setInput, sendMessage, isLoading, selectedOptions, toggleOption, attachedFiles, addFile, removeFile } = useChatStore();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = React.useState(false);

    const canSend = (input.trim() || selectedOptions.length > 0 || attachedFiles.some(f => f.status === 'ready')) && !isLoading;

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (canSend) {
            sendMessage(input);
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
        e.target.style.height = 'auto';
        e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
    };

    const processFiles = useCallback(async (files: FileList | File[]) => {
        const fileArray = Array.from(files);

        for (const file of fileArray) {
            if (!isSupportedFile(file.name)) {
                toast.error(`Unsupported file type: ${file.name}`);
                continue;
            }
            if (attachedFiles.length >= 3) {
                toast.error('Maximum 3 files allowed');
                break;
            }
            await addFile(file);
        }
    }, [attachedFiles.length, addFile]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            processFiles(e.target.files);
            e.target.value = '';
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files) {
            processFiles(e.dataTransfer.files);
        }
    }, [processFiles]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    return (
        <div className="relative w-full max-w-4xl mx-auto">
            {/* Selected options display */}
            {selectedOptions.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                    {selectedOptions.map((option: string, index: number) => (
                        <div
                            key={index}
                            className="px-2.5 py-1 bg-white/10 border border-white/20 text-white rounded-lg text-xs flex items-center gap-1.5 animate-fade-in"
                        >
                            <span>{option}</span>
                            <button
                                onClick={() => toggleOption(option)}
                                className="hover:bg-white/10 rounded-full p-0.5 transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Attached files preview */}
            {attachedFiles.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                    {attachedFiles.map((file) => (
                        <div
                            key={file.id}
                            className="px-2.5 py-1.5 bg-surface border border-border rounded-lg text-xs flex items-center gap-1.5 animate-fade-in"
                        >
                            {file.status === 'pending' && (
                                <span className="text-textSecondary">Loading {file.name}...</span>
                            )}
                            {file.status === 'parsing' && (
                                <span className="text-textSecondary animate-pulse">Parsing {file.name}...</span>
                            )}
                            {file.status === 'ready' && (
                                <span className="text-text">[{formatSize(file.size)}] {file.name}</span>
                            )}
                            {file.status === 'error' && (
                                <span className="text-textSecondary line-through" title={file.error}>{file.name}: {file.error}</span>
                            )}
                            <button
                                onClick={() => removeFile(file.id)}
                                className="hover:bg-surfaceHover rounded-full p-0.5 transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <form onSubmit={handleSubmit}
                className={`relative flex items-end gap-2 bg-surface border rounded-2xl p-1.5 shadow-lg shadow-black/20 focus-within:border-white/20 focus-within:ring-1 focus-within:ring-white/10 transition-all duration-200 ${isDragOver ? 'border-white/20 ring-2 ring-white/10' : 'border-border'}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_EXTENSIONS}
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                />
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your requirements, attach files, or select options above..."
                    rows={1}
                    disabled={isLoading}
                    className="w-full bg-transparent text-text placeholder-textSecondary border-none focus:ring-0 resize-none py-2.5 px-3 max-h-[150px] custom-scrollbar text-sm"
                    style={{ minHeight: '44px' }}
                />
                <div className="flex gap-1.5 mb-0.5 mr-0.5">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading}
                        className="h-9 w-9 p-0 rounded-xl flex items-center justify-center transition-all shrink-0 bg-surfaceHover text-textSecondary hover:text-text hover:bg-surface border border-border/50"
                        title="Attach file"
                    >
                        <Paperclip className="w-4 h-4 shrink-0" />
                    </button>
                    <button
                        type="button"
                        onClick={() => sendMessage('Accept')}
                        disabled={isLoading}
                        className="h-9 px-3 rounded-xl flex items-center justify-center bg-white/5 text-text hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-sm font-medium"
                        title="Accept & Generate Prompt"
                    >
                        Accept
                    </button>
                    <button
                        type="submit"
                        disabled={!canSend}
                        className={`h-9 w-9 p-0 rounded-xl flex items-center justify-center transition-all shrink-0
                            ${canSend ? 'bg-primary text-background' : 'bg-surfaceHover text-textSecondary cursor-not-allowed'}
                        `}
                    >
                        <Send className="w-4 h-4 shrink-0" />
                    </button>
                </div>
            </form>
            <div className="text-center mt-2 text-xs text-textSecondary">
                Press Enter to send, Shift + Enter for new line. Supports TXT, MD, PDF, DOCX.
            </div>
        </div>
    );
};
