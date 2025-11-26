import React, { useState, useEffect, useRef } from 'react';
import { X, Search } from 'lucide-react';
import { format, parse } from '../utils/dateUtils';
import { DayData } from '../types';

interface SearchModalProps {
  onClose: () => void;
  data: Record<string, DayData>;
  onSelectDate: (date: Date) => void;
}

interface SearchResult {
  dateKey: string;
  date: Date;
  content: string;
  matchText: string;
}

export const SearchModal: React.FC<SearchModalProps> = ({ onClose, data, onSelectDate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsVisible(true);
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const searchResults: SearchResult[] = [];

    Object.entries(data).forEach(([dateKey, dayData]) => {
      const typedData = dayData as DayData;
      if (!typedData || !typedData.events || typedData.events.length === 0) return;

      const allText = typedData.events.map(e => e.rawText).join(' ');
      
      if (allText.toLowerCase().includes(query)) {
        const date = parse(dateKey, 'yyyy-MM-dd', new Date());
        
        // 找到匹配的文本片段
        const matchIndex = allText.toLowerCase().indexOf(query);
        const start = Math.max(0, matchIndex - 20);
        const end = Math.min(allText.length, matchIndex + query.length + 20);
        let matchText = allText.substring(start, end);
        
        if (start > 0) matchText = '...' + matchText;
        if (end < allText.length) matchText = matchText + '...';

        searchResults.push({
          dateKey,
          date,
          content: allText,
          matchText
        });
      }
    });

    // 按日期降序排序（最新的在前）
    searchResults.sort((a, b) => b.date.getTime() - a.date.getTime());
    setResults(searchResults);
  }, [searchQuery, data]);

  const handleSelectResult = (result: SearchResult) => {
    onSelectDate(result.date);
    onClose();
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index} className="bg-yellow-200 text-stone-900 rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm transition-all duration-200"
      style={{
        backgroundColor: isVisible ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0)',
        opacity: isVisible ? 1 : 0
      }}
      onClick={onClose}
    >
      <div 
        className="bg-white w-[600px] max-h-[600px] rounded-lg shadow-2xl overflow-hidden flex flex-col transition-all duration-200 ease-out"
        style={{
          transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
          opacity: isVisible ? 1 : 0
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#ececec] px-4 py-2 border-b border-[#dcdcdc] flex justify-between items-center select-none">
          <div className="flex items-center gap-2">
            <Search size={14} className="text-stone-600" />
            <span className="text-xs font-bold text-stone-600">搜索日记</span>
            <span className="text-[10px] text-stone-400">
              {navigator.platform.includes('Mac') ? '⌘F' : 'Ctrl+F'}
            </span>
          </div>
          <button 
            onClick={onClose} 
            className="text-stone-400 hover:text-stone-600 transition-colors"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-stone-200">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入关键词搜索日记内容..."
              className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 text-sm"
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4">
          {!searchQuery.trim() ? (
            <div className="flex flex-col items-center justify-center h-full text-stone-400">
              <Search size={48} className="mb-2 opacity-50" />
              <p className="text-sm">输入关键词开始搜索</p>
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-stone-400">
              <p className="text-sm">未找到包含 "{searchQuery}" 的日记</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-stone-500 mb-3">
                找到 {results.length} 条结果
              </p>
              {results.map((result) => (
                <button
                  key={result.dateKey}
                  onClick={() => handleSelectResult(result)}
                  className="w-full text-left p-3 bg-stone-50 hover:bg-stone-100 rounded-lg border border-stone-200 transition-colors group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-stone-700 group-hover:text-stone-900">
                      {format(result.date, 'yyyy年MM月dd日')}
                    </span>
                    <span className="text-xs text-stone-400">
                      {format(result.date, 'EEEE')}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 line-clamp-2">
                    {highlightMatch(result.matchText, searchQuery)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
