
export interface DayEvent {
  id: string;
  rawText: string;
  summary: string;
  emoji: string;
}

export interface DayData {
  date: string; // YYYY-MM-DD
  events: DayEvent[];
  stickers: string[]; // Array of decorative sticker IDs
}

export interface CalendarState {
  currentDate: Date;
  data: Record<string, DayData>; // Keyed by YYYY-MM-DD
  monthlyPlan: string[]; // 3 lines of monthly plan
}

export interface Sticker {
  id: string;
  label: string;
  emoji: string;
}

export const WEEK_DAYS = [
  { id: 0, color: 'bg-ink-red' },
  { id: 1, color: 'bg-ink-blue' },
  { id: 2, color: 'bg-ink-blue' },
  { id: 3, color: 'bg-ink-blue' },
  { id: 4, color: 'bg-ink-blue' },
  { id: 5, color: 'bg-ink-blue' },
  { id: 6, color: 'bg-ink-red' },
];

export const STICKERS: Sticker[] = [
  { id: 's1', label: '会议', emoji: '📅' },
  { id: 's2', label: '生日', emoji: '🎂' },
  { id: 's3', label: '健身', emoji: '🏋️' },
  { id: 's4', label: '休息', emoji: '💤' },
  { id: 's5', label: '旅行', emoji: '✈️' },
  { id: 's6', label: '电影', emoji: '🎬' },
  { id: 's7', label: '购物', emoji: '🛍️' },
  { id: 's8', label: '想法', emoji: '💡' },
  { id: 's9', label: '恋爱', emoji: '❤️' },
  { id: 's10', label: '重要', emoji: '⭐' },
];

// Electron API types
export interface ElectronAPI {
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  saveData: (data: Record<string, DayData>) => Promise<void>;
  loadData: () => Promise<Record<string, DayData>>;
  savePlans: (plans: Record<string, string[]>) => Promise<void>;
  loadPlans: () => Promise<Record<string, string[]>>;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}
