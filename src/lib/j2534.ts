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
  async PassThruIoctl(channelId: number, ioctlId: number, input?: any): Promise<any> { return this.request('PassThruIoctl', { channelId, ioctlId, input }); }
}

export class MockJ2534 implements IJ2534 {
  private log: (msg: string, type: 'info'|'success'|'warning'|'error') => void;
  private responseQueue: PassThruMsg[] = [];
  
  constructor(logger: (msg: string, type: 'info'|'success'|'warning'|'error') => void) {
    this.log = logger;
  }

  async GetDevices(): Promise<J2534Device[]> {
    this.log('GetDevices() -> Success (Mock Devices)', 'info');
    return [
      { id: 'tactrix_openport_20', name: 'Tactrix OpenPort 2.0', vendor: 'Tactrix Inc.' },
      { id: 'drewtech_mongoose_pro', name: 'MongoosePro GM II', vendor: 'Drew Technologies' },
      { id: 'scanmatik_2_pro', name: 'Scanmatik - SM2 USB', vendor: 'Scanmatik' },
      { id: 'vxdiag_vcx_nano', name: 'VXDIAG VCX Nano', vendor: 'Allscanner' }
    ];
  }

  async PassThruOpen(name: string | null): Promise<number> {
    this.log(`PassThruOpen(${name || 'default'}) -> Success (DeviceID: 1)`, 'success');
    return 1;
  }
  async PassThruClose(deviceId: number): Promise<void> {
    this.log(`PassThruClose(${deviceId}) -> Success`, 'info');
  }
  async PassThruConnect(deviceId: number, protocolId: number, flags: number, baudRate: number): Promise<number> {
    this.log(`PassThruConnect(Device: ${deviceId}, Protocol: ${protocolId}, Baud: ${baudRate}) -> Success (ChannelID: 1)`, 'success');
    return 1;
  }
  async PassThruDisconnect(channelId: number): Promise<void> {
    this.log(`PassThruDisconnect(${channelId}) -> Success`, 'info');
  }
  async PassThruReadMsgs(channelId: number, numMsgs: number, timeout: number): Promise<PassThruMsg[]> {
    if (this.responseQueue.length > 0) {
      const msgs = this.responseQueue.splice(0, numMsgs);
      this.log(`PassThruReadMsgs(Channel: ${channelId}, Count: ${msgs.length}) -> Read ${msgs.length} msg(s)`, 'info');
      return msgs;
    }
    
    // Default fallback if nothing in queue
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([]);
      }, timeout);
    });
  }
  async PassThruWriteMsgs(channelId: number, msgs: PassThruMsg[], timeout: number): Promise<void> {
    this.log(`PassThruWriteMsgs(Channel: ${channelId}, Count: ${msgs.length}) -> Success`, 'info');
    
    // Simulate responses based on written messages
    for (const msg of msgs) {
      if (msg.Data && msg.Data.length > 0) {
        const cmdByte = msg.Data[0];
        let responseData: number[] = [];
        
        if (cmdByte === 0x1A) { // Read Data By Identifier
          responseData = [cmdByte + 0x40, ...msg.Data.slice(1), 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x30];
        } else if (cmdByte === 0x11) { // ECU Reset
          responseData = [cmdByte + 0x40, ...msg.Data.slice(1)];
        } else if (cmdByte === 0x19) { // Read DTC
          responseData = [cmdByte + 0x40, ...msg.Data.slice(1), 0x01, 0x01, 0x01, 0x03, 0x00, 0x04, 0x20];
        } else if (cmdByte === 0x22) { // Read Data By Identifier (UDS)
          responseData = [cmdByte + 0x40, ...msg.Data.slice(1), 0x00, 0x00, 0x00, 0x00];
        } else if (cmdByte === 0x23) { // Read Memory By Address
          responseData = [cmdByte + 0x40, ...msg.Data.slice(1), 0xDE, 0xAD, 0xBE, 0xEF];
        } else if (cmdByte === 0x27) { // Security Access
          if (msg.Data[1] % 2 !== 0) { // Request Seed
            responseData = [cmdByte + 0x40, msg.Data[1], 0xAA, 0xBB, 0xCC, 0xDD];
          } else { // Send Key
            responseData = [cmdByte + 0x40, msg.Data[1]];
          }
        } else if (cmdByte === 0x31) { // Routine Control
          responseData = [cmdByte + 0x40, ...msg.Data.slice(1)];
        } else if (cmdByte === 0x36) { // Transfer Data
          responseData = [cmdByte + 0x40, ...msg.Data.slice(1)];
        } else if (cmdByte === 0x3E) { // Tester Present
          responseData = [cmdByte + 0x40, 0x00];
        } else {
          // Negative response: 7F <cmd> 11 (service not supported)
          responseData = [0x7F, cmdByte, 0x11];
        }
        
        this.responseQueue.push({
          ProtocolID: msg.ProtocolID,
          RxStatus: 0,
          TxFlags: 0,
          Timestamp: Date.now(),
          DataSize: responseData.length,
          ExtraDataIndex: 0,
          Data: responseData
        });
      }
    }
  }
  async PassThruStartMsgFilter(channelId: number, filterType: number, mask: PassThruMsg, pattern: PassThruMsg, flowControl?: PassThruMsg): Promise<number> {
    this.log(`PassThruStartMsgFilter(Channel: ${channelId}, Type: ${filterType}) -> Success (FilterID: 1)`, 'info');
    return 1;
  }
  async PassThruStopMsgFilter(channelId: number, filterId: number): Promise<void> {
    this.log(`PassThruStopMsgFilter(Channel: ${channelId}, Filter: ${filterId}) -> Success`, 'info');
  }
  async PassThruIoctl(channelId: number, ioctlId: number, input?: any): Promise<any> {
    this.log(`PassThruIoctl(Channel: ${channelId}, IOCTL: ${ioctlId}) -> Success`, 'info');
    if (ioctlId === J2534.READ_VBATT) return 13800; // 13.8V
    return null;
  }
}
