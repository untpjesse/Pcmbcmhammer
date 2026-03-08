import { useRef, useEffect } from 'react';
import { LogEntry } from '../types';
import { Terminal } from 'lucide-react';

interface LoggerProps {
  logs: LogEntry[];
}

export default function Logger({ logs }: LoggerProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="flex flex-col h-full bg-black border border-zinc-800 rounded-lg overflow-hidden font-mono text-xs">
      <div className="flex items-center px-4 py-2 bg-zinc-900 border-b border-zinc-800">
        <Terminal className="w-4 h-4 text-zinc-400 mr-2" />
        <span className="text-zinc-400 font-semibold uppercase tracking-wider">System Log</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {logs.length === 0 && (
          <div className="text-zinc-600 italic">No logs available. Waiting for connection...</div>
        )}
        {logs.map((log) => (
          <div key={log.id} className="flex items-start">
            <span className="text-zinc-500 w-20 shrink-0">
              {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}.{new Date(log.timestamp).getMilliseconds().toString().padStart(3, '0')}
            </span>
            <span
              className={`
                ${log.type === 'info' ? 'text-zinc-300' : ''}
                ${log.type === 'success' ? 'text-emerald-400' : ''}
                ${log.type === 'warning' ? 'text-amber-400' : ''}
                ${log.type === 'error' ? 'text-red-400' : ''}
              `}
            >
              {log.message}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
