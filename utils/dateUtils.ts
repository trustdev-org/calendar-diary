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
import { Lunar, Solar } from 'lunar-javascript';

// 节假日定义
interface Holiday {
  month: number;
  day: number;
  name: string;
}

// 各语言的节假日（包含法定节假日和传统节日）
const HOLIDAYS: Record<string, Holiday[]> = {
  'zh-CN': [
    // 法定节假日
    { month: 1, day: 1, name: '元旦' },
    { month: 3, day: 8, name: '妇女节' },
    { month: 4, day: 5, name: '清明节' },
    { month: 5, day: 1, name: '劳动节' },
    { month: 5, day: 4, name: '青年节' },
    { month: 6, day: 1, name: '儿童节' },
    { month: 8, day: 1, name: '建军节' },
    { month: 9, day: 10, name: '教师节' },
    { month: 10, day: 1, name: '国庆节' },
    // 传统节日（西方）
    { month: 2, day: 14, name: '情人节' },
    { month: 12, day: 24, name: '平安夜' },
    { month: 12, day: 25, name: '圣诞节' },
  ],
  'zh-TW': [
    // 法定节假日
    { month: 1, day: 1, name: '中華民國開國紀念日' },
    { month: 2, day: 28, name: '和平紀念日' },
    { month: 4, day: 4, name: '兒童節' },
    { month: 4, day: 5, name: '清明節' },
    { month: 9, day: 28, name: '教師節' },
    { month: 10, day: 10, name: '國慶日' },
    { month: 10, day: 25, name: '光復節' },
    { month: 11, day: 12, name: '國父誕辰' },
    { month: 12, day: 25, name: '行憲紀念日' },
    // 传统节日
    { month: 2, day: 14, name: '情人節' },
    { month: 12, day: 24, name: '平安夜' },
  ],
  'en': [
    // Federal Holidays (USA)
    { month: 1, day: 1, name: 'New Year' },
    { month: 1, day: 20, name: 'MLK Day' },
    { month: 2, day: 17, name: 'Presidents\' Day' },
    { month: 5, day: 26, name: 'Memorial Day' },
    { month: 6, day: 19, name: 'Juneteenth' },
    { month: 7, day: 4, name: 'Independence Day' },
    { month: 9, day: 1, name: 'Labor Day' },
    { month: 10, day: 13, name: 'Columbus Day' },
    { month: 11, day: 11, name: 'Veterans Day' },
    { month: 11, day: 27, name: 'Thanksgiving' },
    { month: 12, day: 25, name: 'Christmas' },
    // Traditional Holidays
    { month: 2, day: 2, name: 'Groundhog Day' },
    { month: 2, day: 14, name: 'Valentine\'s Day' },
    { month: 3, day: 17, name: 'St. Patrick\'s Day' },
    { month: 10, day: 31, name: 'Halloween' },
    { month: 12, day: 24, name: 'Christmas Eve' },
    { month: 12, day: 31, name: 'New Year\'s Eve' },
  ],
  'ja': [
    // 国民の祝日
    { month: 1, day: 1, name: '元日' },
    { month: 1, day: 13, name: '成人の日' },
    { month: 2, day: 11, name: '建国記念日' },
    { month: 2, day: 23, name: '天皇誕生日' },
    { month: 3, day: 20, name: '春分の日' },
    { month: 4, day: 29, name: '昭和の日' },
    { month: 5, day: 3, name: '憲法記念日' },
    { month: 5, day: 4, name: 'みどりの日' },
    { month: 5, day: 5, name: 'こどもの日' },
    { month: 7, day: 21, name: '海の日' },
    { month: 8, day: 11, name: '山の日' },
    { month: 9, day: 15, name: '敬老の日' },
    { month: 9, day: 22, name: '秋分の日' },
    { month: 10, day: 13, name: 'スポーツの日' },
    { month: 11, day: 3, name: '文化の日' },
    { month: 11, day: 23, name: '勤労感謝の日' },
    // 伝統行事
    { month: 2, day: 3, name: '節分' },
    { month: 2, day: 14, name: 'バレンタイン' },
    { month: 3, day: 3, name: 'ひな祭り' },
    { month: 3, day: 14, name: 'ホワイトデー' },
    { month: 7, day: 7, name: '七夕' },
    { month: 12, day: 24, name: 'クリスマスイブ' },
    { month: 12, day: 25, name: 'クリスマス' },
    { month: 12, day: 31, name: '大晦日' },
  ],
  'ko': [
    // 법정 공휴일
    { month: 1, day: 1, name: '신정' },
    { month: 3, day: 1, name: '삼일절' },
    { month: 4, day: 5, name: '식목일' },
    { month: 5, day: 5, name: '어린이날' },
    { month: 5, day: 15, name: '스승의날' },
    { month: 6, day: 6, name: '현충일' },
    { month: 7, day: 17, name: '제헌절' },
    { month: 8, day: 15, name: '광복절' },
    { month: 10, day: 3, name: '개천절' },
    { month: 10, day: 9, name: '한글날' },
    { month: 12, day: 25, name: '성탄절' },
    // 전통 명절
    { month: 2, day: 14, name: '발렌타인데이' },
    { month: 3, day: 14, name: '화이트데이' },
    { month: 4, day: 14, name: '블랙데이' },
    { month: 11, day: 11, name: '빼빼로데이' },
    { month: 12, day: 24, name: '크리스마스이브' },
    { month: 12, day: 31, name: '연말' },
  ],
  'ru': [
    // Государственные праздники
    { month: 1, day: 1, name: 'Новый год' },
    { month: 1, day: 7, name: 'Рождество' },
    { month: 2, day: 23, name: 'День защитника' },
    { month: 3, day: 8, name: 'Международный женский день' },
    { month: 5, day: 1, name: 'Праздник весны и труда' },
    { month: 5, day: 9, name: 'День Победы' },
    { month: 6, day: 12, name: 'День России' },
    { month: 11, day: 4, name: 'День народного единства' },
    { month: 12, day: 12, name: 'День Конституции' },
    // Традиционные праздники
    { month: 2, day: 14, name: 'День влюблённых' },
    { month: 9, day: 1, name: 'День знаний' },
    { month: 10, day: 5, name: 'День учителя' },
    { month: 12, day: 31, name: 'Новогодняя ночь' },
  ],
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
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // 使用 lunar-javascript 库获取真实的农历日期
  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();
  
  // 优先显示节日
  const festival = lunar.getFestivals()[0] || lunar.getOtherFestivals()[0];
  if (festival) return festival;
  
  // 显示节气
  const jieQi = lunar.getJieQi();
  if (jieQi) return jieQi;
  
  // 显示农历日期
  const lunarDay = lunar.getDayInChinese();
  
  // 如果是初一，显示月份
  if (lunarDay === '初一') {
    return lunar.getMonthInChinese() + '月';
  }
  
  return lunarDay;
};

// 获取公历节假日
export const getHoliday = (date: Date, language: string): string | null => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  const holidays = HOLIDAYS[language] || [];
  const holiday = holidays.find(h => h.month === month && h.day === day);
  
  return holiday ? holiday.name : null;
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