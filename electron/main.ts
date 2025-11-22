const { app, BrowserWindow, ipcMain, shell } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs/promises');

// Set app name for proper data storage path
app.setName('CalendarDiary');

// Configure auto-updater
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

// 配置更新日志
autoUpdater.logger = {
  info: (message: any) => console.log('[AutoUpdater]', message),
  warn: (message: any) => console.warn('[AutoUpdater]', message),
  error: (message: any) => console.error('[AutoUpdater]', message),
  debug: (message: any) => console.debug('[AutoUpdater]', message)
};

// 数据存储路径
const USER_DATA_PATH = app.getPath('userData');
const DATA_FILE = path.join(USER_DATA_PATH, 'calendar_data.json');
const PLANS_FILE = path.join(USER_DATA_PATH, 'calendar_plans.json');

let mainWindow: typeof BrowserWindow | null = null;

// 确保数据文件存在
async function ensureDataFiles() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, '{}');
  }
  
  try {
    await fs.access(PLANS_FILE);
  } catch {
    await fs.writeFile(PLANS_FILE, '{}');
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    transparent: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // 开发环境加载 Vite 服务器
  if (process.env.NODE_ENV === 'development') {
    mainWindow?.loadURL('http://localhost:5173');
    // mainWindow?.webContents.openDevTools(); // 调试模式已关闭
  } else {
    // 生产环境加载打包后的文件
    mainWindow?.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow?.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  await ensureDataFiles();
  createWindow();

  // Check for updates after window is created (production only)
  if (process.env.NODE_ENV !== 'development' && !process.env.DEBUG) {
    console.log('[AutoUpdater] Scheduling update check in 3 seconds...');
    setTimeout(() => {
      console.log('[AutoUpdater] Starting update check...');
      autoUpdater.checkForUpdates().catch((err: Error) => {
        console.error('[AutoUpdater] Failed to check for updates:', err);
      });
    }, 3000);
  } else {
    console.log('[AutoUpdater] Update check skipped (development mode)');
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers for data persistence
ipcMain.handle('storage:getData', async () => {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data:', error);
    return {};
  }
});

ipcMain.handle('storage:setData', async (_: any, data: any) => {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    return { success: true };
  } catch (error) {
    console.error('Error writing data:', error);
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('storage:getPlans', async () => {
  try {
    const plans = await fs.readFile(PLANS_FILE, 'utf-8');
    return JSON.parse(plans);
  } catch (error) {
    console.error('Error reading plans:', error);
    return {};
  }
});

ipcMain.handle('storage:setPlans', async (_: any, plans: any) => {
  try {
    await fs.writeFile(PLANS_FILE, JSON.stringify(plans, null, 2));
    return { success: true };
  } catch (error) {
    console.error('Error writing plans:', error);
    return { success: false, error: String(error) };
  }
});

// Window controls
ipcMain.on('window:minimize', () => {
  mainWindow?.minimize();
});

ipcMain.on('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.on('window:close', () => {
  mainWindow?.close();
});

// Get data file path
ipcMain.handle('storage:getDataPath', async () => {
  return USER_DATA_PATH;
});

// Open data folder
ipcMain.handle('storage:openDataFolder', async () => {
  try {
    await shell.openPath(USER_DATA_PATH);
    return { success: true };
  } catch (error) {
    console.error('Error opening folder:', error);
    return { success: false, error: String(error) };
  }
});

// Open external URL in default browser
ipcMain.handle('shell:openExternal', async (_event: any, url: string) => {
  try {
    await shell.openExternal(url);
  } catch (error) {
    console.error('Error opening external URL:', error);
    throw error;
  }
});

// Auto-updater events
autoUpdater.on('checking-for-update', () => {
  console.log('Checking for updates...');
});

autoUpdater.on('update-available', (info: any) => {
  console.log('Update available:', info);
  mainWindow?.webContents.send('update-available', info);
});

autoUpdater.on('update-not-available', (info: any) => {
  console.log('Update not available:', info);
});

autoUpdater.on('error', (err: any) => {
  console.error('Update error:', err);
  mainWindow?.webContents.send('update-error', err);
});

autoUpdater.on('download-progress', (progressObj: any) => {
  console.log('Download progress:', progressObj.percent);
  mainWindow?.webContents.send('download-progress', progressObj);
});

autoUpdater.on('update-downloaded', (info: any) => {
  console.log('Update downloaded:', info);
  mainWindow?.webContents.send('update-downloaded', info);
});

// IPC handlers for update
ipcMain.handle('app:checkForUpdates', async () => {
  try {
    const result = await autoUpdater.checkForUpdates();
    return { success: true, updateInfo: result?.updateInfo };
  } catch (error) {
    console.error('Error checking for updates:', error);
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('app:downloadUpdate', async () => {
  try {
    await autoUpdater.downloadUpdate();
    return { success: true };
  } catch (error) {
    console.error('Error downloading update:', error);
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('app:installUpdate', () => {
  autoUpdater.quitAndInstall(false, true);
});
