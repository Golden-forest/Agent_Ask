import React from 'react';
import { useT } from '../../i18n';

/**
 * 🎯 Premium Loading Indicator
 * 流体动画 + 超细线条点动画
 */
export const LoadingIndicator: React.FC = () => {
    const { t } = useT();
    return (
        <div className="flex items-start gap-3 px-2 py-3 animate-fade-in">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden
                            bg-surface/60 border border-white/10 backdrop-blur-xl">
                <img
                    src="/Agent_ask_icon.png"
                    alt="Agent Ask"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Message content with Premium Dots */}
            <div className="flex-1">
                <div className="inline-flex items-center gap-3 bg-surface/60 border border-white/10 rounded-full px-5 py-3 max-w-fit
                                backdrop-blur-xl transition-all duration-premium">
                    <span className="text-text text-sm font-medium">{t('loading.responding')}</span>

                    {/* Premium Typing dots animation */}
                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse-dot-1"></span>
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse-dot-2"></span>
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse-dot-3"></span>
                    </div>
                </div>
            </div>
        </div>
    );
};
