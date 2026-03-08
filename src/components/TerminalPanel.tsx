import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Send, Trash2, Download, Play, Plus, X } from 'lucide-react';

interface TerminalPanelProps {
  isConnected: boolean;
  onSend: (command: string) => void;
  logs: { timestamp: number; message: string; type: string }[];
}

interface Macro {
  id: string;
  name: string;
  command: string;
}

export default function TerminalPanel({ isConnected, onSend, logs }: TerminalPanelProps) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [macros, setMacros] = useState<Macro[]>([
    { id: '1', name: 'Request ID', command: '1A 90' },
    { id: '2', name: 'Reset ECU', command: '11 01' },
  ]);
  const [showAddMacro, setShowAddMacro] = useState(false);
  const [newMacroName, setNewMacroName] = useState('');
  const [newMacroCmd, setNewMacroCmd] = useState('');
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleSend = () => {
    if (!input.trim() || !isConnected) return;
    
    onSend(input);
    setHistory(prev => [input, ...prev]);
    setHistoryIndex(-1);
    setInput('');
  };

  const handleRunMacro = (command: string) => {
    if (!isConnected) return;
    onSend(command);
    setHistory(prev => [command, ...prev]);
  };

  const handleAddMacro = () => {
    if (!newMacroName || !newMacroCmd) return;
    const newMacro: Macro = {
      id: Date.now().toString(),
      name: newMacroName,
      command: newMacroCmd
    };
    setMacros([...macros, newMacro]);
    setNewMacroName('');
    setNewMacroCmd('');
    setShowAddMacro(false);
  };

  const handleDeleteMacro = (id: string) => {
    setMacros(macros.filter(m => m.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  const handleClear = () => {
    // Ideally this would clear logs in parent, but for now just local clear isn't enough
    // We'll just rely on parent logs
  };

  return (
    <div className="flex h-full bg-black font-mono text-sm">
      {/* Main Terminal Area */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-zinc-800">
        <div className="flex items-center justify-between p-2 bg-zinc-900 border-b border-zinc-800">
          <div className="flex items-center text-zinc-400">
            <Terminal className="w-4 h-4 mr-2" />
            <span>Serial Console</span>
          </div>
          <div className="flex space-x-2">
            <button className="p-1 hover:text-white text-zinc-500 transition-colors" title="Clear Console">
              <Trash2 className="w-4 h-4" />
            </button>
            <button className="p-1 hover:text-white text-zinc-500 transition-colors" title="Save Log">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-1 bg-[#0d1117] custom-scrollbar"
        >
          {logs.map((log, i) => (
            <div key={i} className={`flex space-x-2 ${
              log.type === 'error' ? 'text-red-400' :
              log.type === 'success' ? 'text-emerald-400' :
              log.type === 'warning' ? 'text-amber-400' :
              'text-zinc-300'
            }`}>
              <span className="text-zinc-600 select-none">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
              <span className="whitespace-pre-wrap break-all">{log.message}</span>
            </div>
          ))}
          {!isConnected && (
              <div className="text-zinc-600 italic mt-2">-- Disconnected --</div>
          )}
        </div>

        <div className="p-2 bg-zinc-900 border-t border-zinc-800 flex items-center space-x-2">
          <span className="text-emerald-500 font-bold">{'>'}</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!isConnected}
            placeholder={isConnected ? "Enter hex command (e.g. 6C 10 F0 01 00)..." : "Connect to send commands"}
            className="flex-1 bg-transparent border-none outline-none text-zinc-200 placeholder-zinc-600 disabled:cursor-not-allowed"
            autoFocus
          />
          <button 
            onClick={handleSend}
            disabled={!isConnected || !input.trim()}
            className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded disabled:opacity-50 disabled:bg-zinc-800 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Macros Sidebar */}
      <div className="w-64 bg-zinc-900 flex flex-col border-l border-zinc-800">
        <div className="p-3 border-b border-zinc-800 flex justify-between items-center">
          <h3 className="text-zinc-300 font-semibold">Macros</h3>
          <button 
            onClick={() => setShowAddMacro(true)}
            className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {showAddMacro && (
            <div className="bg-zinc-950 p-3 rounded border border-zinc-700 mb-2">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-zinc-500 uppercase">New Macro</span>
                <button onClick={() => setShowAddMacro(false)} className="text-zinc-500 hover:text-zinc-300">
                  <X className="w-3 h-3" />
                </button>
              </div>
              <input
                type="text"
                placeholder="Name"
                value={newMacroName}
                onChange={(e) => setNewMacroName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-300 mb-2 focus:border-emerald-500 outline-none"
              />
              <input
                type="text"
                placeholder="Hex Command"
                value={newMacroCmd}
                onChange={(e) => setNewMacroCmd(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-300 mb-2 focus:border-emerald-500 outline-none font-mono"
              />
              <button
                onClick={handleAddMacro}
                disabled={!newMacroName || !newMacroCmd}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs py-1 rounded disabled:opacity-50"
              >
                Add
              </button>
            </div>
          )}

          {macros.map(macro => (
            <div key={macro.id} className="bg-zinc-950 p-3 rounded border border-zinc-800 hover:border-zinc-700 group transition-colors">
              <div className="flex justify-between items-start mb-1">
                <span className="font-medium text-zinc-300">{macro.name}</span>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleDeleteMacro(macro.id)}
                    className="p-1 text-zinc-500 hover:text-red-400"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={() => handleRunMacro(macro.command)}
                    disabled={!isConnected}
                    className="p-1 text-emerald-500 hover:text-emerald-400 disabled:opacity-50"
                  >
                    <Play className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="text-xs text-zinc-500 font-mono truncate" title={macro.command}>
                {macro.command}
              </div>
            </div>
          ))}
          
          {macros.length === 0 && !showAddMacro && (
            <div className="text-center py-8 text-zinc-600 text-xs">
              No macros defined.<br/>Click + to add one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
