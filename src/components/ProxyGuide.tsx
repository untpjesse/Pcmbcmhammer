import React, { useState } from 'react';
import { ExternalLink, Terminal, Download, ShieldCheck, Zap, Copy, Check, Info, AlertCircle } from 'lucide-react';

interface ProxyGuideProps {
  onAutoSetupProxy: () => void;
}

export default function ProxyGuide({ onAutoSetupProxy }: ProxyGuideProps) {
  const [copied, setCopied] = useState(false);
  const installCommand = 'irm https://raw.githubusercontent.com/Xplatforms/J2534_OIP_Wrapper/main/install.ps1 | iex';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(installCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="hardware-card p-4 bg-slate-900/50 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-vcx-blue/10 flex items-center justify-center border border-vcx-blue/20">
            <ShieldCheck className="w-6 h-6 text-vcx-blue" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">Interface Proxy Setup</h2>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Hardware Bridge Configuration</p>
          </div>
        </div>
        <button
          onClick={onAutoSetupProxy}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest rounded border border-emerald-400/30 shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all flex items-center group"
        >
          <Zap className="w-3.5 h-3.5 mr-2 group-hover:animate-pulse" />
          One-Click Setup
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-8">
        <section className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Download className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">1. Deployment</h4>
          </div>
          
          <div className="hardware-card p-5 bg-slate-900/30 space-y-4">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              To interface with physical J2534 hardware (VCX Nano, Tactrix, Mongoose), a local <span className="text-vcx-blue font-bold">WebSocket Bridge</span> must be active on the host Windows machine. This bridge facilitates low-latency communication between the browser sandbox and native PassThru DLLs.
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Quick Install (PowerShell Admin)</span>
                <button 
                  onClick={copyToClipboard}
                  className="flex items-center space-x-1.5 text-[9px] font-bold text-vcx-blue hover:text-blue-400 transition-colors uppercase tracking-widest"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy Command'}</span>
                </button>
              </div>
              <div className="bg-black/60 p-3 rounded-lg border border-slate-800 font-mono text-[10px] text-emerald-500 break-all leading-relaxed shadow-inner">
                {installCommand}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <a 
                href="https://github.com/jakka351/OpenJ2534" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hardware-button-secondary px-3 py-1.5 text-[9px] flex items-center"
              >
                OpenJ2534 Source <ExternalLink className="w-3 h-3 ml-2" />
              </a>
              <a 
                href="https://github.com/Xplatforms/J2534_OIP_Wrapper" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hardware-button-secondary px-3 py-1.5 text-[9px] flex items-center"
              >
                OIP Wrapper <ExternalLink className="w-3 h-3 ml-2" />
              </a>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">2. Initialization</h4>
          </div>
          
          <div className="hardware-card p-5 bg-slate-900/30 space-y-4">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Launch the proxy executable (<code className="text-slate-200 bg-slate-800 px-1 rounded">j2534-proxy.exe</code>) with <span className="text-amber-500 font-bold">Administrative Privileges</span>. The service will bind to the default local gateway:
            </p>
            <div className="bg-black/40 p-3 rounded-lg border border-slate-800 font-mono text-xs text-blue-400 flex items-center justify-center shadow-inner">
              ws://127.0.0.1:2534
            </div>
            <button
              onClick={onAutoSetupProxy}
              className="w-full py-2.5 bg-vcx-blue/20 hover:bg-vcx-blue/30 text-vcx-blue text-[10px] font-bold uppercase tracking-widest rounded border border-vcx-blue/30 transition-all flex items-center justify-center group"
            >
              <Zap className="w-3.5 h-3.5 mr-2 group-hover:animate-bounce" />
              Test & Auto-Connect Link
            </button>
            <div className="p-3 bg-blue-900/10 border border-blue-900/20 rounded-lg flex items-start space-x-3">
              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-[10px] text-blue-300/80 leading-relaxed italic">
                  Note: Ensure your device drivers (e.g., VX Manager for VCX Nano) are correctly installed and the hardware is recognized by Windows before starting the proxy.
                </p>
                <div className="pt-2 border-t border-blue-900/30">
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">VCX Nano Optimization:</p>
                  <p className="text-[9px] text-slate-400 leading-relaxed">
                    Open <span className="text-slate-200">VX Manager</span>, ensure the "Diagnostic" tab shows your device, and that the <span className="text-slate-200">PASSTHRU</span> driver is installed. For GM vehicles, also install the <span className="text-slate-200">GDS2/T2W</span> driver.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">3. Verification</h4>
          </div>
          
          <div className="hardware-card p-5 bg-slate-900/30 space-y-4">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Once the service is active, navigate to the <span className="text-white font-bold">Interface Status</span> panel and select <span className="text-vcx-blue font-bold">Scan J2534 Bus</span>. The suite will automatically discover all registered PassThru devices available on the host system.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-950/50 rounded border border-slate-800">
                <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">Status Check</p>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                  <span className="text-[10px] text-slate-300 font-mono">Proxy Listening</span>
                </div>
              </div>
              <div className="p-3 bg-slate-950/50 rounded border border-slate-800">
                <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">Bus Traffic</p>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[10px] text-slate-300 font-mono">Idle / Ready</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">4. Troubleshooting</h4>
          </div>
          
          <div className="hardware-card p-5 bg-slate-900/30 space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
              <p className="text-[11px] text-slate-400"><span className="text-slate-200 font-bold">Connection Refused:</span> Ensure the proxy is running as Administrator and your firewall isn't blocking port 2534.</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
              <p className="text-[11px] text-slate-400"><span className="text-slate-200 font-bold">No Devices Found:</span> Check VX Manager or your device's native utility to ensure the hardware is "Connected" to the PC.</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
              <p className="text-[11px] text-slate-400"><span className="text-slate-200 font-bold">SSL/TLS Error:</span> Use the <code className="text-slate-200">ws://</code> protocol (unsecured) for local connections to avoid certificate mismatches.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
