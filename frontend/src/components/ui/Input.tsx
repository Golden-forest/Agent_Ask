import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
    className = '',
    fullWidth = false,
    ...props
}) => {
    return (
        <input
            className={`
        bg-surface text-text border border-border/50 rounded-xl px-4 py-3
        placeholder-textSecondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
        transition-all duration-200
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
            {...props}
        />
    );
};
