import React, { useState, useEffect } from 'react';
import { KeyRound, Smartphone, AlertCircle } from 'lucide-react';
import * as OTPAuth from 'otpauth';

interface AuthModalProps {
  onSuccess: () => void;
  onClose?: () => void;
  defaultMethod?: 'pin' | 'totp';
  storedPin?: string;
  totpSecret?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onSuccess, onClose, defaultMethod, storedPin, totpSecret }) => {
  const [activeMethod, setActiveMethod] = useState<'pin' | 'totp'>(() => {
    if (defaultMethod === 'pin' && storedPin) return 'pin';
    if (defaultMethod === 'totp' && totpSecret) return 'totp';
    if (storedPin) return 'pin';
    if (totpSecret) return 'totp';
    return 'pin';
  });
  
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleMethodChange = (method: 'pin' | 'totp') => {
    if (method === 'pin' && !storedPin) return;
    if (method === 'totp' && !totpSecret) return;
    
    setActiveMethod(method);
    setPinInput('');
    setError('');
    
    // 保存用户的选择，下次自动使用
    try {
      const savedSecurity = localStorage.getItem('calendar-diary-security');
      if (savedSecurity) {
        const security = JSON.parse(savedSecurity);
        security.preferredMethod = method;
        localStorage.setItem('calendar-diary-security', JSON.stringify(security));
      }
    } catch (error) {
      console.error('Failed to save preferred method:', error);
    }
  };

  const handlePinSubmit = () => {
    if (pinInput === storedPin) {
      onSuccess();
    } else {
      setAttempts(attempts + 1);
      setError(`PIN 码错误 (${attempts + 1}/5)`);
      setPinInput('');
      
      if (attempts >= 4) {
        setError('尝试次数过多，请稍后再试');
        setTimeout(() => {
          setAttempts(0);
          setError('');
        }, 30000); // 30秒后重置
      }
    }
  };

  const handleTOTPSubmit = () => {
    if (!totpSecret) {
      setError('未找到验证器配置');
      return;
    }

    try {
      const totp = new OTPAuth.TOTP({
        issuer: 'Calendar Diary',
        label: 'User',
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(totpSecret)
      });

      const isValid = totp.validate({ token: pinInput, window: 1 }) !== null;

      if (isValid) {
        onSuccess();
      } else {
        setAttempts(attempts + 1);
        setError(`验证码错误 (${attempts + 1}/5)`);
        setPinInput('');
        
        if (attempts >= 4) {
          setError('尝试次数过多，请稍后再试');
          setTimeout(() => {
            setAttempts(0);
            setError('');
          }, 30000);
        }
      }
    } catch (err) {
      setError('验证失败，请重试');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (activeMethod === 'pin' && pinInput.length >= 4) {
        handlePinSubmit();
      } else if (activeMethod === 'totp' && pinInput.length === 6) {
        handleTOTPSubmit();
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md transition-all duration-300"
      style={{
        backgroundColor: isVisible ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0)',
        opacity: isVisible ? 1 : 0
      }}
    >
      <div 
        className="bg-white w-[400px] rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ease-out"
        style={{
          transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
          opacity: isVisible ? 1 : 0
        }}
      >
        {/* Tabs */}
        {(storedPin && totpSecret) && (
          <div className="flex">
            <button
              onClick={() => handleMethodChange('pin')}
              className={`flex-1 py-3 text-sm font-medium transition-all ${
                activeMethod === 'pin'
                  ? 'bg-stone-800 text-white shadow-sm'
                  : 'bg-white text-stone-600 hover:bg-stone-50 hover:text-stone-800'
              }`}
            >
              PIN 码
            </button>
            <button
              onClick={() => handleMethodChange('totp')}
              className={`flex-1 py-3 text-sm font-medium transition-all ${
                activeMethod === 'totp'
                  ? 'bg-stone-800 text-white shadow-sm'
                  : 'bg-white text-stone-600 hover:bg-stone-50 hover:text-stone-800'
              }`}
            >
              验证器
            </button>
          </div>
        )}

        <div className="bg-gradient-to-r from-stone-800 to-stone-600 px-6 py-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
            {activeMethod === 'pin' ? (
              <KeyRound size={32} className="text-white" />
            ) : (
              <Smartphone size={32} className="text-white" />
            )}
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            {activeMethod === 'pin' ? '输入 PIN 码' : '输入验证码'}
          </h2>
          <p className="text-sm text-white/80">
            {activeMethod === 'pin' ? '请输入您的 PIN 码以解锁应用' : '请输入验证器应用中的 6 位验证码'}
          </p>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div>
              <input
                type="password"
                inputMode="numeric"
                maxLength={activeMethod === 'pin' ? 8 : 6}
                value={pinInput}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setPinInput(value);
                  setError('');
                }}
                onKeyPress={handleKeyPress}
                placeholder={activeMethod === 'pin' ? '输入 PIN 码' : '输入验证码'}
                disabled={attempts >= 5}
                className="w-full px-4 py-3 text-center text-2xl tracking-[0.5em] border-2 border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 disabled:bg-stone-100 font-mono"
                autoFocus
              />
            </div>

            {/* 点指示器 */}
            <div className="flex justify-center gap-3">
              {[...Array(activeMethod === 'pin' ? 8 : 6)].map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all ${
                    i < pinInput.length
                      ? 'bg-stone-800 scale-110'
                      : 'bg-stone-200'
                  }`}
                />
              ))}
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              onClick={activeMethod === 'pin' ? handlePinSubmit : handleTOTPSubmit}
              disabled={(activeMethod === 'pin' && pinInput.length < 4) || (activeMethod === 'totp' && pinInput.length !== 6) || attempts >= 5}
              className="w-full py-3 bg-stone-800 hover:bg-stone-900 disabled:bg-stone-300 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
            >
              解锁
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="w-full py-1 text-stone-500 hover:text-stone-700 text-sm font-medium transition-colors"
              >
                退出应用
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
