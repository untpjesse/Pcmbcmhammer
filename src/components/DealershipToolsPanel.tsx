import React, { useState } from 'react';
import { Car, Wrench, Settings, AlertCircle, Play, Download, ShieldCheck, Cpu, Monitor, Database } from 'lucide-react';

interface DealershipToolsPanelProps {
  isConnected: boolean;
}

interface OemTool {
  id: string;
  name: string;
  brand: string;
  description: string;
  icon: React.ElementType;
  status: 'installed' | 'not_installed' | 'update_available';
  version?: string;
  color: string;
}

const oemTools: OemTool[] = [
  {
    id: 'gds2',
    name: 'GDS2 / Tech2Win',
    brand: 'General Motors',
    description: 'Global Diagnostic System 2 for GM vehicles (2009+). Includes Tech2Win for legacy support.',
    icon: Car,
    status: 'installed',
    version: '2023.10.0',
    color: 'bg-blue-600'
  },
  {
    id: 'ids',
    name: 'Ford IDS',
    brand: 'Ford / Mazda',
    description: 'Integrated Diagnostic System for Ford, Lincoln, Mercury, and Mazda vehicles.',
    icon: Wrench,
    status: 'not_installed',
    color: 'bg-blue-800'
  },
  {
    id: 'techstream',
    name: 'Techstream',
    brand: 'Toyota / Lexus',
    description: 'Official diagnostic software for Toyota, Lexus, and Scion vehicles.',
    icon: Settings,
    status: 'installed',
    version: '18.00.008',
    color: 'bg-red-600'
  },
  {
    id: 'hds',
    name: 'HDS (Honda Diagnostic System)',
    brand: 'Honda / Acura',
    description: 'Dealership level diagnostics and programming for Honda and Acura.',
    icon: Cpu,
    status: 'not_installed',
    color: 'bg-gray-700'
  },
  {
    id: 'odis',
    name: 'ODIS',
    brand: 'VW / Audi / Skoda',
    description: 'Offboard Diagnostic Information System for VAG group vehicles.',
    icon: Database,
    status: 'update_available',
    version: '7.2.1',
    color: 'bg-sky-600'
  },
  {
    id: 'vida',
    name: 'VIDA',
    brand: 'Volvo',
    description: 'Vehicle Information & Diagnostics for Aftersales for Volvo cars.',
    icon: ShieldCheck,
    status: 'not_installed',
    color: 'bg-indigo-800'
  },
  {
    id: 'sdd',
    name: 'JLR SDD',
    brand: 'Jaguar / Land Rover',
    description: 'Symptom Driven Diagnostics for Jaguar and Land Rover vehicles.',
    icon: Monitor,
    status: 'not_installed',
    color: 'bg-emerald-700'
  },
  {
    id: 'ista',
    name: 'ISTA+',
    brand: 'BMW / Mini',
    description: 'Integrated Service Technical Application for BMW group.',
    icon: Car,
    status: 'not_installed',
    color: 'bg-slate-600'
  }
];

export function DealershipToolsPanel({ isConnected }: DealershipToolsPanelProps) {
  const [selectedTool, setSelectedTool] = useState<OemTool | null>(null);
  const [launching, setLaunching] = useState(false);

  const handleLaunch = (tool: OemTool) => {
    setLaunching(true);
    // Simulate launching the external OEM software
    setTimeout(() => {
      setLaunching(false);
      alert(`Launch signal sent for ${tool.name}. Ensure the VCX Nano is connected via USB or WiFi and the J2534 passthru driver is selected in the OEM software.`);
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">OEM Dealership Tools</h2>
          <p className="text-slate-400 mt-1">Launch and manage native manufacturer diagnostic software via J2534 Passthru.</p>
        </div>
        {!isConnected && (
          <div className="flex items-center px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-sm">
            <AlertCircle className="w-4 h-4 mr-2" />
            Connect device to enable passthru
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {oemTools.map((tool) => (
          <div 
            key={tool.id}
            onClick={() => setSelectedTool(tool)}
            className={`bg-slate-900 border rounded-xl p-5 cursor-pointer transition-all duration-200 ${
              selectedTool?.id === tool.id 
                ? 'border-vcx-blue shadow-[0_0_15px_rgba(0,163,255,0.15)] bg-slate-800' 
                : 'border-hardware-border hover:border-slate-600 hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-lg ${tool.color}`}>
                <tool.icon className="w-6 h-6 text-white" />
              </div>
              {tool.status === 'installed' && (
                <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded border border-emerald-500/20">
                  Ready
                </span>
              )}
              {tool.status === 'not_installed' && (
                <span className="px-2 py-1 bg-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-wider rounded border border-slate-700">
                  Not Installed
                </span>
              )}
              {tool.status === 'update_available' && (
                <span className="px-2 py-1 bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase tracking-wider rounded border border-amber-500/20">
                  Update
                </span>
              )}
            </div>
            
            <h3 className="text-lg font-bold text-white mb-1">{tool.name}</h3>
            <p className="text-xs font-medium text-vcx-blue uppercase tracking-wider mb-3">{tool.brand}</p>
            
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800">
              <span className="text-xs text-slate-500">
                {tool.version ? `v${tool.version}` : '---'}
              </span>
              <div className="w-2 h-2 rounded-full bg-slate-700" />
            </div>
          </div>
        ))}
      </div>

      {selectedTool && (
        <div className="mt-6 bg-slate-900 border border-hardware-border rounded-xl p-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center shadow-lg ${selectedTool.color}`}>
                <selectedTool.icon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{selectedTool.name}</h3>
                <p className="text-sm text-vcx-blue font-medium uppercase tracking-wider">{selectedTool.brand}</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              {selectedTool.status !== 'not_installed' ? (
                <button
                  onClick={() => handleLaunch(selectedTool)}
                  disabled={!isConnected || launching}
                  className={`flex items-center px-6 py-3 rounded-lg font-bold transition-all ${
                    isConnected && !launching
                      ? 'bg-vcx-blue hover:bg-blue-500 text-white shadow-lg shadow-blue-900/50'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {launching ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Launching...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Launch Software
                    </>
                  )}
                </button>
              ) : (
                <button className="flex items-center px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold transition-all border border-slate-700">
                  <Download className="w-5 h-5 mr-2" />
                  Download & Install
                </button>
              )}
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Description</h4>
                <p className="text-slate-300 leading-relaxed">{selectedTool.description}</p>
              </div>
              
              <div className="bg-slate-950 rounded-lg p-4 border border-slate-800">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Passthru Configuration</h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-vcx-blue mr-2" />
                    Device: <span className="font-mono ml-2 text-white">VCX Nano (J2534)</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-vcx-blue mr-2" />
                    Protocol: <span className="font-mono ml-2 text-white">ISO15765 / CAN / K-Line</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-vcx-blue mr-2" />
                    Status: 
                    <span className={`font-mono ml-2 ${isConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {isConnected ? 'Ready for Passthru' : 'Device Disconnected'}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-slate-950 rounded-lg p-4 border border-slate-800">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Capabilities</h4>
                <div className="space-y-2">
                  <CapabilityBadge label="Full System Diagnostics" active={true} />
                  <CapabilityBadge label="Bi-Directional Controls" active={true} />
                  <CapabilityBadge label="Module Programming" active={true} />
                  <CapabilityBadge label="Key Programming" active={selectedTool.id === 'techstream' || selectedTool.id === 'hds'} />
                  <CapabilityBadge label="Offline Coding" active={selectedTool.id === 'gds2' || selectedTool.id === 'odis'} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CapabilityBadge({ label, active }: { label: string, active: boolean }) {
  return (
    <div className={`flex items-center px-3 py-2 rounded border text-xs font-medium ${
      active 
        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
        : 'bg-slate-800/50 border-slate-800 text-slate-500'
    }`}>
      <div className={`w-1.5 h-1.5 rounded-full mr-2 ${active ? 'bg-emerald-400' : 'bg-slate-600'}`} />
      {label}
    </div>
  );
}
