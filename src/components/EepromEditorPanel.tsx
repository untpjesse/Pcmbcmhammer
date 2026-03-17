import React, { useState } from 'react';
import { Database, AlertTriangle, Download, Upload, Search } from 'lucide-react';

interface EepromEditorPanelProps {
  isConnected: boolean;
}

export function EepromEditorPanel({ isConnected }: EepromEditorPanelProps) {
  const [address, setAddress] = useState('0000');
  const [length, setLength] = useState('0100');
  const [data, setData] = useState<string>('');
  const [isReading, setIsReading] = useState(false);

  const handleRead = () => {
    if (!isConnected) return;
    setIsReading(true);
    
    // Simulate reading EEPROM
    setTimeout(() => {
      const len = parseInt(length, 16) || 256;
      let mockData = '';
      for (let i = 0; i < len; i++) {
        mockData += Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase() + ' ';
        if ((i + 1) % 16 === 0) mockData += '\n';
      }
      setData(mockData.trim());
      setIsReading(false);
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
      <div className="p-4 border-b border-zinc-800 bg-zinc-950/50 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-zinc-100 flex items-center">
          <Database className="w-5 h-5 mr-2 text-rose-500" />
          EEPROM / Memory Editor
        </h2>
      </div>

      <div className="p-4 bg-rose-500/10 border-b border-rose-500/20 flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-rose-200/70">
          <strong className="text-rose-500 font-semibold">DANGER:</strong> Direct memory access can permanently brick the module. Do not write to EEPROM unless you have a valid backup and know exactly what you are modifying.
        </p>
      </div>

      <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex space-x-4">
        <div className="flex-1">
          <label className="block text-xs font-medium text-zinc-500 mb-1">Start Address (Hex)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-sm">0x</span>
            <input 
              type="text" 
              value={address}
              onChange={(e) => setAddress(e.target.value.replace(/[^0-9A-Fa-f]/g, '').toUpperCase())}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 pl-8 pr-3 text-sm text-zinc-300 font-mono focus:outline-none focus:border-rose-500 transition-colors"
              placeholder="0000"
              maxLength={8}
            />
          </div>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-zinc-500 mb-1">Length (Hex)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-sm">0x</span>
            <input 
              type="text" 
              value={length}
              onChange={(e) => setLength(e.target.value.replace(/[^0-9A-Fa-f]/g, '').toUpperCase())}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 pl-8 pr-3 text-sm text-zinc-300 font-mono focus:outline-none focus:border-rose-500 transition-colors"
              placeholder="0100"
              maxLength={4}
            />
          </div>
        </div>
        <div className="flex items-end space-x-2">
          <button 
            onClick={handleRead}
            disabled={!isConnected || isReading}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center h-[38px]"
          >
            {isReading ? <Search className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            Read
          </button>
          <button 
            disabled={!isConnected || !data}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center h-[38px]"
          >
            <Upload className="w-4 h-4 mr-2" />
            Write
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-hidden flex flex-col">
        <label className="block text-xs font-medium text-zinc-500 mb-2">Memory Dump</label>
        <textarea
          value={data}
          onChange={(e) => setData(e.target.value)}
          disabled={!isConnected}
          className="flex-1 w-full bg-zinc-950 border border-zinc-800 rounded-lg p-4 text-sm text-zinc-300 font-mono focus:outline-none focus:border-rose-500 transition-colors resize-none"
          placeholder="Memory data will appear here..."
          spellCheck={false}
        />
      </div>
    </div>
  );
}
