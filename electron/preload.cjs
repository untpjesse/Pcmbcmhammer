const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  serial: {
    list: () => ipcRenderer.invoke('serial:list'),
    open: (config) => ipcRenderer.invoke('serial:open', config),
    close: () => ipcRenderer.invoke('serial:close'),
    write: (data) => ipcRenderer.invoke('serial:write', data),
    onData: (callback) => ipcRenderer.on('serial:data', (event, data) => callback(data)),
    onError: (callback) => ipcRenderer.on('serial:error', (event, error) => callback(error)),
    removeAllListeners: () => {
      ipcRenderer.removeAllListeners('serial:data');
      ipcRenderer.removeAllListeners('serial:error');
    }
  },
  send: (channel, data) => {
    // whitelist channels
    let validChannels = ['toMain'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel, func) => {
    let validChannels = ['fromMain'];
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender` 
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  }
});
