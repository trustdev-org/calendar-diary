import React from 'react';
import { X, Github, Calendar } from 'lucide-react';
import { t } from '../utils/i18n';

interface AboutModalProps {
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleGithubClick = async () => {
    const url = 'https://github.com/trustdev-org/calendar-diary';
    
    if (window.electronAPI) {
      // Electron环境：使用shell.openExternal在系统默认浏览器中打开
      try {
        await window.electronAPI.shell.openExternal(url);
      } catch (error) {
        console.error('Failed to open URL:', error);
        window.open(url, '_blank');
      }
    } else {
      // 浏览器环境：直接在新标签页打开
      window.open(url, '_blank');
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
        className="bg-white w-[420px] rounded-lg shadow-2xl overflow-hidden flex flex-col transition-all duration-200 ease-out"
        style={{
          transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
          opacity: isVisible ? 1 : 0
        }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-100 to-stone-50 px-5 py-4 border-b border-stone-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg shadow-sm">
              <Calendar size={24} className="text-stone-700" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-stone-800">{t('appTitle')}</h2>
              <p className="text-xs text-stone-500">v0.1.0-beta</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-stone-400 hover:text-stone-600 transition-colors"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Description */}
          <div>
            <h3 className="text-sm font-bold text-stone-700 mb-2">{t('aboutApp')}</h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              {t('appDescription')}
            </p>
          </div>

          {/* Version Info */}
          <div className="bg-stone-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-stone-500">{t('version')}</span>
              <span className="font-mono text-stone-700">0.1.0-beta</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-stone-500">{t('platform')}</span>
              <span className="font-mono text-stone-700">
                {window.electronAPI ? 'Electron' : 'Web'}
              </span>
            </div>
          </div>

          {/* GitHub Link */}
          <div>
            <button
              onClick={handleGithubClick}
              className="w-full flex items-center justify-center gap-2 bg-stone-800 hover:bg-stone-900 text-white px-4 py-3 rounded-lg transition-colors shadow-sm"
            >
              <Github size={18} />
              <span className="font-medium">GitHub</span>
              <span className="text-sm opacity-75">trustdev-org/calendar-diary</span>
            </button>
          </div>

          {/* Copyright */}
          <div className="text-center text-xs text-stone-400 pt-2 border-t border-stone-100">
            <div>© 2025 TrustDev. {t('allRightsReserved')}</div>
            <div className="mt-1 text-stone-300">Licensed under CC BY-NC 4.0</div>
          </div>
        </div>
      </div>
    </div>
  );
};
