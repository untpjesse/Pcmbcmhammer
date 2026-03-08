import { useState, useMemo } from 'react';
import { FileText, ArrowLeft, ArrowRight, Download, Upload } from 'lucide-react';

interface HexViewerProps {
  data: Uint8Array | null;
  fileName: string | null;
  onUpload: (file: File) => void;
}

const BYTES_PER_ROW = 16;
const PAGE_SIZE = 512; // Bytes per page

export default function HexViewer({ data, fileName, onUpload }: HexViewerProps) {
  const [page, setPage] = useState(0);

  const totalPages = useMemo(() => {
    if (!data) return 0;
    return Math.ceil(data.length / PAGE_SIZE);
  }, [data]);

  const pageData = useMemo(() => {
    if (!data) return null;
    const start = page * PAGE_SIZE;
    const end = Math.min(start + PAGE_SIZE, data.length);
    return data.slice(start, end);
  }, [data, page]);

  const handleDownload = () => {
    if (!data || !fileName) return;
    const blob = new Blob([data], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!data || !pageData) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-8 text-center">
        <FileText className="w-12 h-12 text-zinc-600 mb-4" />
        <h3 className="text-zinc-400 font-medium mb-2">No File Loaded</h3>
        <p className="text-zinc-500 text-sm mb-6">Upload a .bin file to view its contents.</p>
        <label className="cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-md flex items-center transition-colors">
          <Upload className="w-4 h-4 mr-2" />
          Select File
          <input 
            type="file" 
            accept=".bin" 
            className="hidden" 
            onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
          />
        </label>
      </div>
    );
  }

  const rows = [];
  for (let i = 0; i < pageData.length; i += BYTES_PER_ROW) {
    const rowBytes = pageData.slice(i, i + BYTES_PER_ROW);
    const offset = (page * PAGE_SIZE) + i;
    
    // Hex representation
    const hexParts = [];
    for(let j=0; j<BYTES_PER_ROW; j++) {
        if(j < rowBytes.length) {
            hexParts.push(rowBytes[j].toString(16).padStart(2, '0').toUpperCase());
        } else {
            hexParts.push('  ');
        }
    }
    const hex = hexParts.join(' ');
    
    // ASCII representation
    const ascii = Array.from(rowBytes)
      .map((b: number) => (b >= 32 && b <= 126) ? String.fromCharCode(b) : '.')
      .join('');

    rows.push(
      <div key={offset} className="flex font-mono text-xs hover:bg-zinc-800/50 py-0.5 px-2 rounded group">
        <span className="text-zinc-500 w-20 shrink-0 select-none group-hover:text-zinc-400">{offset.toString(16).padStart(8, '0').toUpperCase()}</span>
        <span className="text-zinc-300 w-[26rem] shrink-0 pl-4 whitespace-pre">{hex}</span>
        <span className="text-emerald-400/80 pl-4 border-l border-zinc-800 ml-4 truncate">{ascii}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-black border border-zinc-800 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span className="text-zinc-200 font-medium text-sm truncate max-w-[150px]" title={fileName}>{fileName}</span>
            <span className="text-zinc-500 text-xs">({data.length.toLocaleString()} bytes)</span>
          </div>
          <button 
            onClick={handleDownload}
            className="text-zinc-400 hover:text-white transition-colors"
            title="Download .bin"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="p-1 hover:bg-zinc-800 rounded disabled:opacity-30 disabled:cursor-not-allowed text-zinc-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-zinc-500 text-xs font-mono w-24 text-center select-none">
            Page {page + 1}/{totalPages}
          </span>
          <button 
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="p-1 hover:bg-zinc-800 rounded disabled:opacity-30 disabled:cursor-not-allowed text-zinc-400 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 bg-[#0d1117] custom-scrollbar">
        {rows}
      </div>
    </div>
  );
}

