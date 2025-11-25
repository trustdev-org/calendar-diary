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