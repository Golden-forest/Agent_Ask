import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Check, Copy } from 'lucide-react';
import { useT } from '../../i18n';

interface AcceptedResultProps {
    summary: string;
    prompt: string;
    notes?: string;
}

export const AcceptedResult: React.FC<AcceptedResultProps> = ({ summary, prompt, notes }) => {
    const [copied, setCopied] = React.useState(false);
    const { t } = useT();

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(prompt);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    return (
        <section className="w-full animate-slide-up" aria-label="Accepted prompt">
            <div className="mb-5 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success/15 text-success">
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                </span>
                <span className="font-rounded text-sm font-semibold text-success">{t('accepted.label')}</span>
            </div>

            <div className="mb-7">
                <h2 className="font-rounded text-[13px] font-semibold text-textSecondary">{t('accepted.summary')}</h2>
                <div className="prose prose-invert mt-2 max-w-none text-[15px] leading-7 text-text/90">
                    <ReactMarkdown>{summary}</ReactMarkdown>
                </div>
            </div>

            <div className="overflow-hidden rounded-[22px] border border-border/10 bg-surface">
                <div className="flex items-center justify-between border-b border-border/10 px-5 py-4 sm:px-6">
                    <h2 className="font-rounded text-sm font-semibold text-text">{t('accepted.optimizedPrompt')}</h2>
                    <button
                        type="button"
                        onClick={handleCopy}
                        className="inline-flex h-9 items-center gap-2 rounded-[13px] border border-border/10 bg-surfaceElevated px-3 text-xs font-semibold text-textSecondary transition duration-200 hover:border-border/20 hover:bg-surfaceHover hover:text-text active:scale-[0.97]"
                        aria-label={t('accepted.copyAria')}
                    >
                        {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" strokeWidth={1.8} />}
                        <span>{copied ? t('accepted.copied') : t('accepted.copy')}</span>
                    </button>
                </div>
                <div className="prose prose-invert max-w-none px-5 py-5 text-[15px] leading-7 sm:px-6 sm:py-6">
                    <ReactMarkdown>{prompt}</ReactMarkdown>
                </div>
            </div>

            {notes && (
                <div className="mt-5 rounded-[18px] border border-border/10 bg-surface/55 px-5 py-4">
                    <h2 className="font-rounded text-[13px] font-semibold text-textSecondary">{t('accepted.implementationNotes')}</h2>
                    <div className="prose prose-invert mt-2 max-w-none text-sm leading-6 text-textSecondary">
                        <ReactMarkdown>{notes}</ReactMarkdown>
                    </div>
                </div>
            )}
        </section>
    );
};
