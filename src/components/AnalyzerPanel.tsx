import React, { useState, useEffect } from 'react';
import { Search, Pause, Play, Trash2, Activity } from 'lucide-react';

interface CanFrame {
  id: string;
  data: string[];
  count: number;
  lastSeen: number;
  changed: boolean[];
}

interface AnalyzerPanelProps {
  isConnected: boolean;
}

export function AnalyzerPanel({ isConnected }: AnalyzerPanelProps) {
  const [frames, setFrames] = useState<Record<string, CanFrame>>({});
  const [isSniffing, setIsSniffing] = useState(false);
  const [filterId, setFilterId] = useState('');

  // Auto-stop if disconnected
  useEffect(() => {
    if (!isConnected) setIsSniffing(false);
  }, [isConnected]);

  const clearFrames = () => setFrames({});

  const filteredFrames = (Object.values(frames) as CanFrame[])
    .filter(f => f.id.includes(filterId.toUpperCase()))
    .sort((a, b) => a.id.localeCompare(b.id));

  return (
    <div className="h-full flex flex-col bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
      <div className="p-4 border-b border-zinc-800 bg-zinc-950/50 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h2 className="text-lg font-semibold text-zinc-100 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-cyan-500" />
          CAN Bus Analyzer
        </h2>
        
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Filter ID..."
              value={filterId}
              onChange={(e) => setFilterId(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-9 pr-3 py-1.5 text-sm text-zinc-300 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
          
          <button
            onClick={clearFrames}
            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg transition-colors border border-zinc-700"
            title="Clear Data"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsSniffing(!isSniffing)}
            disabled={!isConnected}
            className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isSniffing 
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30' 
                : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/30'
            }`}
          >
            {isSniffing ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {isSniffing ? 'Stop Sniffing' : 'Start Sniffing'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-zinc-950/30">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-900/80 sticky top-0 border-b border-zinc-800 backdrop-blur-sm z-10">
            <tr>
              <th className="px-4 py-3 font-medium text-zinc-400 w-24">CAN ID</th>
              <th className="px-4 py-3 font-medium text-zinc-400 w-24">Count</th>
              <th className="px-4 py-3 font-medium text-zinc-400 w-32">Cycle Time</th>
              <th className="px-4 py-3 font-medium text-zinc-400">Data (8 Bytes)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {filteredFrames.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
                  {!isConnected ? 'Connect to a vehicle to sniff CAN traffic.' : 'No CAN frames captured. Start sniffing.'}
                </td>
              </tr>
            ) : (
              filteredFrames.map((frame) => {
                const cycleTime = Date.now() - frame.lastSeen;
                return (
                  <tr key={frame.id} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="px-4 py-2 font-mono text-cyan-400 font-semibold">{frame.id}</td>
                    <td className="px-4 py-2 font-mono text-zinc-400">{frame.count}</td>
                    <td className="px-4 py-2 font-mono text-zinc-500">
                      <span className={cycleTime > 1000 ? 'text-red-400/70' : ''}>
                        {cycleTime > 9999 ? '>9999' : cycleTime} ms
                      </span>
                    </td>
                    <td className="px-4 py-2 font-mono flex space-x-2">
                      {frame.data.map((byte, idx) => (
                        <span 
                          key={idx} 
                          className={`w-6 text-center rounded transition-colors duration-300 ${
                            frame.changed[idx] 
                              ? 'bg-cyan-500/30 text-cyan-300 font-bold' 
                              : 'text-zinc-300'
                          }`}
                        >
                          {byte}
                        </span>
                      ))}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
