import React from 'react';
import { X } from 'lucide-react';
import { ModuleType } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    baudRate: number;
    deviceType: string;
    moduleType: ModuleType;
    j2534ProxyUrl: string;
  };
  onSave: (newSettings: { baudRate: number; deviceType: string; moduleType: ModuleType; j2534ProxyUrl: string }) => void;
}

export default function SettingsModal({ isOpen, onClose, settings, onSave }: SettingsModalProps) {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    onSave({
      baudRate: Number(formData.get('baudRate')),
      deviceType: formData.get('deviceType') as string,
      moduleType: formData.get('moduleType') as ModuleType,
      j2534ProxyUrl: formData.get('j2534ProxyUrl') as string,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-96 shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h3 className="text-zinc-100 font-semibold">Connection Settings</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-zinc-400">Target Module</label>
            <select 
              name="moduleType" 
              defaultValue={settings.moduleType}
              className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="P01">P01 (0411 PCM)</option>
              <option value="P59">P59 (1MB PCM)</option>
              <option value="BCM">BCM (Body Control Module)</option>
              <option value="TCM">TCM (Transmission)</option>
              <option value="L59">L59 (V6 PCM)</option>
              <option value="E38">E38 (Gen4 ECM)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-400">Device Type</label>
            <select 
              name="deviceType" 
              defaultValue={settings.deviceType}
              className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="generic">Generic Serial / ELM327</option>
              <option value="obdx">OBDX Pro VT</option>
              <option value="vcx">VCX Nano (Experimental)</option>
            </select>
            <p className="text-xs text-zinc-500">
              Select 'VCX Nano' for optimized high-speed buffers.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-400">Baud Rate</label>
            <select 
              name="baudRate" 
              defaultValue={settings.baudRate}
              className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="9600">9600</option>
              <option value="38400">38400</option>
              <option value="115200">115200 (Standard)</option>
              <option value="230400">230400</option>
              <option value="460800">460800 (High Speed)</option>
              <option value="921600">921600 (Ultra High)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-400">J2534 Proxy URL</label>
            <input 
              name="j2534ProxyUrl"
              type="text"
              defaultValue={settings.j2534ProxyUrl}
              placeholder="ws://127.0.0.1:2534"
              className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-300 focus:outline-none focus:border-emerald-500 font-mono text-sm"
            />
            <p className="text-[10px] text-zinc-500">
              WebSocket address of your local J2534 Proxy server.
            </p>
          </div>

          <div className="pt-4 flex justify-end space-x-2">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
