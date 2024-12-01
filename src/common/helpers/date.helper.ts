import { IPeriod } from '@common/constants/app.constant';

export const getDatesByWeekOrMonth = (weekOrMonth: IPeriod, start?: string, end?: string): string[] => {
  // Changed return type to string[] for consistency with date formatting
  const currentDate = new Date();
  let startDate: Date;
  let endDate: Date;

  switch (weekOrMonth) {
    case 'week':
      const currentDayOfWeek = currentDate.getDay();

      // Nếu là Chủ nhật (day 0), lùi về thứ 2 tuần trước (currentDayOfWeek === 0 thì -6)
      // Còn nếu là Thứ 2 đến Thứ 7 (day 1-6), lùi về Thứ 2 của tuần hiện tại
      startDate = new Date(currentDate);
      startDate.setDate(currentDate.getDate() - (currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1));

      // Ngày kết thúc là Chủ nhật (luôn là 6 ngày sau ngày Thứ 2)
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      break;
    case 'month':
      startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      break;
    case 'today':
      startDate = new Date(currentDate);
      endDate = new Date(currentDate);
      break;
    case 'custom':
      if (!start || !end) {
        throw new Error('For "custom" type, both start and end dates must be provided.');
      }
      startDate = new Date(start);
      endDate = new Date(end);
      if (startDate > endDate) {
        throw new Error('Start date must be before end date.');
      }
      // Calculate the difference in days between start and end dates
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      // Check if the difference is greater than 90 days (~3 months)
      if (diffDays > 90) {
        throw new Error('The date range should not exceed 3 months.');
      }
      break;
    default:
      throw new Error('Invalid option. Please choose "week", "month", or "today".');
  }

  const dates = [];
  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    dates.push(new Date(date).toISOString().split('T')[0]);
  }

  return dates;
};
