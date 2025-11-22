import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  addMonths, 
  subMonths, 
  isSameMonth, 
  isSameDay, 
  getDate,
  getYear,
  getMonth
} from 'date-fns';

// Simplified Lunar Date mapping for visual purposes
// In a real production app, use 'lunar-javascript'
const LUNAR_DAYS = [
  "初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十",
  "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
  "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十"
];

const SOLAR_TERMS: Record<string, string> = {
  '2-4': '立春', '2-19': '雨水',
  '3-5': '惊蛰', '3-20': '春分',
  '4-4': '清明', '4-19': '谷雨',
  '5-5': '立夏', '5-20': '小满',
  '6-5': '芒种', '6-21': '夏至',
  '7-6': '小暑', '7-22': '大暑',
  '8-7': '立秋', '8-23': '处暑',
  '9-7': '白露', '9-22': '秋分',
  '10-8': '寒露', '10-23': '霜降',
  '11-7': '立冬', '11-22': '小雪',
  '12-6': '大雪', '12-21': '冬至',
  '1-5': '小寒', '1-20': '大寒',
};

export const getCalendarDays = (currentDate: Date) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  return eachDayOfInterval({
    start: startDate,
    end: endDate,
  });
};

export const getLunarDate = (date: Date): string => {
  // This is a simplified mock. 
  // We map the day of the month to a lunar day roughly for display.
  // We shift it slightly based on month to make it look dynamic.
  const day = getDate(date);
  const month = getMonth(date);
  
  // Check for specific holidays/terms first
  const key = `${month + 1}-${day}`;
  if (SOLAR_TERMS[key]) return SOLAR_TERMS[key];
  if (key === '1-1') return '元旦';
  if (key === '5-1') return '劳动节';
  if (key === '10-1') return '国庆';

  // Mock lunar offset
  const offset = (month * 2) % 30;
  const lunarIndex = (day + offset) % 30;
  return LUNAR_DAYS[lunarIndex];
};

export { 
  format, 
  addMonths, 
  subMonths, 
  isSameMonth, 
  isSameDay,
  getDate,
  getYear,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval
};