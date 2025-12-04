const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs/promises');

// Set app name for proper data storage path
app.setName('CalendarDiary');

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

// App version
ipcMain.handle('app:getVersion', () => {
  return app.getVersion();
});
