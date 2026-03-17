import { useState, useMemo } from 'react';
import { DTC } from '../types';
import { AlertTriangle, Trash2, CheckCircle, Download, RefreshCw, Search, ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';

interface DTCPanelProps {
  isConnected: boolean;
}

type SortField = 'code' | 'status' | 'description';
type SortDirection = 'asc' | 'desc';

export default function DTCPanel({ isConnected }: DTCPanelProps) {
  const [dtcs, setDtcs] = useState<DTC[]>([]);
  const [isReading, setIsReading] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [hasRead, setHasRead] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('code');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleRead = () => {
    if (!isConnected) return;
    setIsReading(true);
    setHasRead(false);
    
    setTimeout(() => {
      setDtcs([
        { code: 'P0101', description: 'Mass or Volume Air Flow Circuit Range/Performance', status: 'Current' },
        { code: 'P0300', description: 'Random/Multiple Cylinder Misfire Detected', status: 'History' },
        { code: 'P0420', description: 'Catalyst System Efficiency Below Threshold (Bank 1)', status: 'Pending' },
        { code: 'U0100', description: 'Lost Communication With ECM/PCM A', status: 'Current' },
        { code: 'C0561', description: 'System Disabled Information Stored', status: 'History' },
        { code: 'B1000', description: 'Electronic Control Unit Performance', status: 'Pending' },
      ]);
      setIsReading(false);
      setHasRead(true);
    }, 1500);
  };

  const handleClear = () => {
    if (!isConnected) return;
    setIsClearing(true);
    
    setTimeout(() => {
      setDtcs([]);
      setIsClearing(false);
    }, 1500);
  };

  const handleSaveReport = () => {
    if (dtcs.length === 0) return;

    const timestamp = new Date().toLocaleString();
    let report = `Diagnostic Trouble Code Report\nGenerated: ${timestamp}\n\n`;
    
    filteredAndSortedDtcs.forEach(dtc => {
      report += `[${dtc.code}] ${dtc.description}\nStatus: ${dtc.status}\n----------------------------------------\n`;
    });

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `dtc_report_${new Date().toISOString()}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedDtcs = useMemo(() => {
    return dtcs
      .filter(dtc => 
        dtc.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dtc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dtc.status.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        
        if (sortDirection === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      });
  }, [dtcs, searchTerm, sortField, sortDirection]);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-zinc-600 mb-4" />
        <h3 className="text-zinc-400 font-medium mb-2">DTCs Unavailable</h3>
        <p className="text-zinc-500 text-sm">Connect to a device to read diagnostic trouble codes.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-black">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-zinc-200 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-amber-500" />
          Diagnostic Trouble Codes
        </h2>
        <div className="flex space-x-2">
          <button 
            onClick={handleRead}
            disabled={isReading || isClearing}
            className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-600/30 rounded-md flex items-center transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isReading ? 'animate-spin' : ''}`} />
            {isReading ? 'Reading...' : 'Read Codes'}
          </button>
          <button 
            onClick={handleSaveReport}
            disabled={dtcs.length === 0 || isReading || isClearing}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded-md flex items-center transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4 mr-2" />
            Save Report
          </button>
          <button 
            onClick={handleClear}
            disabled={dtcs.length === 0 || isReading || isClearing}
            className="px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-600/20 rounded-md flex items-center transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isClearing ? 'Clearing...' : 'Clear Codes'}
          </button>
        </div>
      </div>

      {hasRead && dtcs.length > 0 && (
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text"
              placeholder="Filter by code, description, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-md pl-10 pr-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Sort by:</span>
            <div className="flex bg-zinc-900 border border-zinc-800 rounded-md p-1">
              {(['code', 'status', 'description'] as SortField[]).map((field) => (
                <button
                  key={field}
                  onClick={() => toggleSort(field)}
                  className={`px-3 py-1 text-xs font-medium rounded transition-all flex items-center ${
                    sortField === field 
                      ? 'bg-indigo-600/20 text-indigo-400' 
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                  {sortField === field && (
                    sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {isReading || isClearing ? (
        <div className="flex flex-col items-center justify-center flex-1 bg-zinc-900/20 border border-zinc-800 rounded-lg">
          <RefreshCw className="w-12 h-12 text-indigo-500/50 mb-4 animate-spin" />
          <p className="text-zinc-400 font-medium">{isReading ? 'Reading DTCs from modules...' : 'Clearing DTCs...'}</p>
        </div>
      ) : !hasRead ? (
        <div className="flex flex-col items-center justify-center flex-1 bg-zinc-900/20 border border-zinc-800 rounded-lg">
          <AlertTriangle className="w-16 h-16 text-zinc-700 mb-4" />
          <p className="text-zinc-400 font-medium">Ready to Read DTCs</p>
          <p className="text-zinc-600 text-sm">Click "Read Codes" to scan for faults.</p>
        </div>
      ) : dtcs.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 bg-zinc-900/20 border border-zinc-800 rounded-lg">
          <CheckCircle className="w-16 h-16 text-emerald-500/20 mb-4" />
          <p className="text-zinc-400 font-medium">No DTCs Found</p>
          <p className="text-zinc-600 text-sm">System is operating normally.</p>
        </div>
      ) : filteredAndSortedDtcs.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 bg-zinc-900/20 border border-zinc-800 rounded-lg">
          <Search className="w-16 h-16 text-zinc-700 mb-4" />
          <p className="text-zinc-400 font-medium">No Matching DTCs</p>
          <p className="text-zinc-600 text-sm">Try adjusting your filter criteria.</p>
        </div>
      ) : (
        <div className="space-y-2 overflow-y-auto flex-1 pr-1">
          {filteredAndSortedDtcs.map((dtc) => (
            <div key={dtc.code} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-start justify-between hover:border-zinc-700 transition-colors group">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-1">
                  <span className="text-lg font-mono font-bold text-amber-500 group-hover:text-amber-400 transition-colors">{dtc.code}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    dtc.status === 'Current' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    dtc.status === 'History' ? 'bg-zinc-700/30 text-zinc-400 border border-zinc-700/50' :
                    'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {dtc.status}
                  </span>
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed">{dtc.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
