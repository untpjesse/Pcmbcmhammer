import { useState, useEffect, useRef } from 'react';
import { Activity, Play, Pause, RefreshCw, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface GraphPanelProps {
  isConnected: boolean;
}

interface DataPoint {
  time: number;
  [key: string]: number;
}

export default function GraphPanel({ isConnected }: GraphPanelProps) {
  const [data, setData] = useState<DataPoint[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedPids, setSelectedPids] = useState<string[]>(['rpm', 'speed']);
  const startTimeRef = useRef(Date.now());

  // Available PIDs to graph (subset for demo)
  const availablePids = [
    { id: 'rpm', name: 'RPM', color: '#10b981' }, // Emerald
    { id: 'speed', name: 'Speed', color: '#3b82f6' }, // Blue
    { id: 'ect', name: 'Coolant', color: '#ef4444' }, // Red
    { id: 'tps', name: 'Throttle', color: '#f59e0b' }, // Amber
    { id: 'map', name: 'MAP', color: '#8b5cf6' }, // Purple
  ];

  useEffect(() => {
    if (!isConnected || isPaused) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const timeOffset = (now - startTimeRef.current) / 1000;

      // Simulate data generation based on previous values or simple functions
      setData(prevData => {
        const lastPoint = prevData[prevData.length - 1] || { rpm: 800, speed: 0, ect: 190, tps: 0, map: 30 };
        
        // Generate somewhat realistic looking data
        const newPoint: DataPoint = {
          time: Number(timeOffset.toFixed(1)),
          rpm: Math.max(600, Math.min(7000, lastPoint.rpm + (Math.random() - 0.5) * 100)),
          speed: Math.max(0, Math.min(120, lastPoint.speed + (Math.random() - 0.5) * 2)),
          ect: Math.max(180, Math.min(220, lastPoint.ect + (Math.random() - 0.5) * 0.5)),
          tps: Math.max(0, Math.min(100, (Math.sin(timeOffset / 2) + 1) * 50 + (Math.random() * 10))),
          map: Math.max(20, Math.min(100, 30 + (Math.random() * 5) + (lastPoint.tps * 0.5))), // MAP follows TPS roughly
        };

        // Keep last 50 points
        const newData = [...prevData, newPoint];
        if (newData.length > 50) newData.shift();
        return newData;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isConnected, isPaused]);

  const togglePid = (pidId: string) => {
    setSelectedPids(prev => 
      prev.includes(pidId) 
        ? prev.filter(id => id !== pidId)
        : [...prev, pidId]
    );
  };

  const handleClear = () => {
    setData([]);
    startTimeRef.current = Date.now();
  };

  const handleExportCSV = () => {
    if (data.length === 0) return;

    // Get all unique keys from data (excluding time which we want first)
    const keys = availablePids.map(p => p.id);
    const header = ['Time', ...keys].join(',');

    const rows = data.map(point => {
      const row = [point.time];
      keys.forEach(key => {
        row.push(point[key] || 0);
      });
      return row.join(',');
    });

    const csvContent = [header, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `graph_export_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-8 text-center">
        <Activity className="w-12 h-12 text-zinc-600 mb-4" />
        <h3 className="text-zinc-400 font-medium mb-2">Graphing Unavailable</h3>
        <p className="text-zinc-500 text-sm">Connect to a device to visualize live data.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-black space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-semibold text-zinc-200 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-emerald-500" />
            Live Graph
          </h2>
          <div className="flex space-x-1 ml-4">
            {availablePids.map(pid => (
              <button
                key={pid.id}
                onClick={() => togglePid(pid.id)}
                className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                  selectedPids.includes(pid.id)
                    ? 'bg-zinc-800 text-white border-zinc-600'
                    : 'bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-700'
                }`}
                style={{ borderColor: selectedPids.includes(pid.id) ? pid.color : undefined }}
              >
                {pid.name}
              </button>
            ))}
          </div>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => setIsPaused(!isPaused)}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md transition-colors"
            title={isPaused ? "Resume" : "Pause"}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
          <button 
            onClick={handleClear}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md transition-colors"
            title="Clear Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button 
            onClick={handleExportCSV}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md transition-colors"
            title="Export CSV"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis 
              dataKey="time" 
              stroke="#666" 
              tick={{ fill: '#666', fontSize: 12 }}
              label={{ value: 'Time (s)', position: 'insideBottomRight', offset: -5, fill: '#666', fontSize: 12 }} 
            />
            <YAxis 
              stroke="#666" 
              tick={{ fill: '#666', fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#e4e4e7' }}
              itemStyle={{ fontSize: 12 }}
              labelStyle={{ color: '#a1a1aa', marginBottom: 4 }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            {availablePids.map(pid => (
              selectedPids.includes(pid.id) && (
                <Line 
                  key={pid.id}
                  type="monotone" 
                  dataKey={pid.id} 
                  stroke={pid.color} 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  animationDuration={300}
                />
              )
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
