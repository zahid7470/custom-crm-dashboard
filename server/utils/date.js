import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = process.env.TIMEZONE || 'Asia/Kolkata';

export const tz = (date) => dayjs(date).tz(TZ);

export const startOfDay = (date = new Date()) => tz(date).startOf('day').toDate();
export const endOfDay = (date = new Date()) => tz(date).endOf('day').toDate();
export const startOfMonth = (date = new Date()) => tz(date).startOf('month').toDate();
export const endOfMonth = (date = new Date()) => tz(date).endOf('month').toDate();
export const now = () => tz();
export const addDays = (date, days) => tz(date).add(days, 'day').toDate();

export { dayjs };
