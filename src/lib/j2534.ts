export const J2534 = {
  // Protocols
  J1850VPW: 1,
  J1850PWM: 2,
  ISO9141: 3,
  ISO14230: 4,
  CAN: 5,
  ISO15765: 6,
  SCI_A_ENGINE: 7,
  SCI_A_TRANS: 8,
  SCI_B_ENGINE: 9,
  SCI_B_TRANS: 10,

  // Filter Types
  PASS_FILTER: 1,
  BLOCK_FILTER: 2,
  FLOW_CONTROL_FILTER: 3,

  // IOCTLs
  GET_CONFIG: 1,
  SET_CONFIG: 2,
  READ_VBATT: 3,
  FIVE_BAUD_INIT: 4,
  FAST_INIT: 5,
  CLEAR_TX_BUFFER: 7,
  CLEAR_RX_BUFFER: 8,
  CLEAR_PERIODIC_MSGS: 9,
  CLEAR_MSG_FILTERS: 10,
  CLEAR_FUNCT_MSG_LOOKUP_TABLE: 11,
  ADD_TO_FUNCT_MSG_LOOKUP_TABLE: 12,
  DELETE_FROM_FUNCT_MSG_LOOKUP_TABLE: 13,
  READ_PROG_VOLTAGE: 14,
};

export interface PassThruMsg {
  ProtocolID: number;
  RxStatus: number;
  TxFlags: number;
  Timestamp: number;
  DataSize: number;
  ExtraDataIndex: number;
  Data: number[]; // Array of bytes
}

export interface J2534Device {
  id: string;
  name: string;
  vendor: string;
}

export interface IJ2534 {
  GetDevices(): Promise<J2534Device[]>;
  PassThruOpen(name: string | null): Promise<number>;
  PassThruClose(deviceId: number): Promise<void>;
  PassThruConnect(deviceId: number, protocolId: number, flags: number, baudRate: number): Promise<number>;
  PassThruDisconnect(channelId: number): Promise<void>;
  PassThruReadMsgs(channelId: number, numMsgs: number, timeout: number): Promise<PassThruMsg[]>;
  PassThruWriteMsgs(channelId: number, msgs: PassThruMsg[], timeout: number): Promise<void>;
  PassThruStartMsgFilter(channelId: number, filterType: number, mask: PassThruMsg, pattern: PassThruMsg, flowControl?: PassThruMsg): Promise<number>;
  PassThruStopMsgFilter(channelId: number, filterId: number): Promise<void>;
  PassThruStartPeriodicMsg(channelId: number, msg: PassThruMsg, timeout: number): Promise<number>;
  PassThruStopPeriodicMsg(channelId: number, msgId: number): Promise<void>;
  PassThruSetProgrammingVoltage(deviceId: number, pin: number, voltage: number): Promise<void>;
  PassThruReadVersion(deviceId: number): Promise<{ firmware: string, dll: string, api: string }>;
  PassThruGetLastError(): Promise<string>;
  PassThruIoctl(channelId: number, ioctlId: number, input?: any): Promise<any>;
}

export class J2534ProxyClient implements IJ2534 {
  private ws: WebSocket | null = null;
  private messageId = 0;
  private pending = new Map<number, { resolve: Function, reject: Function }>();

  async connect(url: string = 'ws://127.0.0.1:2534', onDisconnect?: () => void): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(url);
        this.ws.onopen = () => resolve();
        this.ws.onclose = () => {
          if (onDisconnect) onDisconnect();
          this.ws = null;
        };
        this.ws.onerror = () => reject(new Error('WebSocket connection failed. Ensure J2534 Proxy is running on localhost:2534.'));
        this.ws.onmessage = (msg) => {
          const data = JSON.parse(msg.data);
          if (data.id !== undefined && this.pending.has(data.id)) {
            const { resolve, reject } = this.pending.get(data.id)!;
            if (data.error) reject(new Error(data.error));
            else resolve(data.result);
            this.pending.delete(data.id);
          }
        };
      } catch (e) {
        reject(e);
      }
    });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private async request(method: string, params: any = {}): Promise<any> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('J2534 Proxy not connected');
    }
    return new Promise((resolve, reject) => {
      const id = ++this.messageId;
      this.pending.set(id, { resolve, reject });
      this.ws!.send(JSON.stringify({ jsonrpc: '2.0', id, method, params }));
      
      // Timeout
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.get(id)!.reject(new Error('Request timeout'));
          this.pending.delete(id);
        }
      }, 5000);
    });
  }

  async GetDevices(): Promise<J2534Device[]> { return this.request('GetDevices'); }
  async PassThruOpen(name: string | null): Promise<number> { return this.request('PassThruOpen', { name }); }
  async PassThruClose(deviceId: number): Promise<void> { return this.request('PassThruClose', { deviceId }); }
  async PassThruConnect(deviceId: number, protocolId: number, flags: number, baudRate: number): Promise<number> { return this.request('PassThruConnect', { deviceId, protocolId, flags, baudRate }); }
  async PassThruDisconnect(channelId: number): Promise<void> { return this.request('PassThruDisconnect', { channelId }); }
  async PassThruReadMsgs(channelId: number, numMsgs: number, timeout: number): Promise<PassThruMsg[]> { return this.request('PassThruReadMsgs', { channelId, numMsgs, timeout }); }
  async PassThruWriteMsgs(channelId: number, msgs: PassThruMsg[], timeout: number): Promise<void> { return this.request('PassThruWriteMsgs', { channelId, msgs, timeout }); }
  async PassThruStartMsgFilter(channelId: number, filterType: number, mask: PassThruMsg, pattern: PassThruMsg, flowControl?: PassThruMsg): Promise<number> { return this.request('PassThruStartMsgFilter', { channelId, filterType, mask, pattern, flowControl }); }
  async PassThruStopMsgFilter(channelId: number, filterId: number): Promise<void> { return this.request('PassThruStopMsgFilter', { channelId, filterId }); }
  async PassThruStartPeriodicMsg(channelId: number, msg: PassThruMsg, timeout: number): Promise<number> { return this.request('PassThruStartPeriodicMsg', { channelId, msg, timeout }); }
  async PassThruStopPeriodicMsg(channelId: number, msgId: number): Promise<void> { return this.request('PassThruStopPeriodicMsg', { channelId, msgId }); }
  async PassThruSetProgrammingVoltage(deviceId: number, pin: number, voltage: number): Promise<void> { return this.request('PassThruSetProgrammingVoltage', { deviceId, pin, voltage }); }
  async PassThruReadVersion(deviceId: number): Promise<{ firmware: string, dll: string, api: string }> { return this.request('PassThruReadVersion', { deviceId }); }
  async PassThruGetLastError(): Promise<string> { return this.request('PassThruGetLastError'); }
  async PassThruIoctl(channelId: number, ioctlId: number, input?: any): Promise<any> { return this.request('PassThruIoctl', { channelId, ioctlId, input }); }
}
