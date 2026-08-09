import React from 'react';
import { Check } from 'lucide-react';

interface OptionChipProps {
    option: string;
    isSelected: boolean;
    onToggle: () => void;
}

export const OptionChip: React.FC<OptionChipProps> = ({ option, isSelected, onToggle }) => {
    return (
        <button
            onClick={onToggle}
            className={`
        group px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200
        border cursor-pointer text-left relative overflow-hidden
        ${isSelected
                    ? 'bg-white/10 border-white/30 text-white'
                    : 'bg-surface border-border text-textSecondary hover:border-white/20 hover:text-text hover:bg-surfaceHover'
                }
      `}
        >
            <span className="flex items-center gap-3 relative z-10">
                <span className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-200
          ${isSelected
                        ? 'border-white bg-white text-background'
                        : 'border-border bg-surface group-hover:border-white/30'
                    }
        `}>
                    {isSelected && (
                        <Check className="w-3.5 h-3.5" strokeWidth={3} />
                    )}
                </span>
                <span className="leading-relaxed">{option}</span>
            </span>
        </button>
    );
};
