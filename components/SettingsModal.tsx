
import React, { useState, useEffect } from 'react';
import { X, Folder, Download, Upload, HardDrive, Globe, Lock, KeyRound, Smartphone, Copy, Check } from 'lucide-react';
import { t, setLanguage, getCurrentLanguage, languageNames, type Language } from '../utils/i18n';
import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';

interface SettingsModalProps {
  onClose: () => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDisplaySettingsChange?: (mode: 'ellipsis' | 'scroll') => void;
}

type TabType = 'general' | 'security';

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, onExport, onImport, onDisplaySettingsChange }) => {
  const [dataPath, setDataPath] = useState('LocalStorage (Browser)');
  const [isElectron, setIsElectron] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(getCurrentLanguage());
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('general');
  
  
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


  const handleSaveSecurity = () => {
    // 当前选中的验证方式的验证
    if (securityEnabled && securityType === 'pin') {
      // 验证 PIN（如果正在编辑）
      if (!savedPin || (pinCode !== '' && confirmPin !== '')) {
        if (pinCode.length > 0 && pinCode.length < 4) {
          setPinError('PIN 码至少需要 4 位数字');
          return;
        }
        if (pinCode !== confirmPin) {
          setPinError('两次输入的 PIN 码不一致');
          return;
        }
      }
    }
    
    if (securityEnabled && securityType === 'totp') {
      // 验证 TOTP（如果是新配置）
      if (totpSecret && !isTotpVerified) {
        setPinError('请点击"验证"按钮确认验证码');
        return;
      }
      
      // 确保有 TOTP 配置（如果当前没有生成密钥，就不检查）
      if (!totpSecret) {
        setPinError('请先生成验证器密钥');
        return;
      }
    }

    // 检查是否至少有一个有效配置
    if (securityEnabled) {
      const hasPin = (savedPin && pinCode) || (pinCode.length >= 4 && pinCode === confirmPin);
      const hasTotp = totpSecret && isTotpVerified;
      
      if (!hasPin && !hasTotp) {
        setPinError('请至少配置一种验证方式，如果无需验证请关闭上方开关再保存');
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
            <span className="text-[10px] text-stone-400 font-mono">v0.1.4-beta</span>
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
            常规设置
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
            安全与隐私
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
                    <Lock size={16} /> 启动密码保护
                </h3>
                <div className="bg-stone-50 p-4 rounded-md border border-stone-200 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-stone-700">启用密码保护</p>
                            <p className="text-xs text-stone-500 mt-0.5">应用启动时需要验证身份</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={securityEnabled}
                                onChange={(e) => setSecurityEnabled(e.target.checked)}
                                className="sr-only peer"
                                aria-label="启用密码保护"
                            />
                            <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-stone-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-stone-800"></div>
                        </label>
                    </div>

                    {securityEnabled && (
                        <>
                        <div className="pt-4 border-t border-stone-200 space-y-3">
                            <p className="text-xs font-medium text-stone-600">配置验证方式：</p>
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
                                    <span className="text-sm font-medium">PIN 码</span>
                                    <span className="text-xs text-stone-500 text-center">
                                        {savedPin ? '已设置' : '未设置'}
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
                                    <span className="text-sm font-medium">验证器</span>
                                    <span className="text-xs text-stone-500 text-center">
                                        {savedTotp ? '已设置' : '未设置'}
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
                                            <p className="text-sm font-medium text-green-700">PIN 码已设置</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setPinCode('');
                                                setConfirmPin('');
                                                setSavedPin(false);
                                            }}
                                            className="text-xs text-red-600 hover:text-red-700 underline"
                                        >
                                            取消 PIN 码
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <label className="block text-xs font-medium text-stone-600 mb-1.5">{savedPin ? '修改' : '设置'} PIN 码</label>
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
                                                placeholder="输入 4-8 位数字"
                                                className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-stone-600 mb-1.5">确认 PIN 码</label>
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
                                                placeholder="再次输入 PIN 码"
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
                                            <p className="text-sm font-medium text-green-700">验证器已配置</p>
                                        </div>
                                        <p className="text-xs text-stone-500 mb-3">您的验证器应用已绑定此账户</p>
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
                                            取消验证器
                                        </button>
                                    </div>
                                ) : !totpSecret ? (
                                    <>
                                        <button
                                            onClick={generateTOTPSecret}
                                            className="w-full py-2 px-4 bg-stone-800 text-white rounded-md hover:bg-stone-900 transition-colors text-sm font-medium"
                                        >
                                            生成验证器密钥
                                        </button>
                                        {!savedPin && (
                                            <p className="text-xs text-amber-600 flex items-center gap-1 mt-2">
                                                <span>💡</span> 请至少配置一种验证方式，如果无需验证请关闭上方开关再保存
                                            </p>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <div className="text-center">
                                            <p className="text-xs font-medium text-stone-600 mb-2">扫描二维码</p>
                                            {qrCodeUrl && (
                                                <div className="inline-block p-3 bg-white rounded-lg border-2 border-stone-200">
                                                    <img src={qrCodeUrl} alt="TOTP QR Code" className="w-48 h-48" />
                                                </div>
                                            )}
                                            <p className="text-xs text-stone-500 mt-2">使用 Google Authenticator、Microsoft Authenticator 或其他验证器应用扫描</p>
                                        </div>

                                        <div className="bg-stone-50 p-3 rounded-md border border-stone-200">
                                            <p className="text-xs font-medium text-stone-600 mb-1">手动输入密钥：</p>
                                            <div className="flex items-center gap-2">
                                                <code className="flex-1 text-xs bg-white px-2 py-1.5 rounded border border-stone-300 font-mono break-all">
                                                    {totpSecret}
                                                </code>
                                                <button
                                                    onClick={copyToClipboard}
                                                    className="p-1.5 hover:bg-stone-200 rounded transition-colors"
                                                    title="复制密钥"
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
                                            <label className="block text-xs font-medium text-stone-600 mb-1.5">输入验证码以确认</label>
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
                                                    placeholder="输入 6 位验证码"
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
                                                        '验证'
                                                    )}
                                                </button>
                                            </div>
                                            <p className="text-xs text-stone-500 mt-1">从验证器应用中获取当前验证码</p>
                                        </div>

                                        {pinError && (
                                            <p className="text-xs text-red-500 flex items-center gap-1">
                                                <span>⚠</span> {pinError}
                                            </p>
                                        )}
                                        
                                        {isTotpVerified && !pinError && (
                                            <p className="text-xs text-green-600 flex items-center gap-1">
                                                <Check size={14} /> 验证码已通过，可以保存
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
