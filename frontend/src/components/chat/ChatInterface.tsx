import React, { useEffect, useRef } from 'react';
import { useChatStore } from '../../store/chatStore';
import { MessageItem } from './MessageItem';
import { ChatInput } from './ChatInput';
import { LoadingIndicator } from './LoadingIndicator';
import { CheckSquare, ChartBar, GameController, ArrowRight, Sparkle, Cube } from 'phosphor-react';
import { useT } from '../../i18n';

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
  textKey: 'chat.example1' | 'chat.example2' | 'chat.example3' | 'chat.example4' | 'chat.example5';
  icon: React.ReactNode;
  span: string;
}

const EXAMPLE_PROMPTS: ExamplePrompt[] = [
  { id: '1', textKey: 'chat.example1', icon: <CheckSquare weight="thin" size={24} />, span: 'md:col-span-4 md:row-span-1' },
  { id: '2', textKey: 'chat.example2', icon: <ChartBar weight="thin" size={24} />, span: 'md:col-span-4 md:row-span-1' },
  { id: '3', textKey: 'chat.example3', icon: <GameController weight="thin" size={24} />, span: 'md:col-span-4 md:row-span-1' },
  { id: '4', textKey: 'chat.example4', icon: <Sparkle weight="thin" size={24} />, span: 'md:col-span-4 md:row-span-1' },
  { id: '5', textKey: 'chat.example5', icon: <Cube weight="thin" size={24} />, span: 'md:col-span-4 md:row-span-1' },
];

export const ChatInterface: React.FC = () => {
  const { messages, isLoading, setInput } = useChatStore();
  const { t } = useT();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleExampleClick = (textKey: ExamplePrompt['textKey']) => {
    setInput(t(textKey));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto px-4 pb-6">
      {/* Messages Area */}
      <div className={`flex-1 custom-scrollbar pb-4 px-2 ${messages.length > 0 ? 'overflow-y-auto pt-10' : 'overflow-hidden flex items-center justify-center'}`}>
        {messages.length === 0 ? (
          /* 🎨 Premium Empty State - Asymmetrical Bento Grid */
          <div className="w-full max-w-5xl mx-auto">
            {/* Bento Grid 布局 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5">

                {/* 🎯 大标题区域 - 8列 x 2行 - Double-Bezel */}
                <div className="md:col-span-8 md:row-span-2 p-2 bg-gradient-to-br from-black/[0.02] to-black/[0.08] ring-1 ring-white/[0.08] rounded-[2.5rem]
                                transition-all duration-premium ease-premium
                                hover:ring-white/[0.12] hover:shadow-xl hover:shadow-black/5">
                  <div className="relative p-8 md:p-10 bg-gradient-to-br from-surface/90 to-surface/70 backdrop-blur-3xl rounded-[2.25rem]
                                  shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),inset_0_-2px_4px_rgba(0,0,0,0.1)]
                                  overflow-hidden">

                    {/* 背景微光 */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-emerald-500/5 to-transparent rounded-full blur-3xl" />

                    <div className="relative z-10">
                      {/* 大标题 - 新文案,按语言二选一 */}
                      <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.15] mb-4">
                        {t('chat.heroTitleLine1')}
                        <br />
                        <span className="text-white/60">{t('chat.heroTitleLine2')}</span>
                      </h1>

                      {/* 副标题 */}
                      <p className="text-base md:text-lg text-textSecondary/90 max-w-xl leading-relaxed">
                        {t('chat.heroSubtitle')}
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
                  onClick={() => handleExampleClick(prompt.textKey)}
                />
              ))}
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
  const { t } = useT();
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <button
      className={`group relative ${prompt.span} col-span-1
                  p-2 bg-gradient-to-br from-black/[0.02] to-black/[0.08] ring-1 ring-white/[0.08] rounded-[2rem]
                  transition-all duration-premium ease-premium
                  hover:ring-white/[0.15] hover:bg-gradient-to-br hover:from-black/[0.04] hover:to-black/[0.12]
                  hover:shadow-lg hover:shadow-black/5
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
      <div className="relative p-5 bg-gradient-to-br from-surface/80 to-surface/60 backdrop-blur-2xl rounded-[1.75rem]
                      shadow-[inset_0_1px_2px_rgba(255,255,255,0.15),inset_0_-1px_2px_rgba(0,0,0,0.1)]
                      overflow-hidden">

        {/* 悬停微光效果 */}
        <div
          className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/15 to-transparent rounded-full blur-2xl
                     transition-opacity duration-premium"
          style={{ opacity: isHovered ? 1 : 0 }}
        />

        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="flex-1">
            {/* Icon - 专业超细线条 */}
            <div className="text-white/70 mb-3 transform transition-transform duration-premium group-hover:scale-110">
              {prompt.icon}
            </div>

            {/* Text */}
            <p className="text-sm md:text-base text-text/90 font-medium leading-snug">
              {t(prompt.textKey)}
            </p>
          </div>

          {/* 🎯 Button-in-Button 箭头图标 */}
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-white/[0.06] border border-white/[0.08]
                          flex items-center justify-center
                          shadow-[0_2px_8px_rgba(0,0,0,0.08)]
                          transition-all duration-premium ease-premium
                          group-hover:bg-white/[0.12] group-hover:border-white/[0.15]
                          group-hover:translate-x-1 group-hover:-translate-y-[2px]
                          group-hover:scale-110 group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
            <ArrowRight
              weight="thin"
              size={18}
              className="text-white/70 group-hover:text-white/95 transition-colors duration-premium"
            />
          </div>
        </div>
      </div>
    </button>
  );
};
