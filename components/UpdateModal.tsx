import React, { useState } from 'react';
import { X, RefreshCw, ExternalLink, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { t } from '../utils/i18n';
import { getAppVersion } from '../utils/version';

interface UpdateModalProps {
  onClose: () => void;
}

type UpdateStatus = 'idle' | 'checking' | 'latest' | 'available' | 'error';

interface ReleaseInfo {
  version: string;
  name: string;
  body: string;
  html_url: string;
  published_at: string;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<string>('');
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const [releaseInfo, setReleaseInfo] = useState<ReleaseInfo | null>(null);
  const [status, setStatus] = useState<UpdateStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // 入场动画
  React.useEffect(() => {
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  // 关闭动画
  const handleClose = () => {
    setIsClosing(true);
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  // 获取当前版本
  React.useEffect(() => {
    getAppVersion().then(v => setCurrentVersion(v));
  }, []);

  // 比较版本号
  const compareVersions = (current: string, latest: string): number => {
    // 移除 -beta, -alpha 等后缀进行比较
    const cleanVersion = (v: string) => v.replace(/-.*$/, '');
    const c = cleanVersion(current).split('.').map(Number);
    const l = cleanVersion(latest).split('.').map(Number);
    
    for (let i = 0; i < Math.max(c.length, l.length); i++) {
      const cv = c[i] || 0;
      const lv = l[i] || 0;
      if (cv < lv) return -1;
      if (cv > lv) return 1;
    }
    return 0;
  };

  // 检查更新
  const checkForUpdates = async () => {
    setStatus('checking');
    setErrorMessage('');
    
    try {
      const response = await fetch('https://api.github.com/repos/trustdev-org/calendar-diary/releases/latest', {
        headers: {
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      const latestVer = data.tag_name?.replace(/^v/, '') || data.name;
      
      setLatestVersion(latestVer);
      setReleaseInfo({
        version: latestVer,
        name: data.name,
        body: data.body || '',
        html_url: data.html_url,
        published_at: data.published_at
      });
      
      // 比较版本
      if (compareVersions(currentVersion, latestVer) < 0) {
        setStatus('available');
      } else {
        setStatus('latest');
      }
    } catch (error: any) {
      setStatus('error');
      setErrorMessage(error.message || t('updateCheckFailed'));
    }
  };

  // 打开发布页
  const openReleasePage = () => {
    const url = 'https://diary.trustdev.org/';
    if (window.electronAPI?.shell?.openExternal) {
      window.electronAPI.shell.openExternal(url);
    } else {
      window.open(url, '_blank');
    }
  };

  // 打开 GitHub Release 页面
  const openGitHubRelease = () => {
    if (releaseInfo?.html_url) {
      if (window.electronAPI?.shell?.openExternal) {
        window.electronAPI.shell.openExternal(releaseInfo.html_url);
      } else {
        window.open(releaseInfo.html_url, '_blank');
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm transition-all duration-200"
      style={{
        backgroundColor: isVisible ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0)',
        opacity: isVisible ? 1 : 0
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div 
        className="bg-white w-[400px] rounded-lg shadow-2xl overflow-hidden flex flex-col transition-all duration-200 ease-out"
        style={{
          transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
          opacity: isVisible ? 1 : 0
        }}
      >
        {/* Header */}
        <div className="bg-[#ececec] px-4 py-2 border-b border-[#dcdcdc] flex justify-between items-center select-none">
          <span className="text-xs font-bold text-stone-600">{t('checkUpdate')}</span>
          <button 
            onClick={handleClose} 
            className="text-stone-400 hover:text-stone-600 transition-colors"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-4">
          {/* 版本信息 */}
          <div className="bg-stone-50 p-4 rounded-lg border border-stone-200 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-stone-600">{t('currentVersion')}</span>
              <span className="text-sm font-mono font-medium text-stone-800">
                {currentVersion || '...'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-stone-600">{t('latestVersion')}</span>
              <span className="text-sm font-mono font-medium text-stone-800">
                {latestVersion || t('unknown')}
              </span>
            </div>
          </div>

          {/* 状态显示 */}
          {status === 'checking' && (
            <div className="flex items-center justify-center gap-2 py-3 text-stone-600">
              <RefreshCw size={16} className="animate-spin" />
              <span className="text-sm">{t('checkingUpdate')}</span>
            </div>
          )}

          {status === 'latest' && (
            <div className="flex items-center justify-center gap-2 py-3 text-green-600 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle size={18} />
              <span className="text-sm font-medium">{t('alreadyLatest')}</span>
            </div>
          )}

          {status === 'available' && (
            <div className="flex flex-col gap-3 py-3 px-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-blue-600">
                <Info size={18} />
                <span className="text-sm font-medium">{t('newVersionAvailable')}</span>
              </div>
              {releaseInfo && (
                <div className="text-xs text-stone-600">
                  <p className="font-medium">{releaseInfo.name}</p>
                  {releaseInfo.published_at && (
                    <p className="text-stone-500 mt-1">
                      {t('publishedAt')}: {new Date(releaseInfo.published_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
              <button
                onClick={openGitHubRelease}
                className="flex items-center justify-center gap-2 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
              >
                <ExternalLink size={14} />
                {t('viewRelease')}
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-center justify-center gap-2 py-3 text-red-600 bg-red-50 rounded-lg border border-red-200">
              <AlertCircle size={18} />
              <span className="text-sm">{t('updateCheckFailed')}: {errorMessage}</span>
            </div>
          )}

          {/* 检查更新按钮 */}
          <button
            onClick={checkForUpdates}
            disabled={status === 'checking'}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-stone-800 hover:bg-stone-900 disabled:bg-stone-400 text-white rounded-md text-sm font-medium transition-colors"
          >
            <RefreshCw size={14} className={status === 'checking' ? 'animate-spin' : ''} />
            {t('checkLatestVersion')}
          </button>

          {/* 分隔线 */}
          <div className="border-t border-stone-200"></div>

          {/* 发布页链接 */}
          <button
            onClick={openReleasePage}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 rounded-md text-sm font-medium transition-colors"
          >
            <ExternalLink size={14} />
            {t('openReleasePage')}
          </button>
        </div>
      </div>
    </div>
  );
};
