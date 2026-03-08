import { useState, useEffect, useRef } from 'react';
import { ConnectionStatus, DeviceInfo, LogEntry, ModuleType } from './types';
import ConnectionPanel from './components/ConnectionPanel';
import HexViewer from './components/HexViewer';
import Logger from './components/Logger';
import SettingsModal from './components/SettingsModal';
import LiveDataPanel from './components/LiveDataPanel';
import DTCPanel from './components/DTCPanel';
import GraphPanel from './components/GraphPanel';
import TerminalPanel from './components/TerminalPanel';
import { Activity, Download, Upload, Zap, Settings, Database, FileCode, AlertTriangle, Gauge, Terminal, Copy, RefreshCw } from 'lucide-react';

export default function App() {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [fileData, setFileData] = useState<Uint8Array | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'hex' | 'live' | 'dtc' | 'graph' | 'terminal'>('hex');
  
  // Settings State
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<{
    baudRate: number;
    deviceType: string;
    moduleType: ModuleType;
  }>({
    baudRate: 115200,
    deviceType: 'generic',
    moduleType: 'P01'
  });

  // WebSerial State
  const [port, setPort] = useState<SerialPort | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const isWebSerialSupported = 'serial' in navigator;
  const [isSimulation, setIsSimulation] = useState(false);

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      message,
      type
    }]);
  };

  useEffect(() => {
    addLog('BCMHammer Web Interface initialized.', 'info');
    if (isWebSerialSupported) {
      addLog('WebSerial API supported.', 'success');
    } else {
      addLog('WebSerial API not supported in this browser.', 'warning');
    }
    addLog('Ready to connect to interface.', 'info');
    
    return () => {
      // Cleanup on unmount
      if (port && port.readable) {
        port.close().catch(console.error);
      }
    };
  }, []);

  const readLoop = async (port: SerialPort) => {
    if (!port.readable) return;
    
    const reader = port.readable.getReader();
    readerRef.current = reader;

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          reader.releaseLock();
          break;
        }
        if (value) {
          // Convert Uint8Array to Hex string for display
          const hex = Array.from(value)
            .map(b => b.toString(16).padStart(2, '0').toUpperCase())
            .join(' ');
          addLog(`RX: ${hex}`, 'info');
        }
      }
    } catch (error) {
      console.error('Read error:', error);
      addLog(`Read error: ${error}`, 'error');
    } finally {
      reader.releaseLock();
    }
  };

  const handleConnectSerial = async () => {
    if (!isWebSerialSupported) return;
    
    try {
      setStatus('connecting');
      addLog('Requesting serial port...', 'info');
      
      const selectedPort = await navigator.serial.requestPort();
      
      addLog(`Opening serial port at ${settings.baudRate} baud...`, 'info');
      if (settings.deviceType === 'vcx') {
        addLog('Optimizing buffers for VCX Nano...', 'success');
      }

      await selectedPort.open({ 
        baudRate: settings.baudRate,
        bufferSize: settings.deviceType === 'vcx' ? 65536 : undefined // Larger buffer for VCX Nano
      }); 
      
      setPort(selectedPort);
      setStatus('connected');
      setIsSimulation(false);
      addLog('Serial port connected.', 'success');
      
      // Start reading
      readLoop(selectedPort);
      
      // We don't have device info yet, but we are connected
      setDeviceInfo({
        protocol: 'Unknown',
        voltage: 0,
        vin: 'Unknown',
        osid: 'Unknown'
      });

    } catch (error) {
      console.error('Connection error:', error);
      setStatus('disconnected');
      addLog(`Connection failed: ${error}`, 'error');
    }
  };

  const handleSimulateConnection = () => {
    setIsSimulation(true);
    setStatus('connecting');
    addLog('Initiating simulated connection...', 'info');
    
    setTimeout(() => {
      addLog('Interface found: OBDX Pro VT (Simulated)', 'success');
      addLog('Scanning bus for modules...', 'info');
      
      setTimeout(() => {
        setStatus('connected');
        
        let protocol = 'VPW 4x';
        let osid = '12212156';
        let moduleName = 'PCM (P01)';
        
        switch(settings.moduleType) {
            case 'P59': moduleName = 'PCM (P59)'; osid = '12587603'; break;
            case 'BCM': moduleName = 'BCM'; osid = '10367609'; protocol = 'VPW 1x'; break;
            case 'TCM': moduleName = 'TCM'; osid = '24226863'; break;
            case 'L59': moduleName = 'PCM (L59)'; osid = '12592618'; break;
            case 'E38': moduleName = 'ECM (E38)'; osid = '12612381'; protocol = 'CAN 500k'; break;
            default: break; // P01 is default
        }

        setDeviceInfo({
          protocol: protocol,
          voltage: 12.4,
          vin: '1GNDxxxxxxxxxxxxx',
          osid: osid
        });
        addLog(`Connected to ${moduleName}`, 'success');
        addLog('VIN: 1GNDxxxxxxxxxxxxx', 'info');
        addLog(`OSID: ${osid}`, 'info');
      }, 1500);
    }, 1500);
  };

  const handleDisconnect = async () => {
    if (isSimulation) {
      setStatus('disconnected');
      setDeviceInfo(null);
      setIsSimulation(false);
      addLog('Disconnected from simulated interface', 'warning');
    } else {
      if (port) {
        try {
          if (readerRef.current) {
            await readerRef.current.cancel();
            readerRef.current = null;
          }
          await port.close();
          setPort(null);
          setStatus('disconnected');
          setDeviceInfo(null);
          addLog('Serial port disconnected', 'warning');
        } catch (error) {
          console.error('Disconnect error:', error);
          addLog(`Error disconnecting: ${error}`, 'error');
        }
      }
    }
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result instanceof ArrayBuffer) {
        setFileData(new Uint8Array(e.target.result));
        setFileName(file.name);
        addLog(`Loaded file: ${file.name} (${file.size} bytes)`, 'success');
        setActiveTab('hex');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleRead = async () => {
    if (status !== 'connected') {
      addLog('Error: No device connected', 'error');
      return;
    }

    if (isSimulation) {
      addLog(`Starting Read Operation for ${settings.moduleType} (Simulated)...`, 'info');
      addLog('Requesting Seed...', 'info');
      setTimeout(() => {
          addLog('Key sent. Unlocked.', 'success');
          addLog('Reading flash memory (0x000000 - 0x080000)...', 'info');
          // Simulate progress
          let progress = 0;
          const interval = setInterval(() => {
              progress += 10;
              if (progress >= 100) {
                  clearInterval(interval);
                  addLog('Read Complete. Checksum verified.', 'success');
                  // Create a dummy file for demonstration if none loaded
                  if (!fileData) {
                      const dummyData = new Uint8Array(512 * 1024); // 512KB
                      for(let i=0; i<dummyData.length; i++) dummyData[i] = Math.floor(Math.random() * 256);
                      setFileData(dummyData);
                      setFileName(`read_${settings.moduleType.toLowerCase()}.bin`);
                      setActiveTab('hex');
                  }
              }
          }, 200);
      }, 1000);
    } else {
      // Real WebSerial Read Logic (Placeholder)
      addLog('Sending Read Command...', 'info');
      if (port && port.writable) {
        const writer = port.writable.getWriter();
        try {
          // Example: Send a basic ID request or similar. 
          // Since we don't know the exact protocol, we'll just send a test byte or string.
          // For VPW, it's usually raw bytes.
          const data = new Uint8Array([0x6C, 0x10, 0xF0, 0x01, 0x00]); // Example VPW header
          await writer.write(data);
          addLog(`TX: ${Array.from(data).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')}`, 'info');
          addLog('Command sent. Waiting for response...', 'info');
        } catch (error) {
          addLog(`Write error: ${error}`, 'error');
        } finally {
          writer.releaseLock();
        }
      }
    }
  };

  const handleWrite = async () => {
    if (status !== 'connected') {
      addLog('Error: No device connected', 'error');
      return;
    }
    if (!fileData) {
        addLog('Error: No file loaded to write', 'error');
        return;
    }

    if (isSimulation) {
      addLog(`Starting Write Operation for ${settings.moduleType} (Simulated)...`, 'warning');
      addLog('Erasing flash...', 'info');
      setTimeout(() => {
          addLog('Writing banks...', 'info');
          let progress = 0;
          const interval = setInterval(() => {
              progress += 5;
              if (progress >= 100) {
                  clearInterval(interval);
                  addLog('Write Complete. Verifying...', 'success');
                  setTimeout(() => addLog('Verification Successful.', 'success'), 500);
              }
          }, 200);
      }, 1500);
    } else {
       addLog('Write not implemented for WebSerial yet. Protocol implementation required.', 'warning');
    }
  };

  const handleCloneBCM = async () => {
    if (status !== 'connected') {
      addLog('Error: No device connected', 'error');
      return;
    }
    
    if (isSimulation) {
        addLog('Starting BCM Clone Procedure...', 'info');
        addLog('Reading Source BCM Data...', 'info');
        
        setTimeout(() => {
            addLog('Source Data Read. Please connect Target BCM.', 'warning');
            // In a real app, we'd probably have a modal or prompt here.
            // For simulation, we'll just pretend the user swapped it after a delay.
            setTimeout(() => {
                addLog('Writing to Target BCM...', 'info');
                setTimeout(() => {
                    addLog('Clone Complete. VIN and Options transferred.', 'success');
                }, 2000);
            }, 3000);
        }, 2000);
    } else {
        addLog('BCM Clone not implemented for WebSerial yet.', 'warning');
    }
  };

  const handleResetBCM = async () => {
    if (status !== 'connected') {
      addLog('Error: No device connected', 'error');
      return;
    }

    if (isSimulation) {
        addLog('Initiating BCM Factory Reset...', 'warning');
        addLog('Security Access Granted.', 'success');
        setTimeout(() => {
            addLog('Clearing VIN...', 'info');
            setTimeout(() => {
                addLog('Clearing VATS/Passlock data...', 'info');
                setTimeout(() => {
                    addLog('Reset Complete. BCM is now "New".', 'success');
                    addLog('Ready for VATS Relearn.', 'info');
                }, 1500);
            }, 1000);
        }, 1000);
    } else {
        addLog('BCM Reset not implemented for WebSerial yet.', 'warning');
    }
  };

  const handleTerminalSend = async (command: string) => {
    // Convert hex string to Uint8Array
    const hexBytes = command.replace(/\s+/g, '').match(/.{1,2}/g)?.map(byte => parseInt(byte, 16));
    
    if (!hexBytes) {
      addLog('Invalid hex command format', 'error');
      return;
    }

    if (isSimulation) {
      addLog(`TX: ${command.toUpperCase()}`, 'info');
      // Simulate echo or simple response
      setTimeout(() => {
        addLog('RX: 6C F0 10 01 00 (Simulated Response)', 'info');
      }, 100);
    } else {
      if (port && port.writable) {
        const writer = port.writable.getWriter();
        try {
          const data = new Uint8Array(hexBytes);
          await writer.write(data);
          addLog(`TX: ${Array.from(data).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')}`, 'info');
        } catch (error) {
          addLog(`Write error: ${error}`, 'error');
        } finally {
          writer.releaseLock();
        }
      }
    }
  };

  return (
    <div className="flex h-screen bg-black text-zinc-300 font-sans overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 flex flex-col border-r border-zinc-800 bg-zinc-950/50">
        <div className="p-4 border-b border-zinc-800 flex items-center space-x-3">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-900/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-zinc-100 tracking-tight">BCMHammer</h1>
            <p className="text-xs text-zinc-500">Web Interface v1.0.0</p>
          </div>
        </div>

        <div className="p-4 space-y-6 flex-1 overflow-y-auto">
          <ConnectionPanel 
            status={status} 
            deviceInfo={deviceInfo}
            onConnect={handleConnectSerial}
            onDisconnect={handleDisconnect}
            onSimulate={handleSimulateConnection}
            isWebSerialSupported={isWebSerialSupported}
          />

          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-1">Operations</h3>
            <button 
                onClick={handleRead}
                disabled={status !== 'connected'}
                className="w-full flex items-center justify-between p-3 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-lg transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center">
                <Download className="w-4 h-4 text-emerald-500 mr-3" />
                <span className="text-sm font-medium text-zinc-300 group-hover:text-white">Read {settings.moduleType}</span>
              </div>
            </button>
            <button 
                onClick={handleWrite}
                disabled={status !== 'connected'}
                className="w-full flex items-center justify-between p-3 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-lg transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center">
                <Upload className="w-4 h-4 text-amber-500 mr-3" />
                <span className="text-sm font-medium text-zinc-300 group-hover:text-white">Write {settings.moduleType}</span>
              </div>
            </button>
            <button 
                onClick={() => setActiveTab('live')}
                className={`w-full flex items-center justify-between p-3 border rounded-lg transition-all group ${
                    activeTab === 'live' 
                    ? 'bg-zinc-800 border-zinc-600' 
                    : 'bg-zinc-900/50 hover:bg-zinc-800 border-zinc-800 hover:border-zinc-700'
                }`}
            >
              <div className="flex items-center">
                <Gauge className="w-4 h-4 text-blue-500 mr-3" />
                <span className="text-sm font-medium text-zinc-300 group-hover:text-white">Live Data</span>
              </div>
            </button>
            <button 
                onClick={() => setActiveTab('graph')}
                className={`w-full flex items-center justify-between p-3 border rounded-lg transition-all group ${
                    activeTab === 'graph' 
                    ? 'bg-zinc-800 border-zinc-600' 
                    : 'bg-zinc-900/50 hover:bg-zinc-800 border-zinc-800 hover:border-zinc-700'
                }`}
            >
              <div className="flex items-center">
                <Activity className="w-4 h-4 text-emerald-500 mr-3" />
                <span className="text-sm font-medium text-zinc-300 group-hover:text-white">Graphing</span>
              </div>
            </button>
            <button 
                onClick={() => setActiveTab('dtc')}
                className={`w-full flex items-center justify-between p-3 border rounded-lg transition-all group ${
                    activeTab === 'dtc' 
                    ? 'bg-zinc-800 border-zinc-600' 
                    : 'bg-zinc-900/50 hover:bg-zinc-800 border-zinc-800 hover:border-zinc-700'
                }`}
            >
              <div className="flex items-center">
                <AlertTriangle className="w-4 h-4 text-amber-500 mr-3" />
                <span className="text-sm font-medium text-zinc-300 group-hover:text-white">DTCs</span>
              </div>
            </button>
            <button 
                onClick={() => setActiveTab('terminal')}
                className={`w-full flex items-center justify-between p-3 border rounded-lg transition-all group ${
                    activeTab === 'terminal' 
                    ? 'bg-zinc-800 border-zinc-600' 
                    : 'bg-zinc-900/50 hover:bg-zinc-800 border-zinc-800 hover:border-zinc-700'
                }`}
            >
              <div className="flex items-center">
                <Terminal className="w-4 h-4 text-zinc-400 mr-3" />
                <span className="text-sm font-medium text-zinc-300 group-hover:text-white">Terminal</span>
              </div>
            </button>
            <button 
                onClick={() => setActiveTab('hex')}
                className={`w-full flex items-center justify-between p-3 border rounded-lg transition-all group ${
                    activeTab === 'hex' 
                    ? 'bg-zinc-800 border-zinc-600' 
                    : 'bg-zinc-900/50 hover:bg-zinc-800 border-zinc-800 hover:border-zinc-700'
                }`}
            >
              <div className="flex items-center">
                <FileCode className="w-4 h-4 text-purple-500 mr-3" />
                <span className="text-sm font-medium text-zinc-300 group-hover:text-white">Hex Viewer</span>
              </div>
            </button>
          </div>

          {settings.moduleType === 'BCM' && (
            <div className="space-y-2 mt-6">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-1">BCM Functions</h3>
                <button 
                    onClick={handleCloneBCM}
                    disabled={status !== 'connected'}
                    className="w-full flex items-center justify-between p-3 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-lg transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                <div className="flex items-center">
                    <Copy className="w-4 h-4 text-cyan-500 mr-3" />
                    <span className="text-sm font-medium text-zinc-300 group-hover:text-white">Clone BCM</span>
                </div>
                </button>
                <button 
                    onClick={handleResetBCM}
                    disabled={status !== 'connected'}
                    className="w-full flex items-center justify-between p-3 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-lg transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                <div className="flex items-center">
                    <RefreshCw className="w-4 h-4 text-rose-500 mr-3" />
                    <span className="text-sm font-medium text-zinc-300 group-hover:text-white">Reset to New</span>
                </div>
                </button>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-zinc-800">
            <button 
              onClick={() => setSettingsOpen(true)}
              className="w-full flex items-center justify-center p-2 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
                <Settings className="w-4 h-4 mr-2" />
                <span className="text-xs">Settings</span>
            </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-4 min-h-0">
            {activeTab === 'hex' && (
                <HexViewer data={fileData} fileName={fileName} onUpload={handleFileUpload} />
            )}
            {activeTab === 'live' && (
                <LiveDataPanel isConnected={status === 'connected'} />
            )}
            {activeTab === 'graph' && (
                <GraphPanel isConnected={status === 'connected'} />
            )}
            {activeTab === 'dtc' && (
                <DTCPanel isConnected={status === 'connected'} />
            )}
            {activeTab === 'terminal' && (
                <TerminalPanel isConnected={status === 'connected'} onSend={handleTerminalSend} logs={logs} />
            )}
        </div>
        <div className="h-64 p-4 pt-0 min-h-0">
            <Logger logs={logs} />
        </div>
      </div>

      <SettingsModal 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSave={setSettings}
      />
    </div>
  );
}

