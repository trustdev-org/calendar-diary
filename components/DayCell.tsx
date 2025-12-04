
import React, { useState, useRef, useLayoutEffect } from 'react';
import { format, getDate, isSameMonth, isSameDay, getLunarDate, getHoliday } from '../utils/dateUtils';
import { DayData } from '../types';

import { StickerPicker } from './StickerPicker';
import { getCurrentLanguage, t } from '../utils/i18n';

interface DayCellProps {
  day: Date;
  currentDate: Date;
  data?: DayData;
  onClick: () => void;
  highlight?: boolean;
  onContextMenu?: (day: Date) => void;
}

export const DayCell: React.FC<DayCellProps> = ({ day, currentDate, data, onClick, highlight, onContextMenu }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [maxEllipsisCount, setMaxEllipsisCount] = useState(3);
  const eventsListRef = useRef<HTMLDivElement>(null);
  const firstItemRef = useRef<HTMLDivElement>(null);

  const isCurrentMonth = isSameMonth(day, currentDate);
  const isToday = isSameDay(day, new Date());
  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
  const lunar = getLunarDate(day);
  const holiday = getHoliday(day, getCurrentLanguage());
  const stickers = data?.stickers || [];
  const events = data?.events || [];

  // 动态测量首条日记项高度
  useLayoutEffect(() => {
    const el = eventsListRef.current;
    if (!el) return;
    let itemHeight = 22; // 行高提升到24px+2px间距
    if (firstItemRef.current) {
      itemHeight = firstItemRef.current.getBoundingClientRect().height ; // 额外加2-4px缓冲
    }
    const resize = () => {
      const available = el.clientHeight;
      const count = Math.max(1, Math.floor(available / itemHeight));
      setMaxEllipsisCount(count);
    };
    resize();
    // 监听尺寸变化
    const ro = new window.ResizeObserver(resize);
    ro.observe(el);
    return () => ro.disconnect();
  }, [events.length]);

  return (
    <div 
      className={`
        relative flex flex-col border-r border-b border-stone-200 select-none
        ${!isCurrentMonth ? 'bg-stone-50/50 text-stone-300 cursor-default' : 'bg-white text-stone-800 cursor-pointer hover:bg-stone-50'}
        ${isToday ? 'ring-2 ring-inset ring-yellow-200 bg-yellow-50/30' : ''}
        ${highlight ? 'ring-4 ring-blue-400 bg-blue-50 animate-pulse' : ''}
        transition-all duration-200 group overflow-hidden h-full min-h-0
      `}
      style={{
        animation: highlight ? 'pulse 0.5s ease-in-out 2' : undefined
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={isCurrentMonth ? onClick : undefined}
      onContextMenu={(e) => {
        if (!isCurrentMonth) return;
        e.preventDefault();
        if (onContextMenu) {
          onContextMenu(day);
        }
      }}
    >
      {/* Date Header */}
      <div className="flex justify-between items-start p-1.5 shrink-0 relative">
        <div className="flex flex-col leading-none flex-1 min-w-0">
            <span className={`
            text-base font-sans font-bold 
            ${isWeekend && isCurrentMonth ? 'text-ink-red' : ''}
            ${!isCurrentMonth ? 'text-stone-300' : ''}
            `}>
            {getDate(day)}
            </span>
            <div className="flex items-center gap-1 mt-0.5 w-full overflow-hidden">
              <div className="flex items-center gap-1 min-w-0 flex-1 overflow-hidden">
                <span className="text-[8px] text-stone-400 font-serif transform scale-90 origin-left truncate">{lunar}</span>
                {holiday && (
                  <span className="text-[8px] text-ink-red font-medium truncate">{holiday}</span>
                )}
              </div>
              {events.length > maxEllipsisCount && (
                <span className="text-[8px] text-stone-400 whitespace-nowrap shrink-0">
                  {t('entriesCount').replace('{count}', String(events.length))}
                </span>
              )}
            </div>
        </div>
        {/* Decorative Stickers (Top Right) */}
        {stickers.length > 0 && (
          <div className="absolute top-1 right-1 flex flex-wrap justify-end gap-0.5 max-w-[40%] shrink-0 pointer-events-none">
            {stickers.slice(0, 3).map((s, i) => (
              <span key={i} className="text-[10px] leading-none">{s}</span>
            ))}
          </div>
        )}
      </div>
      {/* Events List */}
      <div
        ref={eventsListRef}
        className="flex-1 min-h-0 h-full px-1.5 pb-1 flex flex-col gap-0.5 overflow-hidden"
      >
        {events.slice(0, maxEllipsisCount).map((event, index) => (
          <div
            key={event.id}
            ref={index === 0 ? firstItemRef : undefined}
            className="flex items-baseline gap-1 text-[9px] leading-[1.5] text-stone-600 truncate"
          >
            <span className="text-stone-400 font-mono text-[8px] shrink-0">{index + 1}.</span>
            <span className="shrink-0">{event.emoji}</span>
            <span className="truncate">{event.summary || event.rawText}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
