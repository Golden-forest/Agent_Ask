import React from 'react';
import type { SystemStatus } from '../../types';

interface TerminalLogProps {
  logs: SystemStatus[];
  maxLogs?: number;
}

const phaseColors: Record<SystemStatus['phase'], string> = {
  idle: 'text-gray-400',
  connecting: 'text-cyan-400',
  sending: 'text-blue-400',
  searching: 'text-yellow-400',
  inferring: 'text-purple-400',
  streaming: 'text-green-400',
  complete: 'text-green-500',
  error: 'text-red-400',
};

export const TerminalLog: React.FC<TerminalLogProps> = ({
  logs,
  maxLogs = 20
}) => {
  const displayLogs = logs.slice(-maxLogs);

  if (displayLogs.length === 0) {
    return (
      <div className="font-mono text-xs text-gray-500 p-2 animate-fade-in">
        <span className="text-green-500">$</span> System ready...
        <span className="animate-blink">_</span>
      </div>
    );
  }

  return (
    <div className="font-mono text-xs space-y-1 p-2 bg-black/50 rounded border border-green-900/30">
      {displayLogs.map((log, index) => (
        <div
          key={log.id}
          className={`${phaseColors[log.phase]} hover:bg-white/5 px-1 rounded transition-colors animate-fade-in`}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex items-start gap-2">
            <span className="shrink-0">{log.message}</span>
            {log.details && (
              <span className="text-gray-400 text-xs">
                {log.details}
              </span>
            )}
          </div>
          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <div className="ml-4 text-gray-500 text-xs">
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
        <div className="text-gray-600 text-xs italic">
          ... ({logs.length - maxLogs} older messages)
        </div>
      )}
      <div className="text-green-500 animate-blink">
        _
      </div>
    </div>
  );
};
