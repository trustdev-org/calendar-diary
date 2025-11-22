import React, { useState, useEffect } from 'react';
import { Download, X, RefreshCw } from 'lucide-react';

export const UpdateNotification: React.FC = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [updateDownloaded, setUpdateDownloaded] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<any>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!window.electronAPI?.app) return;

    // 监听更新可用
    window.electronAPI.app.onUpdateAvailable((info) => {
      console.log('Update available:', info);
      setUpdateInfo(info);
      setUpdateAvailable(true);
      setVisible(true);
    });

    // 监听下载进度
    window.electronAPI.app.onDownloadProgress((progress) => {
      console.log('Download progress:', progress.percent);
      setDownloadProgress(Math.round(progress.percent));
    });

    // 监听更新下载完成
    window.electronAPI.app.onUpdateDownloaded((info) => {
      console.log('Update downloaded:', info);
      setDownloading(false);
      setUpdateDownloaded(true);
    });

    // 监听更新错误
    window.electronAPI.app.onUpdateError((error) => {
      console.error('Update error:', error);
      setDownloading(false);
      setVisible(false);
    });
  }, []);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await window.electronAPI.app.downloadUpdate();
    } catch (error) {
      console.error('Error downloading update:', error);
      setDownloading(false);
    }
  };

  const handleInstall = async () => {
    try {
      await window.electronAPI.app.installUpdate();
    } catch (error) {
      console.error('Error installing update:', error);
    }
  };

  const handleClose = () => {
    setVisible(false);
  };

  if (!visible || !updateAvailable) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-2xl border border-stone-200 p-4 w-80 animate-in slide-in-from-top-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <RefreshCw className="text-blue-500" size={20} />
          <h3 className="font-serif font-bold text-lg">发现新版本</h3>
        </div>
        <button 
          onClick={handleClose}
          className="text-stone-400 hover:text-stone-600 transition-colors"
          aria-label="关闭更新通知"
        >
          <X size={18} />
        </button>
      </div>

      <div className="space-y-3">
        {updateInfo && (
          <div className="text-sm text-stone-600">
            <p>版本: <span className="font-mono font-semibold">{updateInfo.version}</span></p>
          </div>
        )}

        {downloading ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-stone-600">
              <span>下载中...</span>
              <span className="font-mono font-semibold">{downloadProgress}%</span>
            </div>
            <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-blue-500 h-full transition-all duration-300 ease-out"
                style={{ width: `${downloadProgress}%` }}
              />
            </div>
          </div>
        ) : updateDownloaded ? (
          <div className="space-y-2">
            <p className="text-sm text-green-600 font-medium">✓ 更新已下载完成</p>
            <button
              onClick={handleInstall}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium"
            >
              <RefreshCw size={16} />
              立即安装并重启
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-stone-600">有新版本可用，点击下载更新</p>
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
            >
              <Download size={16} />
              下载更新
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
