const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

const isDev = !app.isPackaged;

let mainWindow;
let activePort = null;
let SerialPort;

async function initSerialPort() {
  if (!SerialPort) {
    const serialportModule = await import('serialport');
    SerialPort = serialportModule.SerialPort;
  }
}

async function createWindow() {
  await initSerialPort();

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    },
    icon: path.join(__dirname, '../public/icon.svg')
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

// Serial Port IPC Handlers
ipcMain.handle('serial:list', async () => {
  try {
    return await SerialPort.list();
  } catch (error) {
    console.error('Error listing ports:', error);
    return [];
  }
});

ipcMain.handle('serial:open', async (event, { path, baudRate }) => {
  return new Promise((resolve, reject) => {
    if (activePort && activePort.isOpen) {
      activePort.close();
    }

    activePort = new SerialPort({ path, baudRate, autoOpen: false });

    activePort.open((err) => {
      if (err) {
        console.error('Error opening port:', err);
        return reject(err.message);
      }

      activePort.on('data', (data) => {
        if (mainWindow) {
          mainWindow.webContents.send('serial:data', data);
        }
      });

      activePort.on('error', (err) => {
        if (mainWindow) {
          mainWindow.webContents.send('serial:error', err.message);
        }
      });

      resolve(true);
    });
  });
});

ipcMain.handle('serial:close', async () => {
  return new Promise((resolve) => {
    if (activePort && activePort.isOpen) {
      activePort.close((err) => {
        activePort = null;
        resolve(!err);
      });
    } else {
      resolve(true);
    }
  });
});

ipcMain.handle('serial:write', async (event, data) => {
  return new Promise((resolve, reject) => {
    if (!activePort || !activePort.isOpen) {
      return reject('Port not open');
    }

    activePort.write(Buffer.from(data), (err) => {
      if (err) {
        return reject(err.message);
      }
      resolve(true);
    });
  });
});

app.whenReady().then(async () => {
  await createWindow();

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
