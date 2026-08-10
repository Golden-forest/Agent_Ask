import React, { useEffect, useRef } from 'react';
import { useChatStore } from '../../store/chatStore';
import { MessageItem } from './MessageItem';
import { ChatInput } from './ChatInput';
import { LoadingIndicator } from './LoadingIndicator';
import { CheckSquare, ChartBar, GameController, ArrowRight, Sparkle, Cube } from 'phosphor-react';

/**
 * 🎨 Premium ChatInterface
 *
 * 应用 high-end-visual-design skill:
 * - ✅ Asymmetrical Bento Grid 布局
 * - ✅ Double-Bezel 卡片架构
 * - ✅ Button-in-Button 图标设计
 * - ✅ Phosphor Icons（超细线条，weight=1）
 * - ❌ 完全移除 emoji
 */

interface ExamplePrompt {
  id: string;
  text: string;
  icon: React.ReactNode;
  span: string;
}

const EXAMPLE_PROMPTS: ExamplePrompt[] = [
  {
    id: '1',
    text: 'I want to build a todo app',
    icon: <CheckSquare weight="thin" size={24} />,
    span: 'md:col-span-4 md:row-span-1',
  },
  {
    id: '2',
    text: 'I need a tool to analyze CSV files',
    icon: <ChartBar weight="thin" size={24} />,
    span: 'md:col-span-4 md:row-span-1',
  },
  {
    id: '3',
    text: 'I want to create a text adventure game',
    icon: <GameController weight="thin" size={24} />,
    span: 'md:col-span-4 md:row-span-1',
  },
  {
    id: '4',
    text: 'Help me design a landing page',
    icon: <Sparkle weight="thin" size={24} />,
    span: 'md:col-span-4 md:row-span-1',
  },
  {
    id: '5',
    text: 'I want to create an interactive simulation webpage',
    icon: <Cube weight="thin" size={24} />,
    span: 'md:col-span-4 md:row-span-1',
  },
];

export const ChatInterface: React.FC = () => {
  const { messages, isLoading, setInput } = useChatStore();
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
    <div className="flex flex-col h-full max-w-5xl mx-auto px-4 pt-10 pb-6">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-4 px-2">
        {messages.length === 0 ? (
          /* 🎨 Premium Empty State - Asymmetrical Bento Grid */
          <div className="h-full flex items-center justify-center py-24">
            <div className="w-full max-w-6xl mx-auto">
              {/* Bento Grid 布局 */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">

                {/* 🎯 大标题区域 - 8列 x 2行 - Double-Bezel */}
                <div className="md:col-span-8 md:row-span-2 p-2 bg-black/5 ring-1 ring-white/5 rounded-[2rem]
                                transition-all duration-premium ease-premium
                                hover:ring-white/10">
                  <div className="relative p-12 bg-surface/80 backdrop-blur-2xl rounded-[calc(2rem-0.5rem)]
                                  shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]
                                  overflow-hidden">

                    {/* 背景微光 */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />

                    <div className="relative z-10">
                      {/* Eyebrow Tag */}
                      <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full
                                      bg-white/5 border border-white/10
                                      text-[10px] uppercase tracking-[0.2em] font-medium text-white/60">
                        <Sparkle weight="thin" size={12} />
                        AI ASSISTANT
                      </div>

                      {/* 大标题 */}
                      <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight leading-[1.1] mb-4">
                        What do you want
                        <br />
                        <span className="text-white/60">to build?</span>
                      </h1>

                      {/* 副标题 */}
                      <p className="text-lg text-textSecondary max-w-xl leading-relaxed">
                        Describe a rough idea and the AI will guide you step by step to clarify your requirements.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 📝 示例 Prompt 卡片 - Bento Grid */}
                {EXAMPLE_PROMPTS.map((prompt, index) => (
                  <BentoPromptCard
                    key={prompt.id}
                    prompt={prompt}
                    index={index}
                    onClick={() => handleExampleClick(prompt.text)}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageItem key={msg.id} message={msg} />
            ))}

            {isLoading && <LoadingIndicator />}
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

/**
 * 🎴 Bento Prompt Card
 * Double-Bezel + Button-in-Button 架构
 */
interface BentoPromptCardProps {
  prompt: ExamplePrompt;
  index: number;
  onClick: () => void;
}

const BentoPromptCard: React.FC<BentoPromptCardProps> = ({ prompt, index, onClick }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <button
      className={`group relative ${prompt.span} col-span-1
                  p-2 bg-black/5 ring-1 ring-white/5 rounded-[2rem]
                  transition-all duration-premium ease-premium
                  hover:ring-white/15 hover:bg-black/10
                  active:scale-[0.98]
                  text-left`}
      style={{
        animation: `premiumFadeIn 800ms cubic-bezier(0.32, 0.72, 0, 1) ${index * 100}ms backwards`,
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Inner Core - Double-Bezel 内层 */}
      <div className="relative p-6 bg-surface/60 backdrop-blur-xl rounded-[calc(2rem-0.5rem)]
                      shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]
                      overflow-hidden">

        {/* 悬停微光效果 */}
        <div
          className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl
                     transition-opacity duration-premium"
          style={{ opacity: isHovered ? 1 : 0 }}
        />

        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex-1">
            {/* Icon - 专业超细线条 */}
            <div className="text-white/60 mb-3">
              {prompt.icon}
            </div>

            {/* Text */}
            <p className="text-sm md:text-base text-text font-medium leading-snug">
              {prompt.text}
            </p>
          </div>

          {/* 🎯 Button-in-Button 箭头图标 */}
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/5
                          flex items-center justify-center
                          transition-all duration-premium ease-premium
                          group-hover:bg-white/10
                          group-hover:translate-x-1 group-hover:-translate-y-[2px]
                          group-hover:scale-105">
            <ArrowRight
              weight="thin"
              size={20}
              className="text-white/60 group-hover:text-white/90 transition-colors duration-premium"
            />
          </div>
        </div>
      </div>
    </button>
  );
};
