
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { format, getLunarFullDate } from '../utils/dateUtils';
import { DayData, DayEvent, STICKERS } from '../types';
import { X, Plus, Trash2, Save } from 'lucide-react';
import { t } from '../utils/i18n';

interface DayEditorProps {
  date: Date;
  initialData?: DayData;
  onClose: () => void;
  onSave: (date: string, events: DayEvent[], stickers: string[]) => void;
}

// Emoji 列表移到组件外，避免每次渲染重建
const EVENT_EMOJIS = [
  '📝', '✅', '⭐', '🎯', '💡', '📌', '🔥', '⚡', 
  '🎨', '📚', '💼', '🏃', '🎵', '🍔', '☕', '👍',
  '❤️', '🎉', '🚀', '🌟', '👑', '🏆', '🎓', '💯',
  '⏰', '📅', '💬', '👀', '🧠', '✨', '🌈', '🌺'
];

export const DayEditor: React.FC<DayEditorProps> = ({ date, initialData, onClose, onSave }) => {
  const [events, setEvents] = useState<DayEvent[]>(() => initialData?.events || []);
  const [stickers, setStickers] = useState<string[]>(() => initialData?.stickers || []);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState<string | null>(null);
  const [emojiPickerPosition, setEmojiPickerPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);

  // 入场动画
  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  // 初始化空事件
  useEffect(() => {
    if (events.length === 0) {
      setEvents([{ id: Date.now().toString(), rawText: '', summary: '', emoji: '📝' }]);
    }
  }, []);

  const handleAddEvent = useCallback(() => {
    setEvents(prev => [...prev, { id: Date.now().toString(), rawText: '', summary: '', emoji: '📝' }]);
  }, []);

  const handleEventChange = useCallback((id: string, text: string) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, rawText: text, summary: text } : e));
  }, []);

  const handleDeleteEvent = useCallback((id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  }, []);

  const handleEmojiButtonClick = useCallback((id: string, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setEmojiPickerPosition({
      top: rect.bottom + 5,
      left: rect.left - 80
    });
    setEmojiPickerOpen(prev => prev === id ? null : id);
  }, []);
  
  const handleSelectEmoji = useCallback((id: string, emoji: string) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, emoji } : e));
    setEmojiPickerOpen(null);
  }, []);

  const closeEmojiPicker = useCallback(() => setEmojiPickerOpen(null), []);

  const handleSave = useCallback(() => {
    const cleanEvents = events.filter(e => e.rawText.trim() !== '');
    onSave(format(date, 'yyyy-MM-dd'), cleanEvents, stickers);
    onClose();
  }, [events, stickers, date, onSave, onClose]);

  const toggleSticker = useCallback((emoji: string) => {
    setStickers(prev => 
      prev.includes(emoji) ? prev.filter(s => s !== emoji) : [...prev, emoji]
    );
  }, []);

  // 缓存日期格式化
  const dateFormatted = useMemo(() => format(date, 'yyyy/MM/dd'), [date]);
  const lunarDate = useMemo(() => getLunarFullDate(date), [date]);

  // 动画样式
  const backdropStyle = useMemo(() => ({
    backgroundColor: isVisible ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0)',
    opacity: isVisible ? 1 : 0
  }), [isVisible]);

  const modalStyle = useMemo(() => ({
    transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
    opacity: isVisible ? 1 : 0
  }), [isVisible]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm transition-all duration-200"
      style={backdropStyle}
    >
      <div 
        className="bg-white w-[480px] rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh] transition-all duration-200 ease-out"
        style={modalStyle}
      >
        {/* Header */}
        <div className="bg-stone-100 px-4 py-3 border-b border-stone-200 flex justify-between items-center">
          <div>
             <h2 className="font-serif font-bold text-xl text-ink-black">{dateFormatted}</h2>
             <p className="text-xs text-stone-500 uppercase tracking-wide">{lunarDate}</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors" title="Close">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {/* Events Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
               <label className="text-xs font-bold text-stone-500 uppercase">{t('todoEvents')}</label>
            </div>
            
            <div className="space-y-2">
              {events.map((event, index) => (
                <div key={event.id} className="flex items-start gap-2 group">
                  <span className="text-stone-400 font-mono text-xs w-4 pt-1.5">{index + 1}.</span>
                  <textarea
                    value={event.rawText}
                    onChange={(e) => handleEventChange(event.id, e.target.value)}
                    placeholder={t('writeTask')}
                    className="auto-resize-textarea flex-1 bg-stone-50 border border-transparent focus:border-stone-300 focus:bg-white rounded px-2 py-1.5 text-sm outline-none transition-all resize-none min-h-[36px] max-h-[150px] overflow-y-auto"
                    autoFocus={index === events.length - 1 && event.rawText === ''}
                    rows={1}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      const newHeight = Math.min(target.scrollHeight, 150);
                      target.style.height = newHeight + 'px';
                    }}
                  />
                  <div className="relative">
                    <button
                      onClick={(e) => handleEmojiButtonClick(event.id, e)}
                      className="w-6 text-center text-lg pt-0.5 hover:scale-110 transition-transform cursor-pointer hover:bg-stone-100 rounded"
                      title="点击选择表情"
                    >
                      {event.emoji}
                    </button>
                  </div>
                  <button 
                    onClick={() => handleDeleteEvent(event.id)}
                    className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-red-400 transition-opacity pt-1"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            
            <button 
              onClick={handleAddEvent}
              className="mt-3 flex items-center gap-1 text-stone-400 hover:text-stone-600 text-xs font-medium transition-colors"
            >
              <Plus size={14} /> {t('addItem')}
            </button>
          </div>

          {/* Stickers Section */}
          <div>
            <label className="text-xs font-bold text-stone-500 uppercase mb-2 block">{t('moodStickers')}</label>
            <div className="flex flex-wrap gap-2 bg-stone-50 p-3 rounded-lg border border-stone-100">
              {STICKERS.map(s => (
                <button
                  key={s.id}
                  onClick={() => toggleSticker(s.emoji)}
                  className={`
                    text-2xl p-1.5 rounded transition-all hover:scale-110
                    ${stickers.includes(s.emoji) ? 'bg-white shadow-sm ring-1 ring-stone-200' : 'opacity-60 hover:opacity-100'}
                  `}
                  title={s.label}
                >
                  {s.emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-50 px-4 py-3 border-t border-stone-200 flex justify-end gap-2">
          <button 
            onClick={onClose}
            className="px-4 py-1.5 rounded text-sm font-medium text-stone-500 hover:bg-stone-200 transition-colors"
          >
            {t('cancel')}
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-1.5 rounded text-sm font-medium bg-ink-black text-white hover:bg-stone-700 transition-colors shadow-sm"
          >
            <Save size={14} /> {t('saveChanges')}
          </button>
        </div>
      </div>

      {/* Emoji Picker Popup */}
      {emojiPickerOpen && (
        <>
          <div 
            className="fixed inset-0 z-50" 
            onClick={closeEmojiPicker}
          />
          <div 
            className="fixed z-50 bg-white rounded-lg shadow-2xl border border-stone-200 p-2 w-[200px]"
            style={{
              top: `${emojiPickerPosition.top}px`,
              left: `${emojiPickerPosition.left}px`
            }}
          >
            <div className="grid grid-cols-6 gap-1">
              {EVENT_EMOJIS.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectEmoji(emojiPickerOpen, emoji)}
                  className="text-xl hover:bg-stone-100 rounded p-1 transition-colors hover:scale-110"
                  title={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
