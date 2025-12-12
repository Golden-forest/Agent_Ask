import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import type { ChatMessage } from '../../types';
import { Bot, Copy, Check } from 'lucide-react';
import { OptionChip } from './OptionChip';
import { useChatStore } from '../../store/chatStore';

interface MessageItemProps {
    message: ChatMessage;
}

// Parse options from message content
function parseOptions(content: string): { mainText: string; options: string[] } {
    // Pattern 1: Traditional bullet list format
    const listPatterns = [
        /\*\*Strategic Options\*\*:\s*((?:- .+\n?)+)/i,  // New format
        /\*\*Options\*\*:\s*((?:- .+\n?)+)/i           // Legacy format
    ];

    // Pattern 2: Inline bold option format (**Option 1: Title**: Description)
    const inlinePattern = /\*\*Option\s*(\d+):\s*([^*]+)\*\*[ \t]*:[ \t]*([^ \n][^\n]*?)(?=\n|$|\*\*Option\s*\d+:|$)/gi;

    let options: string[] = [];
    let mainText = content;

    // Try to match inline options first
    const inlineMatches = [...content.matchAll(inlinePattern)];
    if (inlineMatches.length > 0) {
        options = inlineMatches.map(match => {
            const [, number, title, description] = match;
            return `${title.trim()}: ${description.trim()}`;
        });

        // Remove inline options from main text
        mainText = content.replace(inlinePattern, '').trim();
    } else {
        // Try traditional list format
        for (const pattern of listPatterns) {
            const optionsMatch = content.match(pattern);
            if (optionsMatch) {
                const optionsText = optionsMatch[1];
                options = optionsText
                    .split('\n')
                    .filter(line => line.trim().startsWith('-'))
                    .map(line => {
                        // Remove the bullet and clean up
                        let option = line.replace(/^-\s*/, '').trim();
                        // Remove any leading "Option X:" format for cleaner display
                        option = option.replace(/^Option\s*\d+:\s*/i, '');
                        return option;
                    })
                    .filter(Boolean);

                // Remove the matched options section from main text
                mainText = content.replace(pattern, '').trim();
                break;
            }
        }
    }

    return { mainText, options };
}

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
    const isUser = message.role === 'user';
    const { selectedOptions, toggleOption } = useChatStore();
    const [copied, setCopied] = React.useState(false);

    const { mainText, options } = useMemo(() => {
        if (!isUser && !message.isStreaming) {
            // Remove the code block containing options if it exists
            let cleanContent = message.content;

            // Remove various option formats from main text
            const optionsInlineRegex = /\*\*Option\s*\d+:\s*[^*]+\*\*[ \t]*:[ \t]*[^\n]*(\n(?!\*\*Option\s*\d+:)|$)/gi;
            const optionsBlockRegex = /```[\s\S]*?\*\*(?:Strategic )?Options\*\*[\s\S]*?```/i;
            const optionsListRegex = /\*\*(?:Strategic )?Options\*\*:\s*((?:- .+\n?)+)/i;

            if (optionsInlineRegex.test(cleanContent)) {
                cleanContent = cleanContent.replace(optionsInlineRegex, '').trim();
            } else if (optionsBlockRegex.test(cleanContent)) {
                cleanContent = cleanContent.replace(optionsBlockRegex, '').trim();
            } else if (optionsListRegex.test(cleanContent)) {
                cleanContent = cleanContent.replace(optionsListRegex, '').trim();
            }

            return {
                mainText: cleanContent,
                options: parseOptions(message.content).options
            };
        }
        return { mainText: message.content, options: [] };
    }, [message.content, isUser, message.isStreaming]);

    const handleCopy = async () => {
        // Extract the optimized prompt text
        const promptMatch = message.content.match(/\*\*Optimized Prompt\*\*:\s*([\s\S]*?)$/i);
        const textToCopy = promptMatch ? promptMatch[1].trim() : message.content;

        try {
            await navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const isOptimizedPrompt = message.content.includes('**Optimized Prompt**');

    return (
        <div className={`flex w-full mb-8 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`
          max-w-[85%] md:max-w-[75%] rounded-2xl p-6 shadow-sm relative group
          ${isUser
                        ? 'bg-surface/50 backdrop-blur-sm text-text border border-border/50'
                        : 'bg-transparent text-text pl-0'
                    }
        `}
            >
                {!isUser && (
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primaryHover flex items-center justify-center shadow-lg shadow-primary/20">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-semibold text-sm tracking-wide text-text/90">agent_ask</span>
                        </div>

                        {isOptimizedPrompt && !message.isStreaming && (
                            <button
                                onClick={handleCopy}
                                className="p-2 rounded-lg bg-surface border border-border/50 text-textSecondary hover:text-primary hover:border-primary/50 transition-all opacity-0 group-hover:opacity-100"
                                title="Copy Optimized Prompt"
                            >
                                {copied ? (
                                    <Check className="w-4 h-4 text-green-500" />
                                ) : (
                                    <Copy className="w-4 h-4" />
                                )}
                            </button>
                        )}
                    </div>
                )}

                <div className={`prose prose-invert max-w-none ${isUser ? 'text-right' : 'text-left'}`}>
                    {isUser ? (
                        <p className="whitespace-pre-wrap m-0 leading-relaxed">{message.content}</p>
                    ) : (
                        <ReactMarkdown>{mainText}</ReactMarkdown>
                    )}
                </div>

                {/* Render options if they exist */}
                {!isUser && options.length > 0 && !message.isStreaming && (
                    <div className="mt-6 flex flex-wrap gap-2.5 animate-slide-up">
                        {options.map((option, index) => (
                            <OptionChip
                                key={index}
                                option={option}
                                isSelected={selectedOptions.includes(option)}
                                onToggle={() => toggleOption(option)}
                            />
                        ))}
                    </div>
                )}

                {message.isStreaming && (
                    <span className="typing-indicator ml-1"></span>
                )}
            </div>
        </div>
    );
};
