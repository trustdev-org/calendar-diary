const { contextBridge, ipcRenderer } = require('electron');

// 暴露安全的 API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 数据存储
  storage: {
    getData: () => ipcRenderer.invoke('storage:getData'),
    setData: (data: any) => ipcRenderer.invoke('storage:setData', data),
    getPlans: () => ipcRenderer.invoke('storage:getPlans'),
    setPlans: (plans: any) => ipcRenderer.invoke('storage:setPlans', plans),
    getDataPath: () => ipcRenderer.invoke('storage:getDataPath'),
    openDataFolder: () => ipcRenderer.invoke('storage:openDataFolder'),
  },
  
  // 窗口控制
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close'),
  },
  
  // Shell操作
  shell: {
    openExternal: (url: string) => ipcRenderer.invoke('shell:openExternal', url),
  },
  
  // 应用更新
  app: {
    checkForUpdates: () => ipcRenderer.invoke('app:checkForUpdates'),
    downloadUpdate: () => ipcRenderer.invoke('app:downloadUpdate'),
    installUpdate: () => ipcRenderer.invoke('app:installUpdate'),
    onUpdateAvailable: (callback: (info: any) => void) => {
      ipcRenderer.on('update-available', (_event, info) => callback(info));
    },
    onDownloadProgress: (callback: (progress: any) => void) => {
      ipcRenderer.on('download-progress', (_event, progress) => callback(progress));
    },
    onUpdateDownloaded: (callback: (info: any) => void) => {
      ipcRenderer.on('update-downloaded', (_event, info) => callback(info));
    },
    onUpdateError: (callback: (error: any) => void) => {
      ipcRenderer.on('update-error', (_event, error) => callback(error));
    },
  },
  
  // 平台信息
  platform: process.platform,
});

// 类型定义
export interface ElectronAPI {
  storage: {
    getData: () => Promise<any>;
    setData: (data: any) => Promise<{ success: boolean; error?: string }>;
    getPlans: () => Promise<any>;
    setPlans: (plans: any) => Promise<{ success: boolean; error?: string }>;
    getDataPath: () => Promise<string>;
    openDataFolder: () => Promise<{ success: boolean; error?: string }>;
  };
  window: {
    minimize: () => void;
    maximize: () => void;
    close: () => void;
  };
  shell: {
    openExternal: (url: string) => Promise<void>;
  };
  app: {
    checkForUpdates: () => Promise<{ success: boolean; updateInfo?: any; error?: string }>;
    downloadUpdate: () => Promise<{ success: boolean; error?: string }>;
    installUpdate: () => Promise<void>;
    onUpdateAvailable: (callback: (info: any) => void) => void;
    onDownloadProgress: (callback: (progress: any) => void) => void;
    onUpdateDownloaded: (callback: (info: any) => void) => void;
    onUpdateError: (callback: (error: any) => void) => void;
  };
  platform: string;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
