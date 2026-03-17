import { useState } from 'react';
import { ConnectionStatus, DeviceInfo } from '../types';
import { Wifi, WifiOff, RefreshCw, Cpu, Activity, Zap, AlertCircle, Network } from 'lucide-react';

interface ConnectionPanelProps {
  status: ConnectionStatus;
  deviceInfo: DeviceInfo | null;
  lastError: string | null;
  lastMethod: string | null;
  onConnect: () => void;
  onQuickConnect: () => void;
  onAutoSetupProxy: () => void;
  onScanJ2534: () => void;
  onConnectVcxNano: () => void;
  onDisconnect: () => void;
  onSimulate: () => void;
  onSimulateJ2534: () => void;
  isWebSerialSupported: boolean;
}

export default function ConnectionPanel({ 
  status, 
  deviceInfo, 
  lastError,
  lastMethod,
  onConnect, 
  onQuickConnect,
  onAutoSetupProxy,
  onScanJ2534,
  onConnectVcxNano,
  onDisconnect, 
  onSimulate,
  onSimulateJ2534,
  isWebSerialSupported 
}: ConnectionPanelProps) {
  const getStatusStyles = () => {
    switch (status) {
      case 'connected':
        return {
          bg: 'bg-emerald-500/10',
          text: 'text-emerald-400',
          border: 'border-emerald-500/20',
          dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]',
          card: 'border-emerald-500/10 bg-emerald-500/5'
        };
      case 'connecting':
        return {
          bg: 'bg-amber-500/10',
          text: 'text-amber-400',
          border: 'border-amber-500/20',
          dot: 'bg-amber-400 animate-bounce',
          card: 'border-amber-500/10 bg-amber-500/5'
        };
      case 'error':
        return {
          bg: 'bg-rose-500/10',
          text: 'text-rose-400',
          border: 'border-rose-500/20',
          dot: 'bg-rose-400',
          card: 'border-rose-500/10 bg-rose-500/5'
        };
      default:
        return {
          bg: 'bg-slate-800/50',
          text: 'text-slate-500',
          border: 'border-slate-700/50',
          dot: 'bg-slate-600',
          card: 'bg-slate-900/50'
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <div className={`hardware-card p-4 transition-all duration-500 ${styles.card}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Activity className={`w-4 h-4 ${styles.text}`} />
          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Interface Status</h2>
        </div>
        <div className={`flex items-center space-x-2 px-2 py-1 rounded-md text-[10px] font-bold tracking-wider border transition-colors duration-500 ${styles.bg} ${styles.text} ${styles.border}`}>
          <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${styles.dot} ${status === 'connected' ? 'animate-pulse' : ''}`} />
          <span className="uppercase">{status}</span>
        </div>
      </div>

      {status === 'connected' && deviceInfo ? (
        <div className="flex flex-col items-center justify-center py-6 space-y-3 bg-slate-950/30 rounded-lg border border-slate-800/50 mb-6">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <Cpu className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="text-center">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">System Online</span>
            <p className="text-[9px] text-slate-500 font-medium uppercase tracking-tighter mt-0.5">{deviceInfo.name || 'Generic Interface'}</p>
          </div>
          {deviceInfo.protocol.includes('Proxy') && (
            <div className="flex flex-col items-center space-y-2 pt-2">
              <div className="flex items-center text-[9px] font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20 uppercase tracking-wider">
                <Network className="w-3 h-3 mr-1.5" />
                J2534 PassThru Active
              </div>
              <button
                onClick={onScanJ2534}
                title="Refresh the list of available devices on the J2534 bus"
                className="text-[9px] font-bold text-slate-400 hover:text-white flex items-center bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded border border-slate-700 transition-all uppercase tracking-widest"
              >
                <RefreshCw className="w-3 h-3 mr-1.5" />
                Re-Scan Bus
              </button>
            </div>
          )}
        </div>
      ) : status === 'error' ? (
        <div className="flex flex-col items-center justify-center py-6 px-4 space-y-3 bg-rose-500/5 rounded-lg border border-rose-500/20 mb-6">
          <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
            <AlertCircle className="w-5 h-5 text-rose-400" />
          </div>
          <div className="text-center">
            <span className="text-[9px] font-bold text-rose-400 uppercase tracking-widest">Connection Error</span>
            <p className="text-[9px] text-rose-300/70 font-medium leading-tight mt-1 max-w-[180px] mx-auto">
              {lastError || 'An unexpected error occurred during link initialization.'}
            </p>
          </div>
          <button 
            onClick={onConnect}
            title="Attempt to re-initialize the connection"
            className="text-[8px] font-bold text-rose-400 hover:text-rose-300 uppercase tracking-widest underline underline-offset-4"
          >
            Retry Connection
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 space-y-3 bg-slate-950/20 rounded-lg border border-dashed border-slate-800 mb-6">
          <div className="w-12 h-12 rounded-full bg-slate-800/30 flex items-center justify-center border border-slate-800/50">
            <WifiOff className="w-6 h-6 text-slate-600" />
          </div>
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">No Active Link</span>
        </div>
      )}

      <div className="space-y-3">
        {status === 'disconnected' && lastMethod && (
          <button
            onClick={onQuickConnect}
            title="Quickly reconnect using the last successful method"
            className="w-full py-3 px-4 rounded-lg font-bold text-[11px] uppercase tracking-[0.2em] transition-all flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/30 shadow-[0_0_15px_rgba(16,185,129,0.2)] group"
          >
            <Zap className="w-4 h-4 mr-2 text-emerald-300 group-hover:scale-125 transition-transform" />
            Quick Connect: {lastMethod === 'serial' ? 'Serial' : 'J2534'}
          </button>
        )}

        {isWebSerialSupported ? (
          <button
            onClick={status === 'connected' ? onDisconnect : onConnect}
            disabled={status === 'connecting'}
            title={status === 'connected' ? "Terminate the current active link" : "Establish a new connection via WebSerial"}
            className={`w-full py-2.5 px-4 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center border ${
              status === 'connected' 
                ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border-rose-500/20' 
                : 'hardware-button-primary'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {status === 'connecting' ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Initializing...
              </>
            ) : status === 'connected' ? (
              <>
                <WifiOff className="w-4 h-4 mr-2" />
                Terminate Link
              </>
            ) : (
              <>
                <Wifi className="w-4 h-4 mr-2" />
                Connect WebSerial
              </>
            )}
          </button>
        ) : (
          <div className="flex items-center justify-center p-3 bg-amber-900/10 text-amber-500 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-amber-900/20">
            <AlertCircle className="w-4 h-4 mr-2" />
            WebSerial Unsupported
          </div>
        )}

        {status !== 'connected' && (
          <div className="space-y-2">
            <button
              onClick={onAutoSetupProxy}
              disabled={status === 'connecting'}
              title="Automatically configure and connect to the local J2534 proxy"
              className="w-full py-2.5 px-4 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 group"
            >
              <Zap className="w-4 h-4 mr-2 group-hover:animate-pulse" />
              One-Click Proxy Setup
            </button>
            <button
              onClick={onScanJ2534}
              disabled={status === 'connecting'}
              title="Scan the network for available J2534 PassThru devices"
              className="w-full py-2.5 px-4 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center hardware-button-secondary"
            >
              <Network className="w-4 h-4 mr-2" />
              Scan J2534 Bus
            </button>
            <button
              onClick={onConnectVcxNano}
              disabled={status === 'connecting'}
              title="Directly initialize connection to a VCX Nano interface"
              className="w-full py-2.5 px-4 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/5"
            >
              <Zap className="w-4 h-4 mr-2" />
              VCX Nano Direct
            </button>
          </div>
        )}

        {status === 'disconnected' && (
          <div className="space-y-2 pt-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onSimulate}
                title="Start a simulated ELM327 interface for testing"
                className="w-full py-2 px-2 rounded-lg font-bold text-[9px] uppercase tracking-tighter transition-all flex items-center justify-center bg-slate-800/50 hover:bg-slate-800 text-slate-500 hover:text-slate-300 border border-slate-700/50"
              >
                <Zap className="w-3 h-3 mr-1.5" />
                ELM Sim
              </button>
              <button
                onClick={onSimulateJ2534}
                title="Start a simulated J2534 interface for testing"
                className="w-full py-2 px-2 rounded-lg font-bold text-[9px] uppercase tracking-tighter transition-all flex items-center justify-center bg-slate-800/50 hover:bg-slate-800 text-slate-500 hover:text-slate-300 border border-slate-700/50"
              >
                <Cpu className="w-3 h-3 mr-1.5" />
                J2534 Sim
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
