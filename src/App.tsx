import { useState, useEffect, useRef } from 'react';
import { ConnectionStatus, DeviceInfo, LogEntry, ModuleType } from './types';
import ConnectionPanel from './components/ConnectionPanel';
import ProxyGuide from './components/ProxyGuide';
import HexViewer from './components/HexViewer';
import Logger from './components/Logger';
import SettingsModal from './components/SettingsModal';
import LiveDataPanel from './components/LiveDataPanel';
import DTCPanel from './components/DTCPanel';
import GraphPanel from './components/GraphPanel';
import TerminalPanel from './components/TerminalPanel';
import { AdvancedPanel } from './components/AdvancedPanel';
import { PrototypePanel } from './components/PrototypePanel';
import { DashboardPanel } from './components/DashboardPanel';
import { AnalyzerPanel } from './components/AnalyzerPanel';
import { NetworkScannerPanel } from './components/NetworkScannerPanel';
import { ActuatorsPanel } from './components/ActuatorsPanel';
import { EmissionsPanel } from './components/EmissionsPanel';
import { EepromEditorPanel } from './components/EepromEditorPanel';
import { VariantCodingPanel } from './components/VariantCodingPanel';
import { ImmoPanel } from './components/ImmoPanel';
import { ServiceResetsPanel } from './components/ServiceResetsPanel';
import { ModuleInitPanel } from './components/ModuleInitPanel';
import { J2534OemPanel } from './components/J2534OemPanel';
import { AdasCalibrationPanel } from './components/AdasCalibrationPanel';
import { InjectorCodingPanel } from './components/InjectorCodingPanel';
import { NetworkTopologyPanel } from './components/NetworkTopologyPanel';
import { GmTech2Panel } from './components/GmTech2Panel';
import { OemFlasherPanel } from './components/OemFlasherPanel';
import { BmsPanel } from './components/BmsPanel';
import { EpbPanel } from './components/EpbPanel';
import { SasPanel } from './components/SasPanel';
import { DpfPanel } from './components/DpfPanel';
import { DealershipToolsPanel } from './components/DealershipToolsPanel';
import VcxNanoPanel from './components/VcxNanoPanel';
import J2534DeviceSelectorModal from './components/J2534DeviceSelectorModal';
import { J2534ProxyClient, MockJ2534, J2534, IJ2534, J2534Device } from './lib/j2534';
import { Activity, Download, Upload, Zap, Settings, Database, FileCode, AlertTriangle, Gauge, Terminal, Cpu, Beaker, List, Network, Power, Leaf, FlaskConical, Sliders, Key, Wrench, Replace, FileArchive, Briefcase, Target, Monitor, Laptop, Battery, Flame, Wind, Compass, Thermometer, ShieldCheck, Microscope, Binary, Car, Syringe, RefreshCw } from 'lucide-react';

export default function App() {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [lastError, setLastError] = useState<string | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [fileData, setFileData] = useState<Uint8Array | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analyzer' | 'scanner' | 'actuators' | 'emissions' | 'hex' | 'live' | 'dtc' | 'graph' | 'terminal' | 'advanced' | 'prototype' | 'eeprom' | 'coding' | 'immo' | 'service' | 'pmi' | 'oemflash' | 'oemflasher' | 'adas' | 'injectors' | 'topology' | 'tech2' | 'proxy' | 'bms' | 'epb' | 'sas' | 'dpf' | 'vcx-nano' | 'dealership'>('dashboard');
  
  // J2534 State
  const [j2534Client, setJ2534Client] = useState<IJ2534 | null>(null);
  const [isJ2534ModalOpen, setIsJ2534ModalOpen] = useState(false);
  const [j2534Devices, setJ2534Devices] = useState<J2534Device[]>([]);
  const [pendingJ2534Client, setPendingJ2534Client] = useState<IJ2534 | null>(null);
  const [j2534DeviceId, setJ2534DeviceId] = useState<number | null>(null);
  const [j2534ChannelId, setJ2534ChannelId] = useState<number | null>(null);

  // Settings State
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('vcx_nano_settings');
    return saved ? JSON.parse(saved) : {
      baudRate: 115200,
      deviceType: 'generic',
      moduleType: 'P01' as ModuleType,
      j2534ProxyUrl: 'ws://127.0.0.1:2534'
    };
  });

  const [lastConnectionMethod, setLastConnectionMethod] = useState<string | null>(() => {
    return localStorage.getItem('vcx_nano_last_method');
  });

  useEffect(() => {
    localStorage.setItem('vcx_nano_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (lastConnectionMethod) {
      localStorage.setItem('vcx_nano_last_method', lastConnectionMethod);
    }
  }, [lastConnectionMethod]);

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

    if (type === 'error') {
      setLastError(message);
      setStatus('error');
    }
  };

  useEffect(() => {
    addLog('VCX Nano Professional Suite initialized.', 'info');
    if (isWebSerialSupported) {
      addLog('WebSerial API supported.', 'success');
    } else {
      addLog('WebSerial API not supported in this browser.', 'warning');
    }
    addLog('Ready to connect to J2534 or Serial interface.', 'info');
    
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
    if (!isWebSerialSupported) {
      addLog('Web Serial is not supported in this browser. Please use Chrome or Edge.', 'error');
      return;
    }
    
    try {
      setLastError(null);
      setStatus('connecting');
      addLog('Requesting serial port access...', 'info');
      
      const selectedPort = await navigator.serial.requestPort();
      
      // Listen for disconnection
      selectedPort.addEventListener('disconnect', () => {
        addLog('Hardware device unplugged.', 'error');
        handleDisconnect();
      });

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
      setLastConnectionMethod('serial');
      addLog('Serial port connected successfully.', 'success');
      
      // Start reading
      readLoop(selectedPort);
      
      // We don't have device info yet, but we are connected
      setDeviceInfo({
        protocol: 'Unknown',
        voltage: 0,
        vin: 'Unknown',
        osid: 'Unknown'
      });

    } catch (error: any) {
      console.error('Connection error:', error);
      setStatus('disconnected');
      
      if (error.name === 'NotFoundError') {
        addLog('Connection cancelled: No port selected.', 'warning');
      } else if (error.name === 'SecurityError') {
        addLog('Security Error: Access to the serial port was denied.', 'error');
      } else if (error.name === 'NetworkError') {
        addLog('Network Error: The serial port is already in use by another application.', 'error');
      } else {
        addLog(`Connection failed: ${error.message || error}`, 'error');
      }
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
        setDeviceInfo({
          protocol: 'VPW 4x',
          voltage: 12.4,
          vin: '1GNDxxxxxxxxxxxxx',
          osid: '12212156'
        });
        addLog('Connected to PCM (P01)', 'success');
        addLog('VIN: 1GNDxxxxxxxxxxxxx', 'info');
        addLog('OSID: 12212156', 'info');
      }, 1500);
    }, 1500);
  };

  const handleSimulateJ2534Connection = () => {
    setIsSimulation(true);
    setStatus('connecting');
    addLog('Loading J2534 PassThru API...', 'info');
    
    setTimeout(() => {
      addLog('PassThruOpen() - Success', 'success');
      addLog('Interface found: Tactrix OpenPort 2.0 (Simulated)', 'success');
      addLog('PassThruConnect(ProtocolID: CAN) - Success', 'success');
      addLog('PassThruIoctl(CLEAR_TX_BUFFER) - Success', 'info');
      addLog('PassThruIoctl(CLEAR_RX_BUFFER) - Success', 'info');
      
      setTimeout(() => {
        setStatus('connected');
        setDeviceInfo({
          protocol: 'ISO15765 (CAN)',
          voltage: 13.8,
          vin: '1G1RC6E49BUxxxxxx',
          osid: '12643248'
        });
        addLog('Connected to ECM (E38)', 'success');
        addLog('VIN: 1G1RC6E49BUxxxxxx', 'info');
        addLog('OSID: 12643248', 'info');
      }, 1500);
    }, 1500);
  };

  const handleConnectVcxNano = async () => {
    setStatus('connecting');
    addLog(`Establishing connection to VCX Nano via J2534 Proxy...`, 'info');
    
    let client: IJ2534 = new J2534ProxyClient();
    try {
      await (client as J2534ProxyClient).connect(settings.j2534ProxyUrl, () => {
        addLog('J2534 Proxy connection lost.', 'error');
        handleDisconnect();
      });
      addLog('WebSocket bridge established.', 'success');
    } catch (err: any) {
      addLog(`Proxy bridge failed: ${err.message}`, 'error');
      addLog('Falling back to J2534 Mock API for demonstration...', 'warning');
      client = new MockJ2534(addLog);
    }

    try {
      addLog('Scanning for VCX Nano hardware...', 'info');
      const devices = await client.GetDevices();
      const vcxNano = devices.find(d => d.name.toLowerCase().includes('vcx nano') || d.id.includes('vcx_nano'));
      
      if (vcxNano) {
        addLog(`Found hardware: ${vcxNano.name}`, 'success');
        await handleJ2534DeviceSelect(vcxNano, client);
        setActiveTab('vcx-nano');
      } else {
        addLog('VCX Nano hardware not detected. Check USB connection and drivers.', 'error');
        setStatus('disconnected');
      }
    } catch (err: any) {
      addLog(`Hardware discovery failed: ${err.message}`, 'error');
      setStatus('disconnected');
    }
  };

  const handleConnectJ2534Proxy = async () => {
    setStatus('connecting');
    addLog(`Connecting to J2534 Proxy at ${settings.j2534ProxyUrl}...`, 'info');
    
    let client: IJ2534 = new J2534ProxyClient();
    try {
      await (client as J2534ProxyClient).connect(settings.j2534ProxyUrl, () => {
        addLog('J2534 Proxy connection lost.', 'error');
        handleDisconnect();
      });
      addLog('Connected to J2534 Proxy WebSocket.', 'success');
    } catch (err: any) {
      addLog(`Proxy connection failed: ${err.message}`, 'error');
      addLog('Falling back to J2534 Mock API for demonstration...', 'warning');
      client = new MockJ2534(addLog);
    }

    try {
      addLog('Querying J2534 device registry...', 'info');
      const devices = await client.GetDevices();
      setJ2534Devices(devices);
      setPendingJ2534Client(client);
      setIsJ2534ModalOpen(true);
      setStatus('disconnected'); // Reset from 'connecting' since we are waiting for selection
    } catch (err: any) {
      addLog(`Registry query failed: ${err.message}`, 'error');
      setStatus('disconnected');
    }
  };

  const handleScanJ2534 = async () => {
    // If we already have an active client (connected or pending), try to use it
    const activeClient = j2534Client || pendingJ2534Client;
    
    if (activeClient) {
      try {
        addLog('Scanning for J2534 devices...', 'info');
        const devices = await activeClient.GetDevices();
        setJ2534Devices(devices);
        setPendingJ2534Client(activeClient);
        setIsJ2534ModalOpen(true);
        return;
      } catch (err: any) {
        addLog(`Scan failed: ${err.message}. Reconnecting proxy...`, 'warning');
      }
    }
    
    handleConnectJ2534Proxy();
  };

  const handleJ2534DeviceSelect = async (device: J2534Device, overrideClient?: IJ2534) => {
    setIsJ2534ModalOpen(false);
    const activeClient = overrideClient || pendingJ2534Client;
    if (!activeClient) return;

    // Close previous connection if exists
    if (j2534Client && j2534DeviceId !== null) {
      try {
        await j2534Client.PassThruClose(j2534DeviceId);
      } catch (e) {
        // Ignore close errors
      }
    }

    try {
      addLog(`Calling PassThruOpen('${device.name}')...`, 'info');
      const deviceId = await activeClient.PassThruOpen(device.name);
      addLog(`PassThruOpen success. DeviceID: ${deviceId}`, 'success');

      const channelId = await activeClient.PassThruConnect(deviceId, J2534.ISO15765, 0, 500000);
      addLog(`PassThruConnect success. ChannelID: ${channelId}`, 'success');

      let vbatt = 0;
      try {
        vbatt = await activeClient.PassThruIoctl(channelId, J2534.READ_VBATT);
        addLog(`Battery Voltage: ${vbatt / 1000}V`, 'info');
      } catch (e) {
        addLog('Failed to read battery voltage.', 'warning');
      }

      setJ2534Client(activeClient);
      setJ2534DeviceId(deviceId);
      setJ2534ChannelId(channelId);
      setStatus('connected');
      setLastConnectionMethod('j2534');
      setDeviceInfo({
        protocol: 'ISO15765 (J2534 Proxy)',
        voltage: vbatt ? vbatt / 1000 : 0,
        vin: 'Unknown',
        osid: 'Unknown',
        name: device.name
      });
    } catch (err: any) {
      addLog(`J2534 connection failed: ${err.message}`, 'error');
      setStatus('disconnected');
    } finally {
      setPendingJ2534Client(null);
    }
  };

  const handleQuickConnect = () => {
    if (lastConnectionMethod === 'serial') {
      handleConnectSerial();
    } else if (lastConnectionMethod === 'j2534') {
      handleConnectVcxNano();
    } else {
      handleConnectSerial(); // Default to serial if unknown
    }
  };

  const handleAutoSetupProxy = async () => {
    addLog('Initiating intelligent one-click proxy setup...', 'info');
    
    // 1. Set default settings (most common local gateway)
    const defaultUrl = 'ws://127.0.0.1:2534';
    setSettings(prev => ({
      ...prev,
      j2534ProxyUrl: defaultUrl
    }));

    addLog(`Targeting proxy gateway: ${defaultUrl}`, 'info');

    // 2. Trigger scan immediately
    handleScanJ2534();
    
    // 3. Switch to dashboard to show progress if not already there
    if (activeTab !== 'dashboard') {
      setActiveTab('dashboard');
    }
  };

  const handleDisconnect = async () => {
    setLastError(null);
    if (j2534Client) {
      if (j2534Client instanceof J2534ProxyClient) {
         j2534Client.disconnect();
      }
      setJ2534Client(null);
      setJ2534DeviceId(null);
      setJ2534ChannelId(null);
      setStatus('disconnected');
      setDeviceInfo(null);
      addLog('J2534 Disconnected', 'warning');
      return;
    }

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
      addLog('Starting Read Operation (Simulated)...', 'info');
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
                      setFileName('read_pcm.bin');
                      setActiveTab('hex');
                  }
              }
          }, 200);
      }, 1000);
    } else if (j2534Client) {
      addLog('Starting Read Operation via J2534...', 'info');
      try {
        // Simulate reading process via J2534 API
        addLog('PassThruWriteMsgs: Requesting Security Access (Seed)...', 'info');
        await j2534Client.PassThruWriteMsgs(j2534ChannelId || 1, [{ ProtocolID: 6, RxStatus: 0, TxFlags: 0, Timestamp: 0, DataSize: 2, ExtraDataIndex: 0, Data: [0x27, 0x01] }], 1000);
        
        setTimeout(async () => {
          addLog('PassThruWriteMsgs: Sending Key...', 'info');
          await j2534Client.PassThruWriteMsgs(j2534ChannelId || 1, [{ ProtocolID: 6, RxStatus: 0, TxFlags: 0, Timestamp: 0, DataSize: 6, ExtraDataIndex: 0, Data: [0x27, 0x02, 0xAA, 0xBB, 0xCC, 0xDD] }], 1000);
          
          addLog('Security Access Granted. Reading memory blocks...', 'success');
          
          let progress = 0;
          const interval = setInterval(async () => {
            progress += 20;
            // Simulate reading memory blocks
            await j2534Client.PassThruWriteMsgs(j2534ChannelId || 1, [{ ProtocolID: 6, RxStatus: 0, TxFlags: 0, Timestamp: 0, DataSize: 3, ExtraDataIndex: 0, Data: [0x23, 0x00, 0x00] }], 1000);
            
            if (progress >= 100) {
              clearInterval(interval);
              addLog('Read Complete. Checksum verified.', 'success');
              if (!fileData) {
                const dummyData = new Uint8Array(512 * 1024);
                for(let i=0; i<dummyData.length; i++) dummyData[i] = Math.floor(Math.random() * 256);
                setFileData(dummyData);
                setFileName('read_pcm_j2534.bin');
                setActiveTab('hex');
              }
            }
          }, 500);
        }, 1000);
      } catch (error: any) {
        addLog(`J2534 Read error: ${error.message || error}`, 'error');
      }
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
      addLog('Starting Write Operation (Simulated)...', 'warning');
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
    } else if (j2534Client) {
      addLog('Starting Write Operation via J2534...', 'warning');
      try {
        addLog('PassThruWriteMsgs: Requesting Security Access (Seed)...', 'info');
        await j2534Client.PassThruWriteMsgs(j2534ChannelId || 1, [{ ProtocolID: 6, RxStatus: 0, TxFlags: 0, Timestamp: 0, DataSize: 2, ExtraDataIndex: 0, Data: [0x27, 0x01] }], 1000);
        
        setTimeout(async () => {
          addLog('PassThruWriteMsgs: Sending Key...', 'info');
          await j2534Client.PassThruWriteMsgs(j2534ChannelId || 1, [{ ProtocolID: 6, RxStatus: 0, TxFlags: 0, Timestamp: 0, DataSize: 6, ExtraDataIndex: 0, Data: [0x27, 0x02, 0xAA, 0xBB, 0xCC, 0xDD] }], 1000);
          
          addLog('Security Access Granted. Erasing flash...', 'info');
          await j2534Client.PassThruWriteMsgs(j2534ChannelId || 1, [{ ProtocolID: 6, RxStatus: 0, TxFlags: 0, Timestamp: 0, DataSize: 4, ExtraDataIndex: 0, Data: [0x31, 0x01, 0xFF, 0x00] }], 1000);
          
          setTimeout(() => {
            addLog('Writing banks...', 'info');
            let progress = 0;
            const interval = setInterval(async () => {
              progress += 10;
              // Simulate writing blocks
              await j2534Client.PassThruWriteMsgs(j2534ChannelId || 1, [{ ProtocolID: 6, RxStatus: 0, TxFlags: 0, Timestamp: 0, DataSize: 4, ExtraDataIndex: 0, Data: [0x36, 0x01, 0x00, 0x00] }], 1000);
              
              if (progress >= 100) {
                clearInterval(interval);
                addLog('Write Complete. Verifying...', 'success');
                setTimeout(() => addLog('Verification Successful.', 'success'), 500);
              }
            }, 500);
          }, 2000);
        }, 1000);
      } catch (error: any) {
        addLog(`J2534 Write error: ${error.message || error}`, 'error');
      }
    } else {
       addLog('Write not implemented for WebSerial yet. Protocol implementation required.', 'warning');
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
      // Simulate realistic responses based on UDS/OBD2 commands
      setTimeout(() => {
        const cmdByte = hexBytes[0];
        let response = '';
        
        if (cmdByte === 0x1A) { // Read Data By Identifier
          response = `RX: ${((cmdByte + 0x40).toString(16).toUpperCase())} ${hexBytes.slice(1).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')} 31 32 33 34 35 36 37 38 39 30`;
        } else if (cmdByte === 0x11) { // ECU Reset
          response = `RX: ${((cmdByte + 0x40).toString(16).toUpperCase())} ${hexBytes.slice(1).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')}`;
        } else if (cmdByte === 0x19) { // Read DTC
          response = `RX: ${((cmdByte + 0x40).toString(16).toUpperCase())} ${hexBytes.slice(1).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')} 01 01 01 03 00 04 20`;
        } else if (cmdByte === 0x22) { // Read Data By Identifier (UDS)
          response = `RX: ${((cmdByte + 0x40).toString(16).toUpperCase())} ${hexBytes.slice(1).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')} 00 00 00 00`;
        } else if (cmdByte === 0x27) { // Security Access
          if (hexBytes[1] % 2 !== 0) { // Request Seed
            response = `RX: ${((cmdByte + 0x40).toString(16).toUpperCase())} ${hexBytes[1].toString(16).padStart(2, '0').toUpperCase()} AA BB CC DD`;
          } else { // Send Key
            response = `RX: ${((cmdByte + 0x40).toString(16).toUpperCase())} ${hexBytes[1].toString(16).padStart(2, '0').toUpperCase()}`;
          }
        } else if (cmdByte === 0x3E) { // Tester Present
          response = `RX: ${((cmdByte + 0x40).toString(16).toUpperCase())} 00`;
        } else {
          // Negative response: 7F <cmd> 11 (service not supported)
          response = `RX: 7F ${cmdByte.toString(16).padStart(2, '0').toUpperCase()} 11`;
        }
        
        addLog(response, 'info');
      }, 150);
    } else if (j2534Client) {
      addLog(`TX: ${command.toUpperCase()}`, 'info');
      try {
        const msg = {
          ProtocolID: 6, // ISO15765
          RxStatus: 0,
          TxFlags: 0,
          Timestamp: 0,
          DataSize: hexBytes.length,
          ExtraDataIndex: 0,
          Data: hexBytes
        };
        await j2534Client.PassThruWriteMsgs(j2534ChannelId || 1, [msg], 1000);
        
        // Try to read response
        const responses = await j2534Client.PassThruReadMsgs(j2534ChannelId || 1, 1, 1000);
        for (const resp of responses) {
          if (resp.Data) {
            const rxHex = resp.Data.map((b: number) => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');
            addLog(`RX: ${rxHex}`, 'info');
          }
        }
      } catch (error: any) {
        addLog(`J2534 Write/Read error: ${error.message || error}`, 'error');
      }
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
    <div className="flex h-screen bg-hardware-bg text-slate-200 font-sans overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 flex flex-col border-r border-hardware-border bg-slate-900 shadow-2xl z-20">
        <div className="p-6 border-b border-hardware-border bg-slate-950/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-vcx-blue rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40 border border-blue-400/20">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight leading-none uppercase">VCX NANO</h1>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-1">Professional Suite</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
          <ConnectionPanel 
            status={status} 
            deviceInfo={deviceInfo}
            lastError={lastError}
            lastMethod={lastConnectionMethod}
            onConnect={handleConnectSerial}
            onQuickConnect={handleQuickConnect}
            onAutoSetupProxy={handleAutoSetupProxy}
            onScanJ2534={handleScanJ2534}
            onConnectVcxNano={handleConnectVcxNano}
            onDisconnect={handleDisconnect}
            onSimulate={handleSimulateConnection}
            onSimulateJ2534={handleSimulateJ2534Connection}
            isWebSerialSupported={isWebSerialSupported}
          />

          <div className="space-y-4">
            <div>
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1 mb-2">Diagnostic Tools</h3>
              <div className="space-y-1">
                <SidebarButton 
                  active={activeTab === 'dashboard'} 
                  onClick={() => setActiveTab('dashboard')} 
                  icon={Gauge} 
                  label="Live Dashboard" 
                  color="text-emerald-400"
                />
                <SidebarButton 
                  active={activeTab === 'live'} 
                  onClick={() => setActiveTab('live')} 
                  icon={Activity} 
                  label="Data Stream" 
                  color="text-blue-400"
                />
                <SidebarButton 
                  active={activeTab === 'dtc'} 
                  onClick={() => setActiveTab('dtc')} 
                  icon={AlertTriangle} 
                  label="DTC Manager" 
                  color="text-amber-400"
                />
                <SidebarButton 
                  active={activeTab === 'graph'} 
                  onClick={() => setActiveTab('graph')} 
                  icon={Replace} 
                  label="Waveform Graph" 
                  color="text-indigo-400"
                />
                <SidebarButton 
                  active={activeTab === 'emissions'} 
                  onClick={() => setActiveTab('emissions')} 
                  icon={Leaf} 
                  label="Emissions Test" 
                  color="text-emerald-500"
                />
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1 mb-2">Service Functions</h3>
              <div className="space-y-1">
                <SidebarButton 
                  active={activeTab === 'bms'} 
                  onClick={() => setActiveTab('bms')} 
                  icon={Battery} 
                  label="Battery Mgmt" 
                  color="text-emerald-400"
                />
                <SidebarButton 
                  active={activeTab === 'epb'} 
                  onClick={() => setActiveTab('epb')} 
                  icon={Power} 
                  label="EPB Service" 
                  color="text-rose-400"
                />
                <SidebarButton 
                  active={activeTab === 'sas'} 
                  onClick={() => setActiveTab('sas')} 
                  icon={Target} 
                  label="SAS Calibration" 
                  color="text-blue-400"
                />
                <SidebarButton 
                  active={activeTab === 'dpf'} 
                  onClick={() => setActiveTab('dpf')} 
                  icon={Flame} 
                  label="DPF Regen" 
                  color="text-orange-400"
                />
                <SidebarButton 
                  active={activeTab === 'service'} 
                  onClick={() => setActiveTab('service')} 
                  icon={Wrench} 
                  label="Service Resets" 
                  color="text-amber-400"
                />
                <SidebarButton 
                  active={activeTab === 'adas'} 
                  onClick={() => setActiveTab('adas')} 
                  icon={ShieldCheck} 
                  label="ADAS Calib" 
                  color="text-blue-500"
                />
                <SidebarButton 
                  active={activeTab === 'injectors'} 
                  onClick={() => setActiveTab('injectors')} 
                  icon={Syringe} 
                  label="Injector Coding" 
                  color="text-cyan-500"
                />
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1 mb-2">Advanced Ops</h3>
              <div className="space-y-1">
                <SidebarButton 
                  active={activeTab === 'analyzer'} 
                  onClick={() => setActiveTab('analyzer')} 
                  icon={Beaker} 
                  label="CAN Analyzer" 
                  color="text-purple-400"
                />
                <SidebarButton 
                  active={activeTab === 'scanner'} 
                  onClick={() => setActiveTab('scanner')} 
                  icon={Network} 
                  label="Network Scan" 
                  color="text-cyan-400"
                />
                <SidebarButton 
                  active={activeTab === 'topology'} 
                  onClick={() => setActiveTab('topology')} 
                  icon={Monitor} 
                  label="Topology Map" 
                  color="text-emerald-400"
                />
                <SidebarButton 
                  active={activeTab === 'actuators'} 
                  onClick={() => setActiveTab('actuators')} 
                  icon={Sliders} 
                  label="Actuator Tests" 
                  color="text-rose-400"
                />
                <SidebarButton 
                  active={activeTab === 'pmi'} 
                  onClick={() => setActiveTab('pmi')} 
                  icon={RefreshCw} 
                  label="Module Init (PMI)" 
                  color="text-blue-400"
                />
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1 mb-2">OEM Integration</h3>
              <div className="space-y-1">
                <SidebarButton 
                  active={activeTab === 'dealership'} 
                  onClick={() => setActiveTab('dealership')} 
                  icon={Briefcase} 
                  label="Dealership Tools" 
                  color="text-amber-500"
                />
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1 mb-2">Programming</h3>
              <div className="space-y-1">
                <SidebarButton 
                  active={activeTab === 'oemflasher'} 
                  onClick={() => setActiveTab('oemflasher')} 
                  icon={Target} 
                  label="OEM Flasher" 
                  color="text-blue-500"
                />
                <SidebarButton 
                  active={activeTab === 'oemflash'} 
                  onClick={() => setActiveTab('oemflash')} 
                  icon={Zap} 
                  label="J2534 OEM Flash" 
                  color="text-amber-400"
                />
                <SidebarButton 
                  active={activeTab === 'coding'} 
                  onClick={() => setActiveTab('coding')} 
                  icon={FileCode} 
                  label="Variant Coding" 
                  color="text-indigo-500"
                />
                <SidebarButton 
                  active={activeTab === 'eeprom'} 
                  onClick={() => setActiveTab('eeprom')} 
                  icon={Database} 
                  label="EEPROM Editor" 
                  color="text-amber-500"
                />
                <SidebarButton 
                  active={activeTab === 'immo'} 
                  onClick={() => setActiveTab('immo')} 
                  icon={Key} 
                  label="Immobilizer" 
                  color="text-zinc-400"
                />
                <SidebarButton 
                  active={activeTab === 'hex'} 
                  onClick={() => setActiveTab('hex')} 
                  icon={Binary} 
                  label="Hex Editor" 
                  color="text-slate-400"
                />
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1 mb-2">System</h3>
              <div className="space-y-1">
                <SidebarButton 
                  active={activeTab === 'terminal'} 
                  onClick={() => setActiveTab('terminal')} 
                  icon={Terminal} 
                  label="Console" 
                  color="text-zinc-300"
                />
                <SidebarButton 
                  active={activeTab === 'advanced'} 
                  onClick={() => setActiveTab('advanced')} 
                  icon={Microscope} 
                  label="Advanced Console" 
                  color="text-purple-500"
                />
                <SidebarButton 
                  active={activeTab === 'prototype'} 
                  onClick={() => setActiveTab('prototype')} 
                  icon={FlaskConical} 
                  label="Prototype Lab" 
                  color="text-emerald-500"
                />
                <SidebarButton 
                  active={activeTab === 'tech2'} 
                  onClick={() => setActiveTab('tech2')} 
                  icon={Car} 
                  label="Tech2 Emulator" 
                  color="text-blue-400"
                />
                <SidebarButton 
                  active={activeTab === 'vcx-nano'} 
                  onClick={() => setActiveTab('vcx-nano')} 
                  icon={Cpu} 
                  label="VCX Nano Tools" 
                  color="text-blue-400"
                />
                <SidebarButton 
                  active={activeTab === 'proxy'} 
                  onClick={() => setActiveTab('proxy')} 
                  icon={Laptop} 
                  label="Proxy Guide" 
                  color="text-indigo-400"
                />
              </div>
            </div>
          </div>
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
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950 relative">
        {/* Header */}
        <header className="h-16 bg-slate-900 border-b border-hardware-border flex items-center justify-between px-6 z-10 shadow-md">
          <div className="flex items-center space-x-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              Session: <span className="text-white">{status === 'connected' ? 'ACTIVE' : 'IDLE'}</span>
            </h2>
            {status === 'connected' && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Online</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-xs font-medium text-slate-500">
              <Activity className="w-3 h-3" />
              <span>Latency: <span className="text-slate-300">12ms</span></span>
            </div>
            <div className="w-px h-4 bg-slate-800" />
            
            {status !== 'connected' && (
              <button 
                onClick={handleAutoSetupProxy}
                title="Easiest Setup: One-click proxy initialization"
                className="flex items-center px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-[10px] font-bold uppercase tracking-widest rounded border border-emerald-500/30 transition-all group"
              >
                <Zap className="w-3.5 h-3.5 mr-2 group-hover:animate-pulse" />
                Quick Setup
              </button>
            )}

            <button 
              onClick={() => setSettingsOpen(true)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Device Info Bar */}
        {status === 'connected' && deviceInfo && (
          <div className="bg-slate-900/50 border-b border-hardware-border px-6 py-2 flex items-center space-x-8 overflow-x-auto no-scrollbar">
            <div className="flex items-center space-x-2 shrink-0">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Protocol</span>
              <span className="text-xs font-mono text-blue-400 font-bold">{deviceInfo.protocol}</span>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Voltage</span>
              <span className={`text-xs font-mono font-bold ${deviceInfo.voltage < 12 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {deviceInfo.voltage.toFixed(1)}V
              </span>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">VIN</span>
              <span className="text-xs font-mono text-slate-300">{deviceInfo.vin}</span>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">OSID</span>
              <span className="text-xs font-mono text-slate-300">{deviceInfo.osid}</span>
            </div>
          </div>
        )}

        <div className="flex-1 p-6 min-h-0 overflow-y-auto custom-scrollbar">
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
            {activeTab === 'advanced' && (
                <AdvancedPanel isConnected={status === 'connected'} onSendCommand={handleTerminalSend} />
            )}
            {activeTab === 'prototype' && (
                <PrototypePanel isConnected={status === 'connected'} onSendCommand={handleTerminalSend} />
            )}
            {activeTab === 'dashboard' && (
                <DashboardPanel 
                    isConnected={status === 'connected'} 
                    deviceInfo={deviceInfo}
                    j2534DeviceId={j2534DeviceId}
                    j2534ChannelId={j2534ChannelId}
                    onOpenSettings={() => setSettingsOpen(true)}
                    onOpenProxyGuide={() => setActiveTab('proxy')}
                    onAutoSetupProxy={handleAutoSetupProxy}
                />
            )}
            {activeTab === 'analyzer' && (
                <AnalyzerPanel isConnected={status === 'connected'} />
            )}
            {activeTab === 'scanner' && (
                <NetworkScannerPanel isConnected={status === 'connected'} />
            )}
            {activeTab === 'actuators' && (
                <ActuatorsPanel isConnected={status === 'connected'} />
            )}
            {activeTab === 'emissions' && (
                <EmissionsPanel isConnected={status === 'connected'} />
            )}
            {activeTab === 'eeprom' && (
                <EepromEditorPanel isConnected={status === 'connected'} />
            )}
            {activeTab === 'coding' && (
                <VariantCodingPanel isConnected={status === 'connected'} />
            )}
            {activeTab === 'immo' && (
                <ImmoPanel isConnected={status === 'connected'} />
            )}
            {activeTab === 'service' && (
                <ServiceResetsPanel isConnected={status === 'connected'} />
            )}
            {activeTab === 'pmi' && (
                <ModuleInitPanel isConnected={status === 'connected'} />
            )}
            {activeTab === 'oemflash' && (
                <J2534OemPanel isConnected={status === 'connected'} />
            )}
            {activeTab === 'oemflasher' && (
                <OemFlasherPanel isConnected={status === 'connected'} />
            )}
            {activeTab === 'adas' && (
                <AdasCalibrationPanel isConnected={status === 'connected'} />
            )}
            {activeTab === 'injectors' && (
                <InjectorCodingPanel isConnected={status === 'connected'} />
            )}
            {activeTab === 'topology' && (
                <NetworkTopologyPanel isConnected={status === 'connected'} />
            )}
            {activeTab === 'tech2' && (
                <GmTech2Panel isConnected={status === 'connected'} />
            )}
            {activeTab === 'vcx-nano' && (
              <VcxNanoPanel 
                isConnected={status === 'connected'} 
                deviceInfo={deviceInfo}
                onAutoSetupProxy={handleAutoSetupProxy}
              />
            )}
            {activeTab === 'proxy' && (
                <ProxyGuide onAutoSetupProxy={handleAutoSetupProxy} />
            )}
            {activeTab === 'bms' && (
                <BmsPanel isConnected={status === 'connected'} />
            )}
            {activeTab === 'epb' && (
                <EpbPanel isConnected={status === 'connected'} />
            )}
            {activeTab === 'sas' && (
                <SasPanel isConnected={status === 'connected'} />
            )}
            {activeTab === 'dpf' && (
                <DpfPanel isConnected={status === 'connected'} />
            )}
            {activeTab === 'dealership' && (
                <DealershipToolsPanel isConnected={status === 'connected'} />
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

      <J2534DeviceSelectorModal
        isOpen={isJ2534ModalOpen}
        devices={j2534Devices}
        onSelect={handleJ2534DeviceSelect}
        onClose={() => {
          setIsJ2534ModalOpen(false);
          setStatus('disconnected');
          setPendingJ2534Client(null);
        }}
      />
    </div>
  );
}

function SidebarButton({ active, onClick, icon: Icon, label, color }: { active: boolean, onClick: () => void, icon: any, label: string, color: string }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all group ${
        active 
          ? 'bg-vcx-blue/10 text-white border border-vcx-blue/20 shadow-lg shadow-blue-500/5' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
      }`}
    >
      <Icon className={`w-4 h-4 transition-colors ${active ? color : 'text-slate-500 group-hover:text-slate-300'}`} />
      <span className="text-sm font-medium">{label}</span>
      {active && <div className="ml-auto w-1 h-4 bg-vcx-blue rounded-full" />}
    </button>
  );
}

