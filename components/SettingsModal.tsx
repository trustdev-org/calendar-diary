
import React, { useState, useEffect } from 'react';
import { X, Folder, Download, Upload, HardDrive, Globe, Lock, KeyRound, Smartphone, Copy, Check, Cloud, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { t, setLanguage, getCurrentLanguage, languageNames, type Language } from '../utils/i18n';
import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';
import { getAppVersion } from '../utils/version';
import { webdavService, type WebDAVConfig } from '../services/webdavService';

interface SettingsModalProps {
  onClose: () => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDisplaySettingsChange?: (mode: 'ellipsis' | 'scroll') => void;
}

type TabType = 'general' | 'security' | 'cloud';

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, onExport, onImport, onDisplaySettingsChange }) => {
  const [dataPath, setDataPath] = useState('LocalStorage (Browser)');
  const [isElectron, setIsElectron] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(getCurrentLanguage());
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [appVersion, setAppVersion] = useState<string>('');
  
  
  // Security settings
  const [securityEnabled, setSecurityEnabled] = useState(false);
  const [securityType, setSecurityType] = useState<'pin' | 'totp'>('pin');
  const [pinCode, setPinCode] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [totpSecret, setTotpSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [secretCopied, setSecretCopied] = useState(false);
  const [isTotpVerified, setIsTotpVerified] = useState(false);
  const [savedPin, setSavedPin] = useState(false);
  const [savedTotp, setSavedTotp] = useState(false);

  // WebDAV settings
  const [webdavUrl, setWebdavUrl] = useState('');
  const [webdavPath, setWebdavPath] = useState('/calendar-diary');
  const [webdavUsername, setWebdavUsername] = useState('');
  const [webdavPassword, setWebdavPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [webdavTesting, setWebdavTesting] = useState(false);
  const [webdavTestResult, setWebdavTestResult] = useState<'success' | 'error' | null>(null);
  const [webdavTestMessage, setWebdavTestMessage] = useState('');

  const generateQRCode = async (secret: string) => {
    try {
      const totp = new OTPAuth.TOTP({
        issuer: 'Calendar Diary',
        label: 'User',
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(secret)
      });
      const url = await QRCode.toDataURL(totp.toString());
      setQrCodeUrl(url);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    }
  };

  const generateTOTPSecret = () => {
    const secret = new OTPAuth.Secret({ size: 20 });
    const base32Secret = secret.base32;
    setTotpSecret(base32Secret);
    setIsTotpVerified(false);
    generateQRCode(base32Secret);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(totpSecret);
      setSecretCopied(true);
      setTimeout(() => setSecretCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const verifyTOTPCode = () => {
    try {
      const totp = new OTPAuth.TOTP({
        issuer: 'Calendar Diary',
        label: 'User',
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(totpSecret)
      });
      const isValid = totp.validate({ token: verifyCode, window: 1 }) !== null;
      if (isValid) {
        setPinError('');
        setIsTotpVerified(true);
        return true;
      } else {
        setPinError('验证码无效');
        return false;
      }
    } catch (error) {
      setPinError('验证失败');
      return false;
    }
  };

  useEffect(() => {
    setIsVisible(true);
    (async () => {
      const v = await getAppVersion();
      setAppVersion(v);
    })();
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
    
    
    // 加载安全设置
    const savedSecurity = localStorage.getItem('calendar-diary-security');
    if (savedSecurity) {
      try {
        const security = JSON.parse(savedSecurity);
        console.log('Loaded security settings:', security);
        
        setSecurityEnabled(security.enabled || false);
        setSecurityType(security.preferredMethod || 'pin');
        
        if (security.pinCode) {
          setPinCode(security.pinCode);
          setConfirmPin(security.pinCode);
          setSavedPin(true);
        }
        
        if (security.totpSecret) {
          setTotpSecret(security.totpSecret);
          setIsTotpVerified(true);
          setSavedTotp(true);
          generateQRCode(security.totpSecret);
        }
      } catch (error) {
        console.error('Failed to load security settings:', error);
      }
    }

    // 加载 WebDAV 设置
    const savedWebdav = localStorage.getItem('calendar-diary-webdav');
    if (savedWebdav) {
      try {
        const webdav = JSON.parse(savedWebdav) as WebDAVConfig;
        setWebdavUrl(webdav.serverUrl || '');
        setWebdavPath(webdav.rootPath || '/calendar-diary');
        setWebdavUsername(webdav.username || '');
        setWebdavPassword(webdav.password || '');
      } catch (error) {
        console.error('Failed to load WebDAV settings:', error);
      }
    }
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

  const handleTestWebdav = async () => {
    if (!webdavUrl) {
      setWebdavTestResult('error');
      setWebdavTestMessage(t('webdavUrlRequired'));
      return;
    }

    setWebdavTesting(true);
    setWebdavTestResult(null);
    setWebdavTestMessage('');

    try {
      const config: WebDAVConfig = {
        serverUrl: webdavUrl,
        rootPath: webdavPath || '/calendar-diary',
        username: webdavUsername,
        password: webdavPassword
      };

      webdavService.connect(config);
      const result = await webdavService.testConnection();
      
      if (result.success) {
        setWebdavTestResult('success');
        setWebdavTestMessage(t('webdavTestSuccess'));
      } else {
        setWebdavTestResult('error');
        setWebdavTestMessage(result.error || t('webdavTestFailed'));
      }
    } catch (error) {
      setWebdavTestResult('error');
      setWebdavTestMessage(error instanceof Error ? error.message : t('webdavTestFailed'));
    } finally {
      setWebdavTesting(false);
    }
  };

  const handleSaveWebdav = () => {
    const config: WebDAVConfig = {
      serverUrl: webdavUrl,
      rootPath: webdavPath || '/calendar-diary',
      username: webdavUsername,
      password: webdavPassword
    };
    localStorage.setItem('calendar-diary-webdav', JSON.stringify(config));
    webdavService.connect(config);
    onClose();
  };


  const handleSaveSecurity = () => {
    // 当前选中的验证方式的验证
    if (securityEnabled && securityType === 'pin') {
      // 验证 PIN（如果正在编辑）
      if (!savedPin || (pinCode !== '' && confirmPin !== '')) {
        if (pinCode.length > 0 && pinCode.length < 4) {
          setPinError(t('pinTooShort'));
          return;
        }
        if (pinCode !== confirmPin) {
          setPinError(t('pinMismatch'));
          return;
        }
      }
    }
    
    if (securityEnabled && securityType === 'totp') {
      // 验证 TOTP（如果是新配置）
      if (totpSecret && !isTotpVerified) {
        setPinError(t('totpClickVerify'));
        return;
      }
      
      // 确保有 TOTP 配置（如果当前没有生成密钥，就不检查）
      if (!totpSecret) {
        setPinError(t('totpMissingSecret'));
        return;
      }
    }

    // 检查是否至少有一个有效配置
    if (securityEnabled) {
      const hasPin = (savedPin && pinCode) || (pinCode.length >= 4 && pinCode === confirmPin);
      const hasTotp = totpSecret && isTotpVerified;
      
      if (!hasPin && !hasTotp) {
        setPinError(t('securityAtLeastOne'));
        return;
      }
    }
    
    // 保存配置（保留已有的配置）
    const securitySettings = {
      enabled: securityEnabled,
      preferredMethod: securityType,
      pinCode: undefined as string | undefined,
      totpSecret: undefined as string | undefined
    };
    
    // 保存 PIN（如果已配置或新配置）
    if (savedPin && pinCode && pinCode === confirmPin) {
      securitySettings.pinCode = pinCode;
    } else if (pinCode.length >= 4 && pinCode === confirmPin) {
      securitySettings.pinCode = pinCode;
    }
    
    // 保存 TOTP（如果已验证）
    if (totpSecret && isTotpVerified) {
      securitySettings.totpSecret = totpSecret;
    }
    
    console.log('Saving security settings:', securitySettings);
    localStorage.setItem('calendar-diary-security', JSON.stringify(securitySettings));
    setPinError('');
    
    // 更新保存状态
    if (securitySettings.pinCode) {
      setSavedPin(true);
    }
    if (securitySettings.totpSecret) {
      setSavedTotp(true);
    }
    
    console.log('Security settings saved successfully');
    onClose();
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
            <span className="text-[10px] text-stone-400 font-mono">{appVersion ? `v${appVersion}` : ''}</span>
          </div>
          <button 
            onClick={onClose} 
            className="text-stone-400 hover:text-stone-600 transition-colors"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-50">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all ${
              activeTab === 'general'
                ? 'text-stone-800 border-b-2 border-stone-800 bg-white'
                : 'text-stone-500 hover:text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Globe size={16} />
            {t('generalSettings')}
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all ${
              activeTab === 'security'
                ? 'text-stone-800 border-b-2 border-stone-800 bg-white'
                : 'text-stone-500 hover:text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Lock size={16} />
            {t('securityPrivacy')}
          </button>
          <button
            onClick={() => setActiveTab('cloud')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all ${
              activeTab === 'cloud'
                ? 'text-stone-800 border-b-2 border-stone-800 bg-white'
                : 'text-stone-500 hover:text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Cloud size={16} />
            {t('cloudSync')}
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6 min-h-[300px] max-h-[500px] overflow-y-auto">
            {activeTab === 'general' && (
              <>
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

              </>
            )}

            {activeTab === 'security' && (
              <>
            {/* Security Section */}
            <section>
                <h3 className="text-sm font-bold text-stone-700 mb-3 flex items-center gap-2">
                    <Lock size={16} /> {t('securityEnableTitle')}
                </h3>
                <div className="bg-stone-50 p-4 rounded-md border border-stone-200 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-stone-700">{t('securityEnableLabel')}</p>
                            <p className="text-xs text-stone-500 mt-0.5">{t('securityEnableDesc')}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={securityEnabled}
                                onChange={(e) => setSecurityEnabled(e.target.checked)}
                                className="sr-only peer"
                                aria-label={t('securityEnableLabel')}
                            />
                            <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-stone-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-stone-800"></div>
                        </label>
                    </div>

                    {securityEnabled && (
                        <>
                        <div className="pt-4 border-t border-stone-200 space-y-3">
                            <p className="text-xs font-medium text-stone-600">{t('securityMethodConfig')}</p>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setSecurityType('pin')}
                                    className={`relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                                        securityType === 'pin'
                                            ? 'border-stone-800 bg-stone-100'
                                            : 'border-stone-200 bg-white hover:border-stone-300'
                                    }`}
                                >
                                    {savedPin && (
                                        <div className="absolute top-2 right-2 text-green-600" title="已配置">
                                            <Check size={16} />
                                        </div>
                                    )}
                                    <KeyRound size={24} className={securityType === 'pin' ? 'text-stone-800' : 'text-stone-500'} />
                                    <span className="text-sm font-medium">{t('pinMethod')}</span>
                                    <span className="text-xs text-stone-500 text-center">
                                        {savedPin ? t('pinStatusSet') : t('pinStatusNotSet')}
                                    </span>
                                </button>
                                <button
                                    onClick={() => {
                                        setSecurityType('totp');
                                        if (!totpSecret) {
                                            generateTOTPSecret();
                                        }
                                    }}
                                    className={`relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                                        securityType === 'totp'
                                            ? 'border-stone-800 bg-stone-100'
                                            : 'border-stone-200 bg-white hover:border-stone-300'
                                    }`}
                                >
                                    {savedTotp && (
                                        <div className="absolute top-2 right-2 text-green-600" title="已配置">
                                            <Check size={16} />
                                        </div>
                                    )}
                                    <Smartphone size={24} className={securityType === 'totp' ? 'text-stone-800' : 'text-stone-500'} />
                                    <span className="text-sm font-medium">{t('totpMethod')}</span>
                                    <span className="text-xs text-stone-500 text-center">
                                        {savedTotp ? t('pinStatusSet') : t('pinStatusNotSet')}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {securityType === 'pin' && (
                            <div className="pt-4 border-t border-stone-200 space-y-3">
                                {savedPin && pinCode && pinCode === confirmPin ? (
                                    <div className="bg-green-50 border border-green-200 rounded-md p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Check size={16} className="text-green-600" />
                                            <p className="text-sm font-medium text-green-700">{t('pinSetSuccess')}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setPinCode('');
                                                setConfirmPin('');
                                                setSavedPin(false);
                                            }}
                                            className="text-xs text-red-600 hover:text-red-700 underline"
                                        >
                                            {t('pinCancel')}
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <label className="block text-xs font-medium text-stone-600 mb-1.5">{savedPin ? t('pinLabelEdit') : t('pinLabelSet')}</label>
                                            <input
                                                type="password"
                                                inputMode="numeric"
                                                maxLength={8}
                                                value={pinCode}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/\D/g, '');
                                                    setPinCode(value);
                                                    setPinError('');
                                                }}
                                                placeholder={t('pinPlaceholder')}
                                                className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-stone-600 mb-1.5">{t('pinConfirmLabel')}</label>
                                            <input
                                                type="password"
                                                inputMode="numeric"
                                                maxLength={8}
                                                value={confirmPin}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/\D/g, '');
                                                    setConfirmPin(value);
                                                    setPinError('');
                                                }}
                                                placeholder={t('pinConfirmPlaceholder')}
                                                className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
                                            />
                                        </div>
                                    </>
                                )}
                                {pinError && (
                                    <p className="text-xs text-red-500 flex items-center gap-1">
                                        <span>⚠</span> {pinError}
                                    </p>
                                )}
                            </div>
                        )}

                        {securityType === 'totp' && (
                            <div className="pt-4 border-t border-stone-200 space-y-3">
                                {savedTotp && isTotpVerified ? (
                                    <div className="bg-green-50 border border-green-200 rounded-md p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Check size={16} className="text-green-600" />
                                            <p className="text-sm font-medium text-green-700">{t('totpConfigured')}</p>
                                        </div>
                                        <p className="text-xs text-stone-500 mb-3">{t('totpConfiguredDesc')}</p>
                                        <button
                                            onClick={() => {
                                                setTotpSecret('');
                                                setQrCodeUrl('');
                                                setVerifyCode('');
                                                setIsTotpVerified(false);
                                                setSavedTotp(false);
                                            }}
                                            className="text-xs text-red-600 hover:text-red-700 underline"
                                        >
                                            {t('totpCancel')}
                                        </button>
                                    </div>
                                ) : !totpSecret ? (
                                    <>
                                        <button
                                            onClick={generateTOTPSecret}
                                            className="w-full py-2 px-4 bg-stone-800 text-white rounded-md hover:bg-stone-900 transition-colors text-sm font-medium"
                                        >
                                            {t('totpGenerateSecret')}
                                        </button>
                                        {!savedPin && (
                                            <p className="text-xs text-amber-600 flex items-center gap-1 mt-2">
                                                <span>💡</span> {t('securityAtLeastOne')}
                                            </p>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <div className="text-center">
                                            <p className="text-xs font-medium text-stone-600 mb-2">{t('totpScanQr')}</p>
                                            {qrCodeUrl && (
                                                <div className="inline-block p-3 bg-white rounded-lg border-2 border-stone-200">
                                                    <img src={qrCodeUrl} alt="TOTP QR Code" className="w-48 h-48" />
                                                </div>
                                            )}
                                            <p className="text-xs text-stone-500 mt-2">{t('totpScanDesc')}</p>
                                        </div>

                                        <div className="bg-stone-50 p-3 rounded-md border border-stone-200">
                                            <p className="text-xs font-medium text-stone-600 mb-1">{t('totpManualInput')}</p>
                                            <div className="flex items-center gap-2">
                                                <code className="flex-1 text-xs bg-white px-2 py-1.5 rounded border border-stone-300 font-mono break-all">
                                                    {totpSecret}
                                                </code>
                                                <button
                                                    onClick={copyToClipboard}
                                                    className="p-1.5 hover:bg-stone-200 rounded transition-colors"
                                                    title={t('totpCopySecret')}
                                                >
                                                    {secretCopied ? (
                                                        <Check size={16} className="text-green-600" />
                                                    ) : (
                                                        <Copy size={16} className="text-stone-600" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-stone-600 mb-1.5">{t('totpEnterCodeConfirm')}</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={6}
                                                    value={verifyCode}
                                                    onChange={(e) => {
                                                        const value = e.target.value.replace(/\D/g, '');
                                                        setVerifyCode(value);
                                                        setPinError('');
                                                    }}
                                                    placeholder={t('totpCodePlaceholder')}
                                                    className="flex-1 px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 text-center tracking-wider font-mono"
                                                />
                                                <button
                                                    onClick={() => {
                                                        if (verifyTOTPCode()) {
                                                            // 验证成功后不显示错误
                                                        }
                                                    }}
                                                    disabled={verifyCode.length !== 6}
                                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                                        isTotpVerified
                                                            ? 'bg-green-600 text-white cursor-default'
                                                            : 'bg-stone-800 hover:bg-stone-900 text-white disabled:bg-stone-300 disabled:cursor-not-allowed'
                                                    }`}
                                                >
                                                    {isTotpVerified ? (
                                                        <Check size={16} />
                                                    ) : (
                                                        t('totpVerifyButton')
                                                    )}
                                                </button>
                                            </div>
                                            <p className="text-xs text-stone-500 mt-1">{t('totpGetCodeHint')}</p>
                                        </div>

                                        {pinError && (
                                            <p className="text-xs text-red-500 flex items-center gap-1">
                                                <span>⚠</span> {pinError}
                                            </p>
                                        )}
                                        
                                        {isTotpVerified && !pinError && (
                                            <p className="text-xs text-green-600 flex items-center gap-1">
                                                <Check size={14} /> {t('totpVerifiedSaveReady')}
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                        </>
                    )}
                </div>
            </section>
              </>
            )}

            {activeTab === 'cloud' && (
              <>
            {/* WebDAV Configuration Section */}
            <section>
                <h3 className="text-sm font-bold text-stone-700 mb-3 flex items-center gap-2">
                    <Cloud size={16} /> {t('webdavConfig')}
                </h3>
                <div className="bg-stone-50 p-4 rounded-md border border-stone-200 space-y-4">
                    <p className="text-xs text-stone-500">{t('webdavConfigDesc')}</p>
                    
                    {/* Server URL */}
                    <div>
                        <label className="block text-xs font-medium text-stone-600 mb-1.5">{t('webdavServerUrl')}</label>
                        <input
                            type="text"
                            value={webdavUrl}
                            onChange={(e) => {
                                setWebdavUrl(e.target.value);
                                setWebdavTestResult(null);
                            }}
                            placeholder="https://your-server.com/webdav"
                            className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
                        />
                    </div>

                    {/* Root Path */}
                    <div>
                        <label className="block text-xs font-medium text-stone-600 mb-1.5">{t('webdavRootPath')}</label>
                        <input
                            type="text"
                            value={webdavPath}
                            onChange={(e) => {
                                setWebdavPath(e.target.value);
                                setWebdavTestResult(null);
                            }}
                            placeholder="/calendar-diary"
                            className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
                        />
                        <p className="text-[10px] text-stone-400 mt-1">{t('webdavRootPathHint')}</p>
                    </div>

                    {/* Username */}
                    <div>
                        <label className="block text-xs font-medium text-stone-600 mb-1.5">{t('webdavUsername')}</label>
                        <input
                            type="text"
                            value={webdavUsername}
                            onChange={(e) => {
                                setWebdavUsername(e.target.value);
                                setWebdavTestResult(null);
                            }}
                            placeholder={t('webdavUsernamePlaceholder')}
                            className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-xs font-medium text-stone-600 mb-1.5">{t('webdavPassword')}</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={webdavPassword}
                                onChange={(e) => {
                                    setWebdavPassword(e.target.value);
                                    setWebdavTestResult(null);
                                }}
                                placeholder={t('webdavPasswordPlaceholder')}
                                className="w-full px-3 py-2 pr-10 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Test Connection Button */}
                    <div className="pt-2 border-t border-stone-200">
                        <button
                            onClick={handleTestWebdav}
                            disabled={webdavTesting || !webdavUrl}
                            className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-white border border-stone-300 rounded-md text-sm font-medium hover:bg-stone-50 disabled:bg-stone-100 disabled:text-stone-400 disabled:cursor-not-allowed transition-colors"
                        >
                            <RefreshCw size={14} className={webdavTesting ? 'animate-spin' : ''} />
                            {webdavTesting ? t('webdavTesting') : t('webdavTestConnection')}
                        </button>
                        
                        {webdavTestResult && (
                            <div className={`mt-2 p-2 rounded text-xs ${
                                webdavTestResult === 'success' 
                                    ? 'bg-green-50 text-green-700 border border-green-200' 
                                    : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                                {webdavTestResult === 'success' ? '✓' : '✗'} {webdavTestMessage}
                            </div>
                        )}
                    </div>
                </div>
            </section>
              </>
            )}
        </div>

        <div className="bg-stone-100 px-6 py-3 border-t border-stone-200 flex justify-end gap-2">
           <button 
             onClick={onClose}
             className="bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 px-6 py-1.5 rounded text-sm font-medium transition-colors"
           >
             {t('cancel')}
           </button>
           <button 
             onClick={() => {
               if (activeTab === 'security') {
                 handleSaveSecurity();
               } else if (activeTab === 'cloud') {
                 handleSaveWebdav();
               } else if (activeTab === 'general') {
                 onClose();
               }
             }}
             className="bg-stone-800 hover:bg-stone-900 text-white px-6 py-1.5 rounded text-sm font-medium transition-colors shadow-sm"
           >
             {t('saveChanges')}
           </button>
        </div>
      </div>
    </div>
  );
};
