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
                    ? 'bg-primary/10 border-primary text-primary shadow-lg shadow-primary/10'
                    : 'bg-surface/50 border-border/50 text-textSecondary hover:border-primary/30 hover:text-text hover:bg-surfaceHover'
                }
      `}
        >
            <span className="flex items-center gap-3 relative z-10">
                <span className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-200
          ${isSelected
                        ? 'border-primary bg-primary text-white'
                        : 'border-border/50 bg-surface group-hover:border-primary/50'
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
