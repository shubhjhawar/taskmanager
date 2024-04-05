export function isPastDate(year: number, month: number, day: number): boolean {
  const currentDate = new Date();
  const inputDate = new Date(year, month - 1, day);
  return inputDate < currentDate;
}

export function isCurrentWeek(date: any): boolean {
  const current = new Date();
  const firstDayOfWeek = new Date(current.getFullYear(), current.getMonth(), current.getDate() - current.getDay());
  const lastDayOfWeek = new Date(firstDayOfWeek);
  lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6);
  return date >= firstDayOfWeek && date <= lastDayOfWeek;
}

export function isNextWeek(date: any): boolean {
  const current = new Date();
  const firstDayOfNextWeek = new Date(current.getFullYear(), current.getMonth(), current.getDate() - current.getDay() + 7);
  const lastDayOfNextWeek = new Date(firstDayOfNextWeek);
  lastDayOfNextWeek.setDate(lastDayOfNextWeek.getDate() + 6);
  return date >= firstDayOfNextWeek && date <= lastDayOfNextWeek;
}

export function isCurrentMonth(date: any): boolean {
  const current = new Date();
  const firstDayOfMonth = new Date(current.getFullYear(), current.getMonth(), 1);
  const lastDayOfMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0);
  return date >= firstDayOfMonth && date <= lastDayOfMonth;
}

export function isNextMonth(date: any): boolean {
  const current = new Date();
  const firstDayOfNextMonth = new Date(current.getFullYear(), current.getMonth() + 1, 1);
  const lastDayOfNextMonth = new Date(current.getFullYear(), current.getMonth() + 2, 0);
  return date >= firstDayOfNextMonth && date <= lastDayOfNextMonth;
}

export function isCurrentQuarter(date: any): boolean {
  const current = new Date();
  const quarter = Math.floor((current.getMonth() / 3));
  const firstMonthOfQuarter = quarter * 3;
  const firstDayOfQuarter = new Date(current.getFullYear(), firstMonthOfQuarter, 1);
  const lastDayOfQuarter = new Date(current.getFullYear(), firstMonthOfQuarter + 3, 0);
  return date >= firstDayOfQuarter && date <= lastDayOfQuarter;
}

export function isNextQuarter(date: any): boolean {
  const current = new Date();
  const quarter = Math.floor((current.getMonth() / 3));
  const firstMonthOfNextQuarter = (quarter + 1) * 3;
  const firstDayOfNextQuarter = new Date(current.getFullYear(), firstMonthOfNextQuarter, 1);
  const lastDayOfNextQuarter = new Date(current.getFullYear(), firstMonthOfNextQuarter + 3, 0);
  return date >= firstDayOfNextQuarter && date <= lastDayOfNextQuarter;
}

export function isCurrentYear(date: any): boolean {
  const current = new Date();
  const firstDayOfYear = new Date(current.getFullYear(), 0, 1); // January 1st of this year
  const lastDayOfYear = new Date(current.getFullYear(), 11, 31); // December 31st of this year
  return date >= firstDayOfYear && date <= lastDayOfYear;
}
