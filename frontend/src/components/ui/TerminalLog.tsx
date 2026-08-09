import React from 'react';
import type { SystemStatus } from '../../types';

interface TerminalLogProps {
  logs: SystemStatus[];
  maxLogs?: number;
}

export const TerminalLog: React.FC<TerminalLogProps> = ({
  logs,
  maxLogs = 20
}) => {
  const displayLogs = logs.slice(-maxLogs);

  if (displayLogs.length === 0) {
    return (
      <div className="font-mono text-xs text-textSecondary p-2 animate-fade-in">
        <span className="text-text">$</span> System ready...
        <span className="animate-blink">_</span>
      </div>
    );
  }

  return (
    <div className="font-mono text-xs space-y-1 p-2 bg-black/40 rounded border border-border/50">
      {displayLogs.map((log, index) => (
        <div
          key={log.id}
          className="text-textSecondary hover:bg-white/5 px-1 rounded transition-colors animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex items-start gap-2">
            <span className="shrink-0">{log.message}</span>
            {log.details && (
              <span className="text-textSecondary/70 text-xs">
                {log.details}
              </span>
            )}
          </div>
          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <div className="ml-4 text-textSecondary/60 text-xs">
              {Object.entries(log.metadata).map(([key, value]) => (
                <span key={key} className="mr-2">
                  {key}: {value}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
      {logs.length > maxLogs && (
        <div className="text-textSecondary/50 text-xs italic">
          ... ({logs.length - maxLogs} older messages)
        </div>
      )}
      <div className="text-text animate-blink">
        _
      </div>
    </div>
  );
};
