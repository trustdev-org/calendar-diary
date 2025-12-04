import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Cloud, RefreshCw, Download, Upload, Trash2, AlertCircle, CheckCircle, Settings, RotateCcw } from 'lucide-react';
import { t } from '../utils/i18n';
import { WebDAVService, webdavService, WebDAVConfig, SyncData, BackupFile } from '../services/webdavService';
import { StorageService } from '../services/storageService';

interface CloudSyncModalProps {
  onClose: () => void;
  onOpenWebDAVSettings: () => void;
  onDataRestored: () => void; // 数据恢复后通知刷新
}

type LogEntry = {
  id: number;
  time: string;
  message: string;
  type: 'info' | 'error' | 'success';
};

type ConflictChoice = 'remote' | 'local' | 'cancel';

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({ 
  onClose, 
  onOpenWebDAVSettings,
  onDataRestored 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [config, setConfig] = useState<WebDAVConfig | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [connectionError, setConnectionError] = useState<string>('');
  
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [lastBackupTime, setLastBackupTime] = useState<string | null>(null);
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isLoadingBackups, setIsLoadingBackups] = useState(false);
  const [restoringFile, setRestoringFile] = useState<string | null>(null);
  const [deletingFile, setDeletingFile] = useState<string | null>(null);
  
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logIdRef = useRef(0);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // 冲突确认弹窗状态
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [conflictResolver, setConflictResolver] = useState<((choice: ConflictChoice) => void) | null>(null);

  // 恢复确认弹窗状态
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [restoreTarget, setRestoreTarget] = useState<BackupFile | null>(null);
  const [restoreResolver, setRestoreResolver] = useState<((choice: 'backup-restore' | 'direct-restore' | 'cancel') => void) | null>(null);

  // 删除确认弹窗状态
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BackupFile | null>(null);

  // 添加日志
  const addLog = useCallback((message: string, type: 'info' | 'error' | 'success' = 'info') => {
    const now = new Date();
    const time = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const entry: LogEntry = {
      id: ++logIdRef.current,
      time,
      message,
      type,
    };
    setLogs(prev => [...prev, entry]);
  }, []);

  // 自动滚动日志
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // 初始化
  useEffect(() => {
    setIsVisible(true);
    const storedConfig = WebDAVService.getStoredConfig();
    
    if (storedConfig) {
      setConfig(storedConfig);
      initializeAndTest(storedConfig);
    } else {
      setConnectionStatus('error');
      setConnectionError(t('webdavNotConfigured'));
    }

    // 加载上次同步和备份时间
    const storedSyncTime = localStorage.getItem('calendar-diary-last-sync');
    const storedBackupTime = localStorage.getItem('calendar-diary-last-backup');
    if (storedSyncTime) setLastSyncTime(storedSyncTime);
    if (storedBackupTime) setLastBackupTime(storedBackupTime);
  }, []);

  // 初始化并测试连接
  const initializeAndTest = async (cfg: WebDAVConfig) => {
    setConnectionStatus('checking');
    addLog(t('cloudSyncConnecting'), 'info');
    
    try {
      webdavService.initialize(cfg);
      const result = await webdavService.testConnection();
      
      if (result.success) {
        setConnectionStatus('connected');
        setConnectionError('');
        addLog(t('cloudSyncConnected'), 'success');
        loadBackups();
      } else {
        setConnectionStatus('error');
        setConnectionError(result.error || t('cloudSyncConnectFailed'));
        addLog(`${t('cloudSyncConnectFailed')}: ${result.error}`, 'error');
      }
    } catch (error: any) {
      setConnectionStatus('error');
      setConnectionError(error.message);
      addLog(`${t('cloudSyncConnectFailed')}: ${error.message}`, 'error');
    }
  };

  // 加载备份列表
  const loadBackups = async () => {
    setIsLoadingBackups(true);
    addLog(t('cloudSyncLoadingBackups'), 'info');
    
    try {
      const list = await webdavService.listBackups();
      setBackups(list);
      addLog(t('cloudSyncBackupsLoaded').replace('{count}', String(list.length)), 'success');
    } catch (error: any) {
      addLog(`${t('cloudSyncLoadBackupsFailed')}: ${error.message}`, 'error');
    } finally {
      setIsLoadingBackups(false);
    }
  };

  // 获取本地数据
  const getLocalData = async (): Promise<SyncData> => {
    const data = await StorageService.getData();
    const plans = await StorageService.getPlans();
    
    // 读取已保存的 updatedAt，如果没有则使用当前时间
    const storedUpdatedAt = localStorage.getItem('calendar-diary-data-updated-at');
    
    return {
      version: 1,
      updatedAt: storedUpdatedAt || new Date().toISOString(),
      data: data || {},
      monthlyPlans: plans || {},
    };
  };

  // 保存本地数据
  const saveLocalData = async (syncData: SyncData) => {
    await StorageService.setData(syncData.data);
    await StorageService.setPlans(syncData.monthlyPlans);
    localStorage.setItem('calendar-diary-data-updated-at', syncData.updatedAt);
  };

  // 更新本地数据的 updatedAt
  const updateLocalTimestamp = () => {
    const now = new Date().toISOString();
    localStorage.setItem('calendar-diary-data-updated-at', now);
    return now;
  };

  // 显示冲突确认弹窗
  const showConflict = (): Promise<ConflictChoice> => {
    return new Promise((resolve) => {
      setConflictResolver(() => resolve);
      setShowConflictDialog(true);
    });
  };

  // 立即同步
  const handleSync = async () => {
    if (connectionStatus !== 'connected' || isSyncing) return;
    
    setIsSyncing(true);
    addLog(t('cloudSyncStarting'), 'info');
    
    try {
      // 读取云端数据
      const remoteData = await webdavService.readRemoteData();
      const localData = await getLocalData();
      
      if (!remoteData) {
        // 首次同步：上传本地数据
        addLog(t('cloudSyncFirstSync'), 'info');
        const dataToUpload = {
          ...localData,
          updatedAt: updateLocalTimestamp(),
        };
        await webdavService.writeRemoteData(dataToUpload);
        addLog(t('cloudSyncFirstSyncDone'), 'success');
      } else {
        // 比较时间戳
        const localTime = new Date(localData.updatedAt).getTime();
        const remoteTime = new Date(remoteData.updatedAt).getTime();
        
        if (localTime > remoteTime) {
          // 本地更新更晚：上传覆盖云端
          addLog(t('cloudSyncLocalNewer'), 'info');
          const dataToUpload = {
            ...localData,
            updatedAt: updateLocalTimestamp(),
          };
          await webdavService.writeRemoteData(dataToUpload);
          addLog(t('cloudSyncUploadDone'), 'success');
        } else if (remoteTime > localTime) {
          // 云端更新更晚：显示冲突确认
          addLog(t('cloudSyncConflictDetected'), 'info');
          const choice = await showConflict();
          
          if (choice === 'remote') {
            // 用云端覆盖本地
            await saveLocalData(remoteData);
            addLog(t('cloudSyncRemoteOverwriteLocal'), 'success');
            onDataRestored();
          } else if (choice === 'local') {
            // 用本地覆盖云端
            const dataToUpload = {
              ...localData,
              updatedAt: updateLocalTimestamp(),
            };
            await webdavService.writeRemoteData(dataToUpload);
            addLog(t('cloudSyncLocalOverwriteRemote'), 'success');
          } else {
            addLog(t('cloudSyncCancelled'), 'info');
          }
        } else {
          addLog(t('cloudSyncAlreadyUpToDate'), 'success');
        }
      }
      
      // 更新最近同步时间
      const now = new Date().toISOString();
      setLastSyncTime(now);
      localStorage.setItem('calendar-diary-last-sync', now);
      addLog(t('cloudSyncComplete'), 'success');
      
    } catch (error: any) {
      addLog(`${t('cloudSyncFailed')}: ${error.message}`, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // 立即备份
  const handleBackup = async () => {
    if (connectionStatus !== 'connected' || isBackingUp) return;
    
    setIsBackingUp(true);
    addLog(t('cloudBackupStarting'), 'info');
    
    try {
      const localData = await getLocalData();
      const filename = await webdavService.createBackup(localData);
      
      addLog(t('cloudBackupCreated').replace('{filename}', filename), 'success');
      
      // 更新最近备份时间
      const now = new Date().toISOString();
      setLastBackupTime(now);
      localStorage.setItem('calendar-diary-last-backup', now);
      
      // 刷新备份列表
      await loadBackups();
      
    } catch (error: any) {
      addLog(`${t('cloudBackupFailed')}: ${error.message}`, 'error');
    } finally {
      setIsBackingUp(false);
    }
  };

  // 显示恢复确认弹窗
  const showRestoreConfirm = (backup: BackupFile): Promise<'backup-restore' | 'direct-restore' | 'cancel'> => {
    return new Promise((resolve) => {
      setRestoreTarget(backup);
      setRestoreResolver(() => resolve);
      setShowRestoreDialog(true);
    });
  };

  // 恢复备份
  const handleRestore = async (backup: BackupFile) => {
    const choice = await showRestoreConfirm(backup);
    
    if (choice === 'cancel') {
      addLog(t('cloudRestoreCancelled'), 'info');
      return;
    }
    
    setRestoringFile(backup.filename);
    
    try {
      // 如果选择先备份再恢复
      if (choice === 'backup-restore') {
        addLog(t('cloudRestoreBackingUpFirst'), 'info');
        const localData = await getLocalData();
        await webdavService.createBackup(localData);
        addLog(t('cloudRestoreBackupCreated'), 'success');
      }
      
      // 执行恢复
      addLog(t('cloudRestoreStarting').replace('{filename}', backup.filename), 'info');
      const backupData = await webdavService.readBackup(backup.filename);
      
      // 校验数据格式
      if (!backupData.data || typeof backupData.data !== 'object') {
        throw new Error(t('cloudRestoreInvalidFormat'));
      }
      
      await saveLocalData(backupData);
      addLog(t('cloudRestoreComplete').replace('{filename}', backup.filename), 'success');
      
      // 通知主程序刷新
      onDataRestored();
      
      // 刷新备份列表
      await loadBackups();
      
    } catch (error: any) {
      addLog(`${t('cloudRestoreFailed')}: ${error.message}`, 'error');
    } finally {
      setRestoringFile(null);
    }
  };

  // 删除备份
  const handleDelete = async (backup: BackupFile) => {
    setDeleteTarget(backup);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    
    setShowDeleteDialog(false);
    setDeletingFile(deleteTarget.filename);
    
    try {
      addLog(t('cloudDeleteStarting').replace('{filename}', deleteTarget.filename), 'info');
      await webdavService.deleteBackup(deleteTarget.filename);
      addLog(t('cloudDeleteComplete').replace('{filename}', deleteTarget.filename), 'success');
      await loadBackups();
    } catch (error: any) {
      addLog(`${t('cloudDeleteFailed')}: ${error.message}`, 'error');
    } finally {
      setDeletingFile(null);
      setDeleteTarget(null);
    }
  };

  // 简化的服务器地址显示
  const getServerDisplay = () => {
    if (!config) return '';
    try {
      const url = new URL(config.serverUrl);
      return url.hostname;
    } catch {
      return config.serverUrl;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm transition-all duration-200"
      style={{
        backgroundColor: isVisible ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0)',
        opacity: isVisible ? 1 : 0
      }}
    >
      <div 
        className="bg-white w-[700px] max-w-[95vw] max-h-[85vh] rounded-lg shadow-2xl overflow-hidden flex flex-col transition-all duration-200 ease-out"
        style={{
          transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
          opacity: isVisible ? 1 : 0
        }}
      >
        {/* Header */}
        <div className="bg-[#ececec] px-4 py-3 border-b border-[#dcdcdc] flex justify-between items-center select-none shrink-0">
          <div className="flex items-center gap-2">
            <Cloud size={18} className="text-blue-500" />
            <span className="text-sm font-bold text-stone-700">{t('cloudSync')}</span>
          </div>
          <button 
            onClick={onClose} 
            className="text-stone-400 hover:text-stone-600 transition-colors"
            title={t('close')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Status Area */}
        <div className="px-4 py-3 bg-stone-50 border-b border-stone-200 space-y-2 shrink-0">
          {/* Connection Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {connectionStatus === 'checking' && (
                <RefreshCw size={14} className="text-stone-400 animate-spin" />
              )}
              {connectionStatus === 'connected' && (
                <CheckCircle size={14} className="text-green-500" />
              )}
              {connectionStatus === 'error' && (
                <AlertCircle size={14} className="text-red-500" />
              )}
              <span className="text-xs text-stone-600">
                {connectionStatus === 'checking' && t('cloudSyncConnecting')}
                {connectionStatus === 'connected' && `${t('cloudSyncConnectedTo')}: ${getServerDisplay()}`}
                {connectionStatus === 'error' && connectionError}
              </span>
            </div>
            {connectionStatus === 'error' && (
              <button
                onClick={onOpenWebDAVSettings}
                className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
              >
                <Settings size={12} />
                {t('cloudSyncOpenSettings')}
              </button>
            )}
          </div>
          
          {/* Sync Times */}
          {connectionStatus === 'connected' && (
            <div className="flex gap-6 text-xs text-stone-500">
              <span>
                {t('cloudSyncLastSync')}: {lastSyncTime ? WebDAVService.formatDateTime(lastSyncTime) : t('cloudSyncNever')}
              </span>
              <span>
                {t('cloudSyncLastBackup')}: {lastBackupTime ? WebDAVService.formatDateTime(lastBackupTime) : t('cloudSyncNever')}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="px-4 py-3 border-b border-stone-200 flex gap-2 shrink-0">
          <button
            onClick={handleSync}
            disabled={connectionStatus !== 'connected' || isSyncing}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              connectionStatus !== 'connected' || isSyncing
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isSyncing ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <RefreshCw size={14} />
            )}
            {t('cloudSyncNow')}
          </button>
          
          <button
            onClick={handleBackup}
            disabled={connectionStatus !== 'connected' || isBackingUp}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              connectionStatus !== 'connected' || isBackingUp
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {isBackingUp ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <Upload size={14} />
            )}
            {t('cloudBackupNow')}
          </button>
          
          <button
            onClick={loadBackups}
            disabled={connectionStatus !== 'connected' || isLoadingBackups}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              connectionStatus !== 'connected' || isLoadingBackups
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
            }`}
          >
            {isLoadingBackups ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <RefreshCw size={14} />
            )}
            {t('cloudRefreshBackups')}
          </button>
        </div>

        {/* Logs Area */}
        <div className="px-4 py-2 border-b border-stone-200 shrink-0">
          <div className="text-xs font-bold text-stone-500 mb-1">{t('cloudSyncLogs')}</div>
          <div className="h-24 overflow-y-auto bg-stone-900 rounded p-2 font-mono text-xs">
            {logs.map((log) => (
              <div
                key={log.id}
                className={`leading-relaxed ${
                  log.type === 'error' ? 'text-red-400' :
                  log.type === 'success' ? 'text-green-400' :
                  'text-stone-300'
                }`}
              >
                <span className="text-stone-500">[{log.time}]</span> {log.message}
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>

        {/* Backups List */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          <div className="text-xs font-bold text-stone-500 mb-2">{t('cloudBackupsList')}</div>
          
          {backups.length === 0 ? (
            <div className="text-center py-8 text-stone-400">
              <Cloud size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">{t('cloudNoBackups')}</p>
            </div>
          ) : (
            <div className="space-y-1">
              {backups.map((backup) => (
                <div
                  key={backup.filename}
                  className="flex items-center justify-between py-2 px-3 bg-stone-50 rounded-md hover:bg-stone-100 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-stone-700 truncate">{backup.filename}</div>
                    <div className="text-xs text-stone-500">
                      {WebDAVService.formatDateTime(backup.lastModified)} · {WebDAVService.formatFileSize(backup.size)}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4 shrink-0">
                    <button
                      onClick={() => handleRestore(backup)}
                      disabled={restoringFile === backup.filename}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition-all ${
                        restoringFile === backup.filename
                          ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      {restoringFile === backup.filename ? (
                        <RefreshCw size={12} className="animate-spin" />
                      ) : (
                        <RotateCcw size={12} />
                      )}
                      {t('cloudRestore')}
                    </button>
                    <button
                      onClick={() => handleDelete(backup)}
                      disabled={deletingFile === backup.filename}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition-all ${
                        deletingFile === backup.filename
                          ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      {deletingFile === backup.filename ? (
                        <RefreshCw size={12} className="animate-spin" />
                      ) : (
                        <Trash2 size={12} />
                      )}
                      {t('cloudDelete')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-stone-50 border-t border-stone-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-medium bg-stone-200 text-stone-700 hover:bg-stone-300 transition-all"
          >
            {t('close')}
          </button>
        </div>
      </div>

      {/* Conflict Dialog */}
      {showConflictDialog && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-[400px] max-w-[90vw]">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle size={20} className="text-amber-500" />
              <h3 className="font-bold text-lg">{t('cloudSyncConflictTitle')}</h3>
            </div>
            <p className="text-sm text-stone-600 mb-4">{t('cloudSyncConflictMessage')}</p>
            <div className="space-y-2">
              <button
                onClick={() => { setShowConflictDialog(false); conflictResolver?.('remote'); }}
                className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium"
              >
                {t('cloudSyncUseRemote')}
              </button>
              <button
                onClick={() => { setShowConflictDialog(false); conflictResolver?.('local'); }}
                className="w-full py-2 px-4 bg-stone-200 text-stone-700 rounded-md hover:bg-stone-300 text-sm font-medium"
              >
                {t('cloudSyncUseLocal')}
              </button>
              <button
                onClick={() => { setShowConflictDialog(false); conflictResolver?.('cancel'); }}
                className="w-full py-2 px-4 text-stone-500 hover:text-stone-700 text-sm"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Dialog */}
      {showRestoreDialog && restoreTarget && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-[420px] max-w-[90vw]">
            <div className="flex items-center gap-2 mb-4">
              <RotateCcw size={20} className="text-blue-500" />
              <h3 className="font-bold text-lg">{t('cloudRestoreConfirmTitle')}</h3>
            </div>
            <p className="text-sm text-stone-600 mb-2">{t('cloudRestoreConfirmMessage')}</p>
            <p className="text-xs text-stone-400 mb-4">{t('cloudRestoreConfirmHint')}</p>
            <div className="space-y-2">
              <button
                onClick={() => { setShowRestoreDialog(false); restoreResolver?.('backup-restore'); }}
                className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium"
              >
                {t('cloudRestoreBackupFirst')}
              </button>
              <button
                onClick={() => { setShowRestoreDialog(false); restoreResolver?.('direct-restore'); }}
                className="w-full py-2 px-4 bg-amber-500 text-white rounded-md hover:bg-amber-600 text-sm font-medium"
              >
                {t('cloudRestoreDirect')}
              </button>
              <button
                onClick={() => { setShowRestoreDialog(false); restoreResolver?.('cancel'); }}
                className="w-full py-2 px-4 text-stone-500 hover:text-stone-700 text-sm"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      {showDeleteDialog && deleteTarget && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-[400px] max-w-[90vw]">
            <div className="flex items-center gap-2 mb-4">
              <Trash2 size={20} className="text-red-500" />
              <h3 className="font-bold text-lg">{t('cloudDeleteConfirmTitle')}</h3>
            </div>
            <p className="text-sm text-stone-600 mb-4">{t('cloudDeleteConfirmMessage')}</p>
            <p className="text-xs text-stone-500 mb-4 font-mono bg-stone-100 p-2 rounded">{deleteTarget.filename}</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setShowDeleteDialog(false); setDeleteTarget(null); }}
                className="py-2 px-4 text-stone-500 hover:text-stone-700 text-sm"
              >
                {t('cancel')}
              </button>
              <button
                onClick={confirmDelete}
                className="py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm font-medium"
              >
                {t('cloudDeleteConfirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
