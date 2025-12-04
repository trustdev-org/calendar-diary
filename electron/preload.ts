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
  
  // 应用信息
  app: {
    getVersion: () => ipcRenderer.invoke('app:getVersion'),
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
    getVersion: () => Promise<string>; 
  }; 
  platform: string;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
