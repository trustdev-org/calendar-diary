import React, { useState, useEffect, Suspense } from 'react';
import { format, addMonths, subMonths, getCalendarDays } from './utils/dateUtils';
import { CalendarHeader } from './components/CalendarHeader';
import { DayCell } from './components/DayCell';
import { DayEditor } from './components/DayEditor';
import { DayPreview } from './components/DayPreview';
const SettingsModal = React.lazy(() => import('./components/SettingsModal').then(m => ({ default: m.SettingsModal })));
const AboutModal = React.lazy(() => import('./components/AboutModal').then(m => ({ default: m.AboutModal })));
const UpdateNotification = React.lazy(() => import('./components/UpdateNotification').then(m => ({ default: m.UpdateNotification })));
const AuthModal = React.lazy(() => import('./components/AuthModal').then(m => ({ default: m.AuthModal })));
const SearchModal = React.lazy(() => import('./components/SearchModal').then(m => ({ default: m.SearchModal })));
import { DayData, WEEK_DAYS, DayEvent } from './types';
import { StorageService } from './services/storageService';
import { Settings, Minus, Square, X, Github, Search } from 'lucide-react';
import { t, getWeekDay } from './utils/i18n';

const App: React.FC = () => {
  // --- State ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [data, setData] = useState<Record<string, DayData>>({});
  const [monthlyPlans, setMonthlyPlans] = useState<Record<string, string[]>>({});
  
  // UI State
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [highlightDate, setHighlightDate] = useState<string | null>(null);
  const [previewWindows, setPreviewWindows] = useState<{ id: string; date: Date }[]>([]);

  // --- Lifecycle ---
  useEffect(() => {
    // 检查是否需要验证
    const securitySettings = localStorage.getItem('calendar-diary-security');
    if (securitySettings) {
      const security = JSON.parse(securitySettings);
      if (security.enabled) {
        setNeedsAuth(true);
        return;
      }
    }
    setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    const loadData = async () => {
      const savedData = await StorageService.getData();
      const savedPlans = await StorageService.getPlans();
      
      if (savedData) setData(savedData);
      if (savedPlans) setMonthlyPlans(savedPlans);
    };
    
    loadData();
    
  }, [isAuthenticated]);

  // 快捷键监听
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+F (Windows/Linux) 或 Cmd+F (macOS)
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setShowSearch(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --- Handlers ---
  const saveData = async (newData: Record<string, DayData>) => {
    setData(newData);
    await StorageService.setData(newData);
  };

  const savePlans = async (newPlans: Record<string, string[]>) => {
    setMonthlyPlans(newPlans);
    await StorageService.setPlans(newPlans);
  };

  const handleDaySave = (dateKey: string, events: DayEvent[], stickers: string[]) => {
    const newData = {
      ...data,
      [dateKey]: { date: dateKey, events, stickers }
    };
    saveData(newData);
  };

  const handlePlanUpdate = (index: number, value: string) => {
    const monthKey = format(currentDate, 'yyyy-MM');
    const currentMonthPlan = monthlyPlans[monthKey] || ['', '', ''];
    const newPlan = [...currentMonthPlan];
    newPlan[index] = value;
    
    savePlans({
      ...monthlyPlans,
      [monthKey]: newPlan
    });
  };

  const openPreview = (day: Date) => {
    const id = format(day, 'yyyy-MM-dd');
    setPreviewWindows((prev) => {
      const exists = prev.some(p => p.id === id);
      if (exists) return prev;
      return [...prev, { id, date: day }];
    });
  };

  const closePreview = (id: string) => {
    setPreviewWindows(prev => prev.filter(p => p.id !== id));
  };

  const handleExport = () => {
    const exportData = {
      version: 2,
      data,
      monthlyPlans
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paperplan_backup_${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.data) saveData(parsed.data);
        if (parsed.monthlyPlans) savePlans(parsed.monthlyPlans);
        alert(t('importSuccess'));
        setShowSettings(false);
      } catch (err) {
        alert(t('importError'));
      }
    };
    reader.readAsText(file);
  };

  // --- Render Data ---
  const days = getCalendarDays(currentDate);
  const monthKey = format(currentDate, 'yyyy-MM');
  const currentPlan = monthlyPlans[monthKey] || ['', '', ''];
  
  // Determine if we need 6 rows
  const isSixWeeks = days.length > 35;

  // 获取安全设置
  const getSecuritySettings = () => {
    const securitySettings = localStorage.getItem('calendar-diary-security');
    if (securitySettings) {
      return JSON.parse(securitySettings);
    }
    return null;
  };

  return (
    <div className="w-full h-full min-h-0 bg-white flex flex-col overflow-hidden relative">
      
      {/* Authentication Modal */}
      {needsAuth && !isAuthenticated && (() => {
        const security = getSecuritySettings();
        return security ? (
          <Suspense fallback={null}>
            <AuthModal
            onSuccess={() => {
              setIsAuthenticated(true);
              setNeedsAuth(false);
            }}
            onClose={() => {
              if (window.electronAPI?.window?.close) {
                window.electronAPI.window.close();
              } else {
                window.close();
              }
            }}
            defaultMethod={security.preferredMethod || security.type}
            storedPin={security.pinCode}
            totpSecret={security.totpSecret}
            />
          </Suspense>
        ) : null;
      })()}
      
      {/* Update Notification */}
      <Suspense fallback={null}>
        <UpdateNotification />
      </Suspense>
      
      {/* Custom Title Bar */}
      <div className="h-10 bg-gradient-to-b from-stone-50 to-stone-100 flex justify-between items-center px-4 border-b border-stone-300 select-none shrink-0 draggable">
        <div className="flex items-center gap-3 text-sm font-semibold text-stone-700">
          <span className="w-3 h-3 rounded-full bg-ink-red shadow-sm"></span>
          <span>{t('appTitle')}</span>
        </div>
        <div className="flex items-center gap-2 non-draggable">
           <button 
             onClick={() => setShowSearch(true)} 
             className="p-1.5 text-stone-500 hover:bg-stone-200 hover:text-stone-700 rounded-md transition-all"
             title={`${t('searchDiary')} (${navigator.platform.includes('Mac') ? '⌘F' : 'Ctrl+F'})`}
           >
             <Search size={16} />
           </button>
           <button 
             onClick={() => setShowAbout(true)} 
             className="p-1.5 text-stone-500 hover:bg-stone-200 hover:text-stone-700 rounded-md transition-all"
             title="About"
           >
             <Github size={16} />
           </button>
           <button 
             onClick={() => setShowSettings(true)} 
             className="p-1.5 text-stone-500 hover:bg-stone-200 hover:text-stone-700 rounded-md transition-all"
             title="Settings"
           >
             <Settings size={16} />
           </button>
           <div className="flex gap-1 ml-2">
             <button 
               onClick={() => window.electronAPI?.window.minimize()} 
               className="p-1.5 text-stone-500 hover:bg-yellow-100 hover:text-yellow-700 rounded-md transition-all"
               title="Minimize"
             >
               <Minus size={16} />
             </button>
             <button 
               onClick={() => window.electronAPI?.window.maximize()} 
               className="p-1.5 text-stone-500 hover:bg-green-100 hover:text-green-700 rounded-md transition-all"
               title="Maximize/Restore"
             >
               <Square size={14} />
             </button>
             <button 
               onClick={() => window.electronAPI?.window.close()} 
               className="p-1.5 text-stone-500 hover:bg-red-100 hover:text-red-600 rounded-md transition-all"
               title="Close"
             >
               <X size={16} />
             </button>
           </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0 flex flex-col bg-paper relative">
        
        <div className="relative z-10 flex flex-col h-full min-h-0">
            <CalendarHeader 
                currentDate={currentDate}
                onPrevMonth={() => setCurrentDate(subMonths(currentDate, 1))}
                onNextMonth={() => setCurrentDate(addMonths(currentDate, 1))}
                onDateSelect={(date) => setCurrentDate(date)}
                monthlyPlan={currentPlan}
                onUpdatePlan={handlePlanUpdate}
            />

            <div className="flex-1 min-h-0 flex flex-col p-4 pt-0 overflow-hidden">
                 {/* Week Header */}
                <div className="grid grid-cols-7 border-b border-stone-300 mb-1 shrink-0">
                    {WEEK_DAYS.map((day, index) => (
                        <div key={index} className={`py-1 text-center text-xs font-bold tracking-wider uppercase ${day.color} text-white rounded-t-sm mx-[1px]`}>
                        {getWeekDay(index)}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className={`grid grid-cols-7 gap-1 min-h-0 h-full flex-1 ${isSixWeeks ? 'grid-rows-6' : 'grid-rows-5'}`}>
                    {days.map((day) => {
                        const dateKey = format(day, 'yyyy-MM-dd');
                        const shouldHighlight = highlightDate === dateKey;
                        
                        return (
                            <DayCell 
                              key={day.toISOString()} 
                              day={day} 
                              currentDate={currentDate}
                              data={data[dateKey]}
                              onClick={() => setSelectedDay(day)}
                              highlight={shouldHighlight}
                              onContextMenu={openPreview}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
      </div>

      {/* Modals */}
      {selectedDay && (
        <DayEditor 
          date={selectedDay}
          initialData={data[format(selectedDay, 'yyyy-MM-dd')]}
          onClose={() => setSelectedDay(null)}
          onSave={handleDaySave}
        />
      )}

      {showSettings && (
        <Suspense fallback={null}>
          <SettingsModal 
              onClose={() => setShowSettings(false)} 
              onExport={handleExport}
              onImport={handleImport}
          />
        </Suspense>
      )}

      {showAbout && (
        <Suspense fallback={null}>
          <AboutModal onClose={() => setShowAbout(false)} />
        </Suspense>
      )}

      {showSearch && (
        <Suspense fallback={null}>
          <SearchModal 
            onClose={() => setShowSearch(false)}
            data={data}
            onSelectDate={(date) => {
              const dateKey = format(date, 'yyyy-MM-dd');
              setCurrentDate(date);
              setHighlightDate(dateKey);
              
              // 闪动两次后移除高亮
              setTimeout(() => {
                setHighlightDate(null);
              }, 1000);
            }}
          />
        </Suspense>
      )}

      {/* Preview Overlay */}
      {previewWindows.length > 0 && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
          onClick={(e) => {
            // 点击遮罩层关闭所有预览窗口
            if (e.target === e.currentTarget) {
              setPreviewWindows([]);
            }
          }}
        >
          <div 
            className="max-h-[85vh] overflow-y-auto overflow-x-hidden p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-wrap gap-6 justify-center">
              {previewWindows.map((p) => (
                <DayPreview
                  key={p.id}
                  date={p.date}
                  data={data[format(p.date, 'yyyy-MM-dd')]}
                  onClose={() => closePreview(p.id)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
