import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, getCalendarDays } from './utils/dateUtils';
import { CalendarHeader } from './components/CalendarHeader';
import { DayCell } from './components/DayCell';
import { DayEditor } from './components/DayEditor';
import { SettingsModal } from './components/SettingsModal';
import { AboutModal } from './components/AboutModal';
import { UpdateNotification } from './components/UpdateNotification';
import { DayData, WEEK_DAYS, DayEvent } from './types';
import { StorageService } from './services/storageService';
import { Settings, Minus, Square, X, Github } from 'lucide-react';
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

  // --- Lifecycle ---
  useEffect(() => {
    const loadData = async () => {
      const savedData = await StorageService.getData();
      const savedPlans = await StorageService.getPlans();
      
      if (savedData) setData(savedData);
      if (savedPlans) setMonthlyPlans(savedPlans);
    };
    
    loadData();
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

  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden relative">
      
      {/* Update Notification */}
      <UpdateNotification />
      
      {/* Custom Title Bar */}
      <div className="h-10 bg-gradient-to-b from-stone-50 to-stone-100 flex justify-between items-center px-4 border-b border-stone-300 select-none shrink-0 draggable">
        <div className="flex items-center gap-3 text-sm font-semibold text-stone-700">
          <span className="w-3 h-3 rounded-full bg-ink-red shadow-sm"></span>
          <span>{t('appTitle')}</span>
        </div>
        <div className="flex items-center gap-2 non-draggable">
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
      <div className="flex-1 flex flex-col bg-paper relative">
        
        <div className="relative z-10 flex flex-col h-full">
            <CalendarHeader 
                currentDate={currentDate}
                onPrevMonth={() => setCurrentDate(subMonths(currentDate, 1))}
                onNextMonth={() => setCurrentDate(addMonths(currentDate, 1))}
                onDateSelect={(date) => setCurrentDate(date)}
                monthlyPlan={currentPlan}
                onUpdatePlan={handlePlanUpdate}
            />

            <div className="flex-1 flex flex-col p-4 pt-0 overflow-hidden">
                 {/* Week Header */}
                <div className="grid grid-cols-7 border-b border-stone-300 mb-1 shrink-0">
                    {WEEK_DAYS.map((day, index) => (
                        <div key={index} className={`py-1 text-center text-xs font-bold tracking-wider uppercase ${day.color} text-white rounded-t-sm mx-[1px]`}>
                        {getWeekDay(index)}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className={`flex-1 grid grid-cols-7 gap-1 ${isSixWeeks ? 'grid-rows-6' : 'grid-rows-5'}`}>
                    {days.map((day) => (
                        <DayCell 
                            key={day.toISOString()} 
                            day={day} 
                            currentDate={currentDate}
                            data={data[format(day, 'yyyy-MM-dd')]}
                            onClick={() => setSelectedDay(day)}
                        />
                    ))}
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
        <SettingsModal 
            onClose={() => setShowSettings(false)} 
            onExport={handleExport}
            onImport={handleImport}
        />
      )}

      {showAbout && (
        <AboutModal onClose={() => setShowAbout(false)} />
      )}
    </div>
  );
};

export default App;