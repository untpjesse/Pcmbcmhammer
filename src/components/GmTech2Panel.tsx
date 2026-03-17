import React, { useState, useEffect } from 'react';
import { Monitor, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Power } from 'lucide-react';

interface GmTech2PanelProps {
  isConnected: boolean;
}

type ScreenId = 'boot' | 'main' | 'year' | 'type' | 'make' | 'system' | 'diag' | 'dtc' | 'data' | 'special' | 'mock_data';

interface MenuState {
  id: ScreenId;
  title: string;
  items: string[];
}

export function GmTech2Panel({ isConnected }: GmTech2PanelProps) {
  const [isOn, setIsOn] = useState(false);
  const [screen, setScreen] = useState<ScreenId>('boot');
  const [cursor, setCursor] = useState(0);
  const [history, setHistory] = useState<ScreenId[]>([]);
  const [bootProgress, setBootProgress] = useState(0);

  const menus: Record<string, MenuState> = {
    main: {
      id: 'main',
      title: 'Main Menu',
      items: ['F0: Diagnostics', 'F1: Service Programming System', 'F2: View Captured Data', 'F3: Tool Options', 'F4: Getting Started']
    },
    year: {
      id: 'year',
      title: 'Vehicle Year',
      items: ['2008', '2007', '2006', '2005', '2004', '2003', '2002', '2001']
    },
    type: {
      id: 'type',
      title: 'Vehicle Type',
      items: ['Passenger Car', 'Light Duty Truck', 'MPV', 'Incomplete']
    },
    make: {
      id: 'make',
      title: 'Vehicle Make',
      items: ['Chevrolet', 'Pontiac', 'Buick', 'Cadillac', 'GMC', 'Saturn', 'Hummer']
    },
    system: {
      id: 'system',
      title: 'System Selection',
      items: ['Powertrain', 'Body', 'Chassis', 'Diagnostic Circuit Check']
    },
    diag: {
      id: 'diag',
      title: 'Diagnostic Menu',
      items: ['Diagnostic Trouble Codes (DTC)', 'Data Display', 'Special Functions', 'Module ID Information']
    },
    dtc: {
      id: 'dtc',
      title: 'DTC Menu',
      items: ['DTC Information', 'Clear DTC Information', 'Freeze Frame/Failure Records']
    },
    data: {
      id: 'data',
      title: 'Data Display',
      items: ['Engine Data 1', 'Engine Data 2', 'EGR Data', 'Fuel Trim Data', 'Misfire Data']
    },
    special: {
      id: 'special',
      title: 'Special Functions',
      items: ['Engine Output Controls', 'Transmission Output Controls', 'Fuel System', 'Idle Learn', 'Crankshaft Pos. Variation Learn']
    }
  };

  useEffect(() => {
    if (isOn && screen === 'boot') {
      const interval = setInterval(() => {
        setBootProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            setScreen('main');
            return 100;
          }
          return p + 5;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isOn, screen]);

  const handlePower = () => {
    if (!isOn) {
      setIsOn(true);
      setScreen('boot');
      setBootProgress(0);
      setHistory([]);
      setCursor(0);
    } else {
      setIsOn(false);
      setScreen('boot');
    }
  };

  const navigateTo = (nextScreen: ScreenId) => {
    setHistory(prev => [...prev, screen]);
    setScreen(nextScreen);
    setCursor(0);
  };

  const handleEnter = () => {
    if (!isOn || screen === 'boot' || screen === 'mock_data') return;

    switch (screen) {
      case 'main':
        if (cursor === 0) navigateTo('year');
        break;
      case 'year':
        navigateTo('type');
        break;
      case 'type':
        navigateTo('make');
        break;
      case 'make':
        navigateTo('system');
        break;
      case 'system':
        if (cursor === 0) navigateTo('diag'); // Powertrain
        break;
      case 'diag':
        if (cursor === 0) navigateTo('dtc');
        if (cursor === 1) navigateTo('data');
        if (cursor === 2) navigateTo('special');
        break;
      case 'dtc':
      case 'data':
      case 'special':
        navigateTo('mock_data');
        break;
    }
  };

  const handleExit = () => {
    if (!isOn || screen === 'boot' || history.length === 0) return;
    const prevScreen = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    setScreen(prevScreen);
    setCursor(0);
  };

  const handleUp = () => {
    if (!isOn || screen === 'boot' || screen === 'mock_data') return;
    const currentMenu = menus[screen];
    if (currentMenu && cursor > 0) {
      setCursor(c => c - 1);
    }
  };

  const handleDown = () => {
    if (!isOn || screen === 'boot' || screen === 'mock_data') return;
    const currentMenu = menus[screen];
    if (currentMenu && cursor < currentMenu.items.length - 1) {
      setCursor(c => c + 1);
    }
  };

  const renderScreen = () => {
    if (!isOn) return <div className="w-full h-full bg-[#0a0a0a]"></div>;

    if (screen === 'boot') {
      return (
        <div className="w-full h-full bg-[#0000a0] text-white p-4 font-mono flex flex-col items-center justify-center text-center">
          <h1 className="text-2xl font-bold mb-2">GM Tech 2</h1>
          <p className="text-sm mb-8">Version 33.004</p>
          <div className="w-48 h-4 border-2 border-white p-0.5">
            <div className="h-full bg-white transition-all duration-100" style={{ width: `${bootProgress}%` }}></div>
          </div>
          <p className="text-xs mt-4 animate-pulse">Initializing...</p>
        </div>
      );
    }

    if (screen === 'mock_data') {
      return (
        <div className="w-full h-full bg-[#0000a0] text-white p-2 font-mono flex flex-col">
          <div className="bg-white text-[#0000a0] px-2 py-1 font-bold text-sm mb-2 flex justify-between">
            <span>Data Display</span>
            <span>1/1</span>
          </div>
          <div className="flex-1 overflow-y-auto text-sm space-y-1">
            <div className="flex justify-between"><span>Engine Speed</span><span>850 RPM</span></div>
            <div className="flex justify-between"><span>ECT Sensor</span><span>195 °F</span></div>
            <div className="flex justify-between"><span>MAF Sensor</span><span>4.5 g/s</span></div>
            <div className="flex justify-between"><span>MAP Sensor</span><span>32 kPa</span></div>
            <div className="flex justify-between"><span>HO2S Bank 1 Sen 1</span><span>450 mV</span></div>
            <div className="flex justify-between"><span>Spark Advance</span><span>15 °</span></div>
            <div className="flex justify-between"><span>TP Sensor</span><span>0 %</span></div>
          </div>
          <div className="mt-auto pt-2 border-t border-white/30 text-xs text-center">
            Press EXIT to return
          </div>
        </div>
      );
    }

    const currentMenu = menus[screen];
    if (!currentMenu) return null;

    return (
      <div className="w-full h-full bg-[#0000a0] text-white p-2 font-mono flex flex-col">
        <div className="bg-white text-[#0000a0] px-2 py-1 font-bold text-sm mb-2 flex justify-between">
          <span>{currentMenu.title}</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {currentMenu.items.map((item, idx) => (
            <div 
              key={idx} 
              className={`px-2 py-1 text-sm flex items-center ${cursor === idx ? 'bg-white text-[#0000a0] font-bold' : ''}`}
            >
              {cursor === idx && <span className="mr-2">&gt;</span>}
              {cursor !== idx && <span className="mr-2">&nbsp;</span>}
              {item}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
      <div className="p-4 border-b border-zinc-800 bg-zinc-950/50 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-zinc-100 flex items-center">
          <Monitor className="w-5 h-5 mr-2 text-blue-400" />
          Legacy Scanner (Tech 2 Emulator)
        </h2>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
          <span className="text-xs text-zinc-400">DLC: {isConnected ? 'Connected' : 'No Comm'}</span>
        </div>
      </div>

      <div className="flex-1 p-6 flex items-center justify-center bg-zinc-950 overflow-y-auto">
        {/* Tech 2 Device Body */}
        <div className="w-full max-w-md bg-slate-700 rounded-3xl p-6 shadow-2xl border-4 border-slate-600 flex flex-col items-center relative">
          
          {/* Top Bumper */}
          <div className="absolute top-0 left-10 right-10 h-4 bg-slate-800 rounded-b-xl"></div>

          {/* Screen Bezel */}
          <div className="w-full bg-slate-800 p-4 rounded-xl border-2 border-slate-900 shadow-inner mb-6">
            <div className="aspect-[4/3] w-full bg-[#0a0a0a] rounded border-4 border-slate-900 overflow-hidden relative shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
              {/* CRT/LCD Scanline overlay */}
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100%_4px] z-10"></div>
              {renderScreen()}
            </div>
          </div>

          {/* Controls Area */}
          <div className="w-full grid grid-cols-3 gap-4">
            {/* Left Soft Keys */}
            <div className="flex flex-col space-y-3 justify-center">
              <button className="h-8 bg-slate-600 rounded shadow border-b-4 border-slate-800 active:border-b-0 active:translate-y-1"></button>
              <button className="h-8 bg-slate-600 rounded shadow border-b-4 border-slate-800 active:border-b-0 active:translate-y-1"></button>
              <button className="h-8 bg-slate-600 rounded shadow border-b-4 border-slate-800 active:border-b-0 active:translate-y-1"></button>
            </div>

            {/* Center D-Pad */}
            <div className="flex flex-col items-center justify-center">
              <div className="grid grid-cols-3 gap-1 bg-slate-800 p-2 rounded-full">
                <div></div>
                <button onClick={handleUp} className="w-10 h-10 bg-slate-600 rounded-t-lg shadow border-b-4 border-slate-800 active:border-b-0 active:translate-y-1 flex items-center justify-center text-white"><ChevronUp className="w-6 h-6" /></button>
                <div></div>
                <button className="w-10 h-10 bg-slate-600 rounded-l-lg shadow border-b-4 border-slate-800 active:border-b-0 active:translate-y-1 flex items-center justify-center text-white"><ChevronLeft className="w-6 h-6" /></button>
                <div className="w-10 h-10 bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-400"></div>
                <button className="w-10 h-10 bg-slate-600 rounded-r-lg shadow border-b-4 border-slate-800 active:border-b-0 active:translate-y-1 flex items-center justify-center text-white"><ChevronRight className="w-6 h-6" /></button>
                <div></div>
                <button onClick={handleDown} className="w-10 h-10 bg-slate-600 rounded-b-lg shadow border-b-4 border-slate-800 active:border-b-0 active:translate-y-1 flex items-center justify-center text-white"><ChevronDown className="w-6 h-6" /></button>
                <div></div>
              </div>
            </div>

            {/* Right Action Keys */}
            <div className="flex flex-col space-y-3 justify-center items-end">
              <button onClick={handleEnter} className="w-20 h-10 bg-emerald-600 rounded shadow border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1 text-white font-bold text-xs">ENTER</button>
              <button onClick={handleExit} className="w-20 h-10 bg-amber-600 rounded shadow border-b-4 border-amber-800 active:border-b-0 active:translate-y-1 text-white font-bold text-xs">EXIT</button>
              <button className="w-20 h-10 bg-slate-600 rounded shadow border-b-4 border-slate-800 active:border-b-0 active:translate-y-1 text-white font-bold text-xs">HELP</button>
            </div>
          </div>

          {/* Power Button */}
          <div className="absolute bottom-6 left-6">
            <button 
              onClick={handlePower}
              className={`w-12 h-12 rounded-full shadow-lg border-b-4 active:border-b-0 active:translate-y-1 flex items-center justify-center ${
                isOn ? 'bg-red-600 border-red-800 text-white' : 'bg-slate-800 border-slate-900 text-red-500'
              }`}
            >
              <Power className="w-6 h-6" />
            </button>
          </div>

          {/* Branding */}
          <div className="absolute bottom-8 right-8 text-slate-400 font-bold italic tracking-wider text-xl opacity-50">
            TECH 2
          </div>

        </div>
      </div>
    </div>
  );
}
