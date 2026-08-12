import React, { useRef, useCallback } from 'react';
import { PaperPlaneRight, X, Paperclip } from 'phosphor-react';
import { useChatStore } from '../../store/chatStore';
import { isSupportedFile, formatSize } from '../../services/fileUtils';
import toast from 'react-hot-toast';
import { useT } from '../../i18n';

const ACCEPTED_EXTENSIONS = '.txt,.md,.json,.csv,.pdf,.docx,.doc,.png,.jpg,.jpeg,.gif,.webp,.svg';

export const ChatInput: React.FC = () => {
    const { t } = useT();
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

    const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        const files: File[] = [];
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.kind === 'file') {
                const file = item.getAsFile();
                if (file) {
                    files.push(file);
                }
            }
        }

        if (files.length > 0) {
            e.preventDefault();
            await processFiles(files);
        }
    }, [processFiles]);

    return (
        <div className="relative w-full max-w-4xl mx-auto">
            {/* Selected options display - Premium Chips */}
            {selectedOptions.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                    {selectedOptions.map((option: string, index: number) => (
                        <div
                            key={index}
                            className="px-3 py-1.5 bg-white/5 border border-white/10 text-white rounded-full text-xs flex items-center gap-2 animate-fade-in
                                       transition-all duration-premium hover:bg-white/10 hover:border-white/20"
                        >
                            <span className="font-medium">{option}</span>
                            <button
                                onClick={() => toggleOption(option)}
                                className="hover:bg-white/20 rounded-full p-0.5 transition-all duration-premium"
                            >
                                <X weight="bold" size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Attached files preview - Premium Style */}
            {attachedFiles.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                    {attachedFiles.map((file) => (
                        <div
                            key={file.id}
                            className="px-3 py-1.5 bg-surface/60 border border-border rounded-full text-xs flex items-center gap-2 animate-fade-in
                                       backdrop-blur-xl transition-all duration-premium hover:border-white/20"
                        >
                            {file.status === 'pending' && (
                                <span className="text-textSecondary">{t('chat.loadingFile', { file: file.name })}</span>
                            )}
                            {file.status === 'parsing' && (
                                <span className="text-textSecondary animate-pulse">{t('chat.parsingFile', { file: file.name })}</span>
                            )}
                            {file.status === 'ready' && (
                                <span className="text-text font-medium">[{formatSize(file.size)}] {file.name}</span>
                            )}
                            {file.status === 'error' && (
                                <span className="text-textSecondary line-through" title={file.error}>{file.name}: {file.error}</span>
                            )}
                            <button
                                onClick={() => removeFile(file.id)}
                                className="hover:bg-white/10 rounded-full p-0.5 transition-all duration-premium"
                            >
                                <X weight="bold" size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* 🎯 Premium Double-Bezel Input Container */}
            <form onSubmit={handleSubmit}
                className={`relative p-2 bg-black/5 rounded-[2rem]
                           transition-all duration-premium ease-premium
                           ${isDragOver ? 'ring-2 ring-white/20 bg-black/10' : 'ring-1 ring-white/5'}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                <div className="relative flex items-end gap-2 bg-surface/80 backdrop-blur-xl rounded-[calc(2rem-0.5rem)] p-2
                               shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
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
                        onPaste={handlePaste}
                        placeholder={t('chat.inputPlaceholder')}
                        rows={1}
                        disabled={isLoading}
                        className="w-full bg-transparent text-text placeholder-textSecondary border-none focus:ring-0 resize-none py-3 px-4 max-h-[150px] custom-scrollbar text-sm"
                        style={{ minHeight: '48px' }}
                    />
                    {/* Premium Button Group */}
                    <div className="flex gap-2 mb-0.5 mr-0.5">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isLoading}
                            className="h-10 w-10 rounded-full flex items-center justify-center transition-all duration-premium shrink-0
                                       bg-white/5 text-textSecondary hover:text-text hover:bg-white/10
                                       active:scale-95"
                            title={t('chat.attachFile')}
                        >
                            <Paperclip weight="thin" size={20} />
                        </button>
                        <button
                            type="button"
                            onClick={() => sendMessage('Accept')}
                            disabled={isLoading}
                            className="h-10 px-4 rounded-full flex items-center justify-center
                                       bg-white/5 text-text hover:bg-white/10
                                       border border-white/10 hover:border-white/20
                                       transition-all duration-premium text-sm font-medium
                                       active:scale-95"
                            title={t('chat.acceptTooltip')}
                        >
                            {t('chat.accept')}
                        </button>
                        <button
                            type="submit"
                            disabled={!canSend}
                            className={`h-10 w-10 rounded-full flex items-center justify-center transition-all duration-premium shrink-0
                                       active:scale-95
                                ${canSend
                                    ? 'bg-white text-background shadow-lg shadow-white/20 hover:shadow-white/30'
                                    : 'bg-white/5 text-textSecondary cursor-not-allowed'}
                            `}
                        >
                            <PaperPlaneRight weight="fill" size={20} />
                        </button>
                    </div>
                </div>
            </form>
            <div className="text-center mt-2 text-xs text-textSecondary">
                {t('chat.footer')}
            </div>
        </div>
    );
};
