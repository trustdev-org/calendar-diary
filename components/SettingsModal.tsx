
import React, { useState, useEffect } from 'react';
import { X, Folder, Download, Upload, HardDrive, Globe } from 'lucide-react';
import { t, setLanguage, getCurrentLanguage, languageNames, type Language } from '../utils/i18n';

interface SettingsModalProps {
  onClose: () => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, onExport, onImport }) => {
  const [dataPath, setDataPath] = useState('LocalStorage (Browser)');
  const [isElectron, setIsElectron] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(getCurrentLanguage());
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const checkElectron = async () => {
      if (window.electronAPI) {
        setIsElectron(true);
        try {
          const path = await window.electronAPI.storage.getDataPath();
          setDataPath(path);
        } catch (error) {
          console.error('Failed to get data path:', error);
        }
      }
    };
    checkElectron();
  }, []);

  const handleLanguageChange = (lang: Language) => {
    setSelectedLanguage(lang);
    setLanguage(lang);
    // Force re-render by closing and reopening
    window.location.reload();
  };

  const handleOpenFolder = async () => {
    if (window.electronAPI) {
      try {
        await window.electronAPI.storage.openDataFolder();
      } catch (error) {
        console.error('Failed to open folder:', error);
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
    >
      <div 
        className="bg-white w-[500px] rounded-lg shadow-2xl overflow-hidden flex flex-col transition-all duration-200 ease-out"
        style={{
          transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
          opacity: isVisible ? 1 : 0
        }}
      >
        <div className="bg-[#ececec] px-4 py-2 border-b border-[#dcdcdc] flex justify-between items-center select-none">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-600">{t('settings')}</span>
            <span className="text-[10px] text-stone-400 font-mono">v0.1.0-beta</span>
          </div>
          <button 
            onClick={onClose} 
            className="text-stone-400 hover:text-stone-600 transition-colors"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6">
            {/* Data Section */}
            <section>
                <h3 className="text-sm font-bold text-stone-700 mb-3 flex items-center gap-2">
                    <HardDrive size={16} /> {t('storageData')}
                </h3>
                <div className="bg-stone-50 p-4 rounded-md border border-stone-200 space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-stone-500 mb-1">{t('dataLocation')}</label>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={dataPath}
                                disabled 
                                title="Data location"
                                className="flex-1 bg-white border border-stone-300 rounded px-2 py-1.5 text-xs text-stone-500 font-mono select-none"
                            />
                            {isElectron && (
                                <button 
                                    onClick={handleOpenFolder}
                                    className="bg-white border border-stone-300 text-stone-600 px-3 py-1 rounded hover:bg-stone-100 transition-colors"
                                    title="Open folder"
                                >
                                    <Folder size={14} />
                                </button>
                            )}
                        </div>
                        <p className="text-[10px] text-stone-400 mt-1">
                            {isElectron ? 'Files: paperplan_data.json, paperplan_plans.json' : 'Data stored in browser LocalStorage'}
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                         <button 
                            onClick={onExport}
                            className="flex flex-col items-center justify-center gap-2 bg-white border border-stone-200 p-3 rounded hover:border-stone-400 hover:bg-stone-50 transition-all"
                        >
                            <Download size={20} className="text-stone-600" />
                            <span className="text-xs font-medium text-stone-700">{t('exportBackup')}</span>
                         </button>
                         <label className="flex flex-col items-center justify-center gap-2 bg-white border border-stone-200 p-3 rounded hover:border-stone-400 hover:bg-stone-50 transition-all cursor-pointer">
                            <Upload size={20} className="text-stone-600" />
                            <span className="text-xs font-medium text-stone-700">{t('importBackup')}</span>
                            <input type="file" onChange={onImport} className="hidden" accept=".json" />
                         </label>
                    </div>
                </div>
            </section>

            {/* Language Section */}
            <section>
                <h3 className="text-sm font-bold text-stone-700 mb-3 flex items-center gap-2">
                    <Globe size={16} /> {t('language')}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(languageNames) as Language[]).map((lang) => (
                        <button
                            key={lang}
                            onClick={() => handleLanguageChange(lang)}
                            className={`py-2 px-3 rounded text-sm transition-all ${
                                selectedLanguage === lang
                                    ? 'bg-stone-800 text-white font-medium'
                                    : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200'
                            }`}
                        >
                            {languageNames[lang]}
                        </button>
                    ))}
                </div>
            </section>
        </div>

        <div className="bg-stone-100 px-6 py-3 border-t border-stone-200 flex justify-end gap-2">
           <button 
             onClick={onClose}
             className="bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 px-6 py-1.5 rounded text-sm font-medium transition-colors"
           >
             {t('cancel')}
           </button>
           <button 
             onClick={onClose}
             className="bg-stone-800 hover:bg-stone-900 text-white px-6 py-1.5 rounded text-sm font-medium transition-colors shadow-sm"
           >
             {t('saveChanges')}
           </button>
        </div>
      </div>
    </div>
  );
};
