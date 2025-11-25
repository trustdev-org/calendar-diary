
import React, { useState } from 'react';
import { format, getDate, isSameMonth, isSameDay, getLunarDate, getHoliday } from '../utils/dateUtils';
import { DayData } from '../types';
import { StickerPicker } from './StickerPicker';
import { getCurrentLanguage } from '../utils/i18n';

interface DayCellProps {
  day: Date;
  currentDate: Date;
  data?: DayData;
  onClick: () => void;
}

export const DayCell: React.FC<DayCellProps> = ({ day, currentDate, data, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const isCurrentMonth = isSameMonth(day, currentDate);
  const isToday = isSameDay(day, new Date());
  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
  const lunar = getLunarDate(day);
  const holiday = getHoliday(day, getCurrentLanguage());
  
  const stickers = data?.stickers || [];
  const events = data?.events || [];

  return (
    <div 
      className={`
        relative flex flex-col border-r border-b border-stone-200 select-none
        ${!isCurrentMonth ? 'bg-stone-50/50 text-stone-300 cursor-default' : 'bg-white text-stone-800 cursor-pointer hover:bg-stone-50'}
        ${isToday ? 'ring-2 ring-inset ring-yellow-200 bg-yellow-50/30' : ''}
        transition-all duration-200 group overflow-hidden h-full min-h-0
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={isCurrentMonth ? onClick : undefined}
    >
      {/* Date Header */}
      <div className="flex justify-between items-start p-1.5 shrink-0">
        <div className="flex flex-col leading-none">
            <span className={`
            text-base font-sans font-bold 
            ${isWeekend && isCurrentMonth ? 'text-ink-red' : ''}
            ${!isCurrentMonth ? 'text-stone-300' : ''}
            `}>
            {getDate(day)}
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[8px] text-stone-400 font-serif transform scale-90 origin-left">{lunar}</span>
              {holiday && (
                <span className="text-[8px] text-ink-red font-medium">{holiday}</span>
              )}
            </div>
        </div>
        
        {/* Decorative Stickers (Top Right) */}
        <div className="flex flex-wrap justify-end gap-0.5 max-w-[50%]">
            {stickers.slice(0, 3).map((s, i) => (
                <span key={i} className="text-[10px] leading-none">{s}</span>
            ))}
        </div>
      </div>

      {/* Events List */}
      <div className="flex-1 px-1.5 pb-1 flex flex-col gap-0.5 overflow-hidden">
        {events.map((event, index) => (
            <div key={event.id} className="flex items-baseline gap-1 text-[9px] leading-tight text-stone-600 truncate">
                <span className="text-stone-400 font-mono text-[8px] shrink-0">{index + 1}.</span>
                <span className="shrink-0">{event.emoji}</span>
                <span className="truncate">{event.summary || event.rawText}</span>
            </div>
        ))}
        {events.length > 5 && (
            <div className="text-[8px] text-stone-400 pl-1">...</div>
        )}
      </div>
    </div>
  );
};
