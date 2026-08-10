import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import type { ChatMessage } from '../../types';
import { Copy, Check } from 'phosphor-react';
import { OptionChip } from './OptionChip';
import { useChatStore } from '../../store/chatStore';

interface MessageItemProps {
    message: ChatMessage;
}

// Strip markdown formatting from option text
function stripMarkdown(text: string): string {
    return text
        .replace(/\*\*(.+?)\*\*/g, '$1')   // **bold**
        .replace(/__(.+?)__/g, '$1')        // __underline__
        .replace(/`([^`]+)`/g, '$1')        // `code`
        .replace(/\*([^*]+)\*/g, '$1')      // *italic*
        .replace(/_([^_]+)_/g, '$1')        // _italic_
        .trim();
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
            const [, , title, description] = match;
            return stripMarkdown(`${title.trim()}: ${description.trim()}`);
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
                        option = option.replace(/^Option\s*\d+:\s*/i, '');
                        return stripMarkdown(option);
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

// Parse attachments from user message content
function parseAttachments(content: string): { mainText: string; attachments: string[] } {
    const attachmentRegex = /---\s*附件:\s*([^\n]+)\s*---\n([\s\S]*?)(?=\n---\s*附件:|$)/g;
    let attachments: string[] = [];
    let mainText = content;

    const matches = [...content.matchAll(attachmentRegex)];
    if (matches.length > 0) {
        attachments = matches.map(m => m[1].trim());
        mainText = content.replace(attachmentRegex, '').trim();
    }

    return { mainText, attachments };
}

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
    const isUser = message.role === 'user';
    const { selectedOptions, toggleOption } = useChatStore();
    const [copied, setCopied] = React.useState(false);

    const { mainText, options, attachments, optimizedPrompt } = useMemo(() => {
        if (isUser) {
            const { mainText: text, attachments: att } = parseAttachments(message.content);
            return { mainText: text, options: [], attachments: att, optimizedPrompt: '' };
        }
        if (!message.isStreaming) {
            let cleanContent = message.content;
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

            // 提取 Optimized Prompt（如果存在）
            const promptMatch = cleanContent.match(/\*\*Optimized Prompt\*\*:?\s*([\s\S]*?)$/i);
            let optimizedPrompt = '';
            if (promptMatch) {
                let rawPrompt = promptMatch[1].trim();

                // 只取第一个代码块或第一段内容，不包括后续的"执行建议"等
                // 如果有代码块，只取代码块内容
                const codeBlockMatch = rawPrompt.match(/```[\w]*\n?([\s\S]*?)\n?```/);
                if (codeBlockMatch) {
                    optimizedPrompt = codeBlockMatch[1].trim();
                } else {
                    // 如果没有代码块，取到"执行建议"或"---"之前的内容
                    const sections = rawPrompt.split(/\n\n(?:\*\*(?:执行建议|Execution Suggestions|Implementation Notes|注意事项|Notes)|---)/i);
                    optimizedPrompt = sections[0].trim();
                }

                // 进一步清理：移除 Implementation Notes 之后的所有内容
                optimizedPrompt = optimizedPrompt.split(/\n\n(?:\*\*)?(?:Implementation Notes|执行建议|Execution Suggestions|注意事项|Notes)(?:\*\*)?:?/i)[0].trim();

                // 清理所有 Markdown 格式符号
                // 移除引用符号 >
                optimizedPrompt = optimizedPrompt.replace(/^>\s*/gm, '');
                // 移除列表符号 - 和 *
                optimizedPrompt = optimizedPrompt.replace(/^[-*]\s+/gm, '');
                // 移除粗体标记 **text**
                optimizedPrompt = optimizedPrompt.replace(/\*\*([^*]+)\*\*/g, '$1');
                // 移除斜体标记 *text*
                optimizedPrompt = optimizedPrompt.replace(/\*([^*]+)\*/g, '$1');
                // 移除行内代码标记 `code`
                optimizedPrompt = optimizedPrompt.replace(/`([^`]+)`/g, '$1');
                // 移除标题标记 #
                optimizedPrompt = optimizedPrompt.replace(/^#+\s+/gm, '');

                optimizedPrompt = optimizedPrompt.trim();

                // 从主内容中移除 Optimized Prompt 部分
                cleanContent = cleanContent.replace(/\*\*Optimized Prompt\*\*:?\s*[\s\S]*$/i, '').trim();
            }

            return {
                mainText: cleanContent,
                options: parseOptions(message.content).options,
                attachments: [],
                optimizedPrompt,
            };
        }
        return { mainText: message.content, options: [], attachments: [], optimizedPrompt: '' };
    }, [message.content, isUser, message.isStreaming]);

    const handleCopy = async (textToCopy: string) => {
        try {
            await navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className={`flex w-full mb-8 animate-fade-in ${isUser ? 'justify-end' : 'justify-start'}`}>
            {isUser ? (
                /* 🎯 Premium User Message - Double-Bezel */
                <div className="max-w-[85%] md:max-w-[75%] p-2 bg-black/5 ring-1 ring-white/5 rounded-[2rem]
                                transition-all duration-premium ease-premium hover:ring-white/10">
                    <div className="relative p-6 bg-surface/60 backdrop-blur-xl rounded-[calc(2rem-0.5rem)]
                                    shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                        <div className="prose prose-invert max-w-none">
                            <div className="whitespace-pre-wrap leading-relaxed text-text">
                                <p className="m-0">{mainText}</p>
                                {attachments.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {attachments.map((name, i) => (
                                            <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-textSecondary">
                                                {name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* 🎯 Premium Assistant Message */
                <div className="max-w-[85%] md:max-w-[75%] w-full">
                    {/* Header with Avatar */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-xl bg-surface/60 border border-white/10 flex items-center justify-center backdrop-blur-xl overflow-hidden">
                            <img src="/Agent_ask_icon.png" alt="agent_ask" className="w-full h-full object-cover" />
                        </div>
                        <span className="font-semibold text-sm tracking-wide text-text/90">agent_ask</span>
                    </div>

                    {/* Message Content */}
                    <div className="prose prose-invert max-w-none text-left">
                        <ReactMarkdown>{mainText}</ReactMarkdown>
                    </div>

                    {/* Optimized Prompt Code Block */}
                    {optimizedPrompt && (
                        <div className="mt-6 relative p-2 bg-black/5 ring-1 ring-white/5 rounded-[2rem]">
                            <div className="relative bg-surface/60 backdrop-blur-xl rounded-[calc(2rem-0.5rem)] p-6
                                            shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                                {/* Copy Button - 右上角 */}
                                <button
                                    onClick={() => handleCopy(optimizedPrompt)}
                                    className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 border border-white/10 text-textSecondary hover:text-text hover:border-white/20
                                               transition-all duration-premium backdrop-blur-xl active:scale-95"
                                    title="Copy Prompt"
                                >
                                    {copied ? (
                                        <Check weight="bold" size={16} className="text-white" />
                                    ) : (
                                        <Copy weight="thin" size={16} />
                                    )}
                                </button>

                                {/* Prompt Content */}
                                <pre className="text-sm text-text/90 font-mono whitespace-pre-wrap break-words m-0 pr-12">
                                    {optimizedPrompt}
                                </pre>
                            </div>
                        </div>
                    )}

                    {/* Render options if they exist */}
                    {options.length > 0 && !message.isStreaming && (
                        <div className="mt-6 flex flex-wrap gap-2.5 animate-fade-in">
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

                    {/* Streaming Indicator */}
                    {message.isStreaming && (
                        <span className="typing-indicator ml-1"></span>
                    )}
                </div>
            )}
        </div>
    );
};
