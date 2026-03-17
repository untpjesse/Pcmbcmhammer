export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export type ModuleType = 'P01' | 'P59' | 'BCM' | 'TCM' | 'L59' | 'E38';

export interface LogEntry {
  id: string;
  timestamp: number;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface DeviceInfo {
  protocol: string;
  voltage: number;
  vin: string;
  osid: string;
  name?: string;
}

export interface PID {
  id: string;
  name: string;
  value: number;
  unit: string;
  min: number;
  max: number;
}

export interface DTC {
  code: string;
  description: string;
  status: 'Current' | 'History' | 'Pending';
}

declare global {
  interface Window {
    electron: {
      serial: {
        list: () => Promise<any[]>;
        open: (config: { path: string; baudRate: number }) => Promise<boolean>;
        close: () => Promise<boolean>;
        write: (data: Uint8Array | number[]) => Promise<boolean>;
        onData: (callback: (data: Uint8Array) => void) => void;
        onError: (callback: (error: string) => void) => void;
        removeAllListeners: () => void;
      };
    };
  }
}
