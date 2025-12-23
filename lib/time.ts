import { DateTime, Duration } from "luxon";

export const COACH_TIMEZONE = "Australia/Hobart";
export const LESSON_DURATION_MINUTES = 60;
export const SLOT_STEP_MINUTES = 30;
export const MAX_BOOKING_DAYS = 30;
export const MAX_GROUP_SIZE = 4;
export const BUSINESS_HOURS = {
  START: 8,
  END: 20, // 8 PM
};

export type AvailabilityBlock = {
  start: string; // HH:mm
  end: string; // HH:mm
};

const fullDayBlock: AvailabilityBlock[] = [{ start: "08:00", end: "20:00" }];
export const weeklyAvailability: Record<number, AvailabilityBlock[]> = {
  1: fullDayBlock,
  2: fullDayBlock,
  3: fullDayBlock,
  4: fullDayBlock,
  5: fullDayBlock,
  6: fullDayBlock,
  7: fullDayBlock,
};

export const parseDateParam = (value: string | null): DateTime | null => {
  if (!value) return null;
  const dt = DateTime.fromISO(value, { zone: COACH_TIMEZONE, setZone: true });
  if (!dt.isValid) return null;
  return dt.startOf("day");
};

const availabilityDuration = Duration.fromObject({ minutes: LESSON_DURATION_MINUTES });
const slotStepDuration = Duration.fromObject({ minutes: SLOT_STEP_MINUTES });

const toBlockDateTime = (date: DateTime, time: string) =>
  DateTime.fromFormat(`${date.toISODate()} ${time}`, "yyyy-MM-dd HH:mm", {
    zone: COACH_TIMEZONE,
  });

export const generateSlotsForDate = (date: DateTime): DateTime[] => {
  const weekday = date.weekday; // luxon weekday: Monday=1, Sunday=7
  const dayAvailability = weeklyAvailability[weekday];
  if (!dayAvailability) return [];

  const slots: DateTime[] = [];
  dayAvailability.forEach((block) => {
    const blockStart = toBlockDateTime(date, block.start);
    const blockEnd = toBlockDateTime(date, block.end);
    const latestStart = blockEnd.minus(availabilityDuration);
    let cursor = blockStart;
    while (cursor <= latestStart) {
      slots.push(cursor);
      cursor = cursor.plus(slotStepDuration);
    }
  });
  return slots;
};

export const formatDisplayTime = (value: string): string => {
  const dt = DateTime.fromISO(value, { zone: COACH_TIMEZONE });
  if (!dt.isValid) return value;
  return dt.setZone(COACH_TIMEZONE).toFormat("h:mm a");
};

export const formatDisplayDate = (value: string): string => {
  const dt = DateTime.fromISO(value, { zone: COACH_TIMEZONE });
  if (!dt.isValid) return value;
  return dt.setZone(COACH_TIMEZONE).toFormat("cccc, d LLL yyyy");
};

export const serializeDateTime = (dt: DateTime): string =>
  dt.setZone(COACH_TIMEZONE).toISO({ suppressMilliseconds: true })!;
