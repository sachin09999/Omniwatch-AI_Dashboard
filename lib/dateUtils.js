/**
 * Date range calculation utilities for OmniVision AI Dashboard
 * Converts time_frame options ('today', 'yesterday', 'this_week', 'this_month')
 * into YYYY-MM-DD start_date and end_date strings accepted by the backend.
 */

export function formatDateStr(dateObj) {
  if (!dateObj || isNaN(dateObj.getTime())) return '';
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDateRangeFromTimeFrame(timeFrame = 'today', startDate = '', endDate = '') {
  // If custom dates are explicitly provided, use them
  if (startDate && endDate) {
    return { startDate, endDate };
  }
  if (startDate && !endDate) {
    return { startDate, endDate: startDate };
  }
  if (!startDate && endDate) {
    return { startDate: endDate, endDate };
  }

  const now = new Date();
  const todayStr = formatDateStr(now);

  if (!timeFrame || timeFrame === 'today') {
    return { startDate: todayStr, endDate: todayStr };
  }

  if (timeFrame === 'yesterday') {
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yestStr = formatDateStr(yesterday);
    return { startDate: yestStr, endDate: yestStr };
  }

  if (timeFrame === 'last_7_days' || timeFrame === 'this_week' || timeFrame === 'week') {
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    return { startDate: formatDateStr(startOfWeek), endDate: todayStr };
  }

  if (timeFrame === 'last_30_days' || timeFrame === 'this_month' || timeFrame === 'month') {
    const startOfMonth = new Date(now);
    startOfMonth.setDate(now.getDate() - 30);
    return { startDate: formatDateStr(startOfMonth), endDate: todayStr };
  }

  if (timeFrame === 'all_time' || timeFrame === 'all') {
    return { startDate: '', endDate: '' };
  }

  // Default fallback to today
  return { startDate: todayStr, endDate: todayStr };
}
