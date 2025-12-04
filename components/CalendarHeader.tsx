
import React, { useState, useCallback, memo } from 'react';
import { format } from '../utils/dateUtils';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { t, getMonthName } from '../utils/i18n';

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  monthlyPlan: string[];
  onUpdatePlan: (index: number, value: string) => void;
  onDateSelect: (date: Date) => void;
}

const CalendarHeaderComponent: React.FC<CalendarHeaderProps> = ({
  currentDate,
  onPrevMonth,
  onNextMonth,
  monthlyPlan,
  onUpdatePlan,
  onDateSelect
}) => {
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [selectorYear, setSelectorYear] = useState(currentDate.getFullYear());

  const toggleSelector = useCallback(() => {
    setIsSelectorOpen(prev => {
      if (!prev) setSelectorYear(currentDate.getFullYear());
      return !prev;
    });
  }, [currentDate]);

  const handleMonthSelect = useCallback((monthIndex: number) => {
    const newDate = new Date(selectorYear, monthIndex, 1);
    onDateSelect(newDate);
    setIsSelectorOpen(false);
  }, [selectorYear, onDateSelect]);

  const closeSelector = useCallback(() => setIsSelectorOpen(false), []);
  const prevYear = useCallback(() => setSelectorYear(y => y - 1), []);
  const nextYear = useCallback(() => setSelectorYear(y => y + 1), []);

  const today = new Date();

  return (
    <div className="bg-transparent pt-3 px-6 pb-2 border-b border-stone-300 relative">
      <div className="flex justify-between items-start relative">
        {/* Left: Date Display & Selector */}
        <div className="relative">
            <div 
                className="flex items-end gap-3 min-w-[180px] cursor-pointer hover:opacity-75 transition-opacity group select-none"
                onClick={toggleSelector}
            >
                <div className="text-ink-red font-serif text-7xl leading-[0.8] font-bold select-none">
                    {format(currentDate, 'dd')}
                </div>
                <div className="flex flex-col justify-end pb-1">
                    <div className="text-ink-red text-xl font-bold tracking-widest uppercase select-none whitespace-nowrap">
                        {format(currentDate, 'MMM').toUpperCase()}
                    </div>
                    <div className="text-stone-600 font-sans text-xs font-semibold flex items-center gap-2 select-none">
                        {format(currentDate, 'yyyy')}
                    </div>
                </div>
                
                {/* Navigation - Stop Propagation to prevent opening selector when clicking arrows */}
                <div className="flex gap-1 pb-1 ml-2" onClick={(e) => e.stopPropagation()}>
                    <button onClick={onPrevMonth} className="p-1 hover:bg-stone-200 rounded-full text-stone-500 transition-colors" title="Previous month">
                    <ArrowLeft size={16} />
                    </button>
                    <button onClick={onNextMonth} className="p-1 hover:bg-stone-200 rounded-full text-stone-500 transition-colors" title="Next month">
                    <ArrowRight size={16} />
                    </button>
                </div>
            </div>

            {/* Date Selector Overlay */}
            {isSelectorOpen && (
                <>
                    <div className="fixed inset-0 z-30 cursor-default" onClick={closeSelector}></div>
                    <div className="absolute top-full left-0 mt-4 z-40 bg-white/95 backdrop-blur-sm border border-stone-200 shadow-2xl rounded-xl p-4 w-[320px] animate-in fade-in zoom-in-95 slide-in-from-top-2 origin-top-left">
                        {/* Year Navigation */}
                        <div className="flex justify-between items-center mb-4 border-b border-stone-100 pb-2">
                            <button onClick={prevYear} className="p-1 hover:bg-stone-100 rounded-lg text-stone-500 transition-colors" title="Previous year">
                                <ChevronLeft size={20} />
                            </button>
                            <span className="font-serif font-bold text-xl text-ink-black">{selectorYear}</span>
                            <button onClick={nextYear} className="p-1 hover:bg-stone-100 rounded-lg text-stone-500 transition-colors" title="Next year">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                        
                        {/* Month Grid */}
                        <div className="grid grid-cols-4 gap-2">
                            {Array.from({ length: 12 }).map((_, i) => {
                                const isSelected = selectorYear === currentDate.getFullYear() && i === currentDate.getMonth();
                                const isRealCurrent = selectorYear === today.getFullYear() && i === today.getMonth();
                                
                                return (
                                    <button
                                        key={i}
                                        onClick={() => handleMonthSelect(i)}
                                        className={`
                                            py-2 rounded-md text-sm font-medium transition-all duration-200 relative
                                            ${isSelected 
                                                ? 'bg-ink-red text-white shadow-md scale-105 font-bold' 
                                                : isRealCurrent
                                                    ? 'bg-red-50 text-ink-red font-semibold ring-1 ring-inset ring-red-100'
                                                    : 'text-stone-600 hover:bg-stone-100 hover:text-ink-blue'}
                                        `}
                                    >
                                        {getMonthName(i)}
                                        {isRealCurrent && !isSelected && (
                                            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-ink-red rounded-full"></span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>

        {/* Center: Monthly Plan */}
        <div className="flex-1 mx-8 mt-1">
            <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] font-bold tracking-widest text-stone-500 uppercase select-none">{t('monthlyPlan')}</span>
            </div>
            <div className="flex flex-col gap-1">
                {monthlyPlan.map((plan, index) => (
                    <div key={index} className="flex items-center gap-2 border-b border-stone-300/60 pb-0.5">
                        <div className={`w-2.5 h-2.5 rounded-sm shadow-sm ${index === 0 ? 'bg-green-400' : index === 1 ? 'bg-blue-400' : 'bg-ink-red'}`}></div>
                        <input 
                            type="text" 
                            value={plan}
                            onChange={(e) => onUpdatePlan(index, e.target.value)}
                            className="w-full bg-transparent outline-none text-xs font-hand text-stone-700 placeholder-stone-300"
                            placeholder={t('writeGoal')}
                        />
                    </div>
                ))}
            </div>
        </div>
        
        <div className="hidden md:block w-10"></div>
      </div>
    </div>
  );
};

// 使用 memo 包装，避免不必要的重渲染
export const CalendarHeader = memo(CalendarHeaderComponent);
    