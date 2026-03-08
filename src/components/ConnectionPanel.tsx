import { useState } from 'react';
import { ConnectionStatus, DeviceInfo } from '../types';
import { Wifi, WifiOff, RefreshCw, Cpu, Activity, Zap, AlertCircle } from 'lucide-react';

interface ConnectionPanelProps {
  status: ConnectionStatus;
  deviceInfo: DeviceInfo | null;
  onConnect: () => void;
  onDisconnect: () => void;
  onSimulate: () => void;
  isWebSerialSupported: boolean;
}

export default function ConnectionPanel({ 
  status, 
  deviceInfo, 
  onConnect, 
  onDisconnect, 
  onSimulate,
  isWebSerialSupported 
}: ConnectionPanelProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-zinc-100 font-semibold flex items-center">
          <Activity className="w-4 h-4 mr-2 text-zinc-400" />
          Device Status
        </h2>
        <div className={`flex items-center space-x-2 px-2 py-1 rounded-full text-xs font-medium ${
          status === 'connected' ? 'bg-emerald-500/10 text-emerald-400' : 
          status === 'connecting' ? 'bg-amber-500/10 text-amber-400' : 
          'bg-zinc-800 text-zinc-500'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            status === 'connected' ? 'bg-emerald-400 animate-pulse' : 
            status === 'connecting' ? 'bg-amber-400 animate-bounce' : 
            'bg-zinc-500'
          }`} />
          <span className="uppercase">{status}</span>
        </div>
      </div>

      {status === 'connected' && deviceInfo ? (
        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-zinc-500">Protocol</span>
            <span className="text-zinc-300 font-mono">{deviceInfo.protocol}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-zinc-500">Voltage</span>
            <span className="text-zinc-300 font-mono">{deviceInfo.voltage.toFixed(1)}V</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-zinc-500">VIN</span>
            <span className="text-zinc-300 font-mono">{deviceInfo.vin}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-zinc-500">OSID</span>
            <span className="text-zinc-300 font-mono">{deviceInfo.osid}</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 text-zinc-600 space-y-2">
          <Cpu className="w-8 h-8 opacity-20" />
          <span className="text-xs">No device connected</span>
        </div>
      )}

      <div className="space-y-2">
        {isWebSerialSupported ? (
          <button
            onClick={status === 'connected' ? onDisconnect : onConnect}
            disabled={status === 'connecting'}
            className={`w-full py-2 px-4 rounded-md font-medium text-sm transition-all flex items-center justify-center ${
              status === 'connected' 
                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {status === 'connecting' ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : status === 'connected' ? (
              <>
                <WifiOff className="w-4 h-4 mr-2" />
                Disconnect
              </>
            ) : (
              <>
                <Wifi className="w-4 h-4 mr-2" />
                Connect via WebSerial
              </>
            )}
          </button>
        ) : (
          <div className="flex items-center justify-center p-2 bg-amber-900/20 text-amber-500 text-xs rounded border border-amber-900/30">
            <AlertCircle className="w-4 h-4 mr-2" />
            WebSerial not supported
          </div>
        )}

        {status === 'disconnected' && (
          <button
            onClick={onSimulate}
            className="w-full py-2 px-4 rounded-md font-medium text-sm transition-all flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200"
          >
            <Zap className="w-3 h-3 mr-2" />
            Simulate Connection
          </button>
        )}
      </div>
    </div>
  );
}
