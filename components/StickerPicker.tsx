import React from 'react';
import { STICKERS, Sticker } from '../types';

interface StickerPickerProps {
  onSelect: (sticker: Sticker) => void;
  onClose: () => void;
}

export const StickerPicker: React.FC<StickerPickerProps> = ({ onSelect, onClose }) => {
  return (
    <div className="absolute z-50 bg-white border border-stone-300 shadow-xl rounded-lg p-3 w-64 top-10 right-0">
      <div className="flex justify-between items-center mb-2 pb-2 border-b border-stone-100">
        <span className="text-xs font-bold text-stone-500 uppercase">Select Sticker</span>
        <button onClick={onClose} className="text-stone-400 hover:text-stone-600">&times;</button>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {STICKERS.map((sticker) => (
          <button
            key={sticker.id}
            onClick={() => onSelect(sticker)}
            className="text-2xl hover:bg-stone-100 p-1 rounded transition-colors"
            title={sticker.label}
          >
            {sticker.emoji}
          </button>
        ))}
      </div>
    </div>
  );
};