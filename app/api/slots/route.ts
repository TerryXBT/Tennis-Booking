import { NextRequest, NextResponse } from "next/server";
import { DateTime } from "luxon";

import { COACH_ID, supabaseClient } from "@/lib/supabaseClient";
import {
  COACH_TIMEZONE,
  generateSlotsForDate,
  parseDateParam,
  serializeDateTime,
} from "@/lib/time";
import type { SlotResponse } from "@/types";

export async function GET(request: NextRequest) {
  const dateParam = request.nextUrl.searchParams.get("date");
  const date = parseDateParam(dateParam);

  if (!date) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  const today = DateTime.now().setZone(COACH_TIMEZONE).startOf("day");
  const maxDate = today.plus({ days: 30 });

  if (date < today || date > maxDate) {
    const payload: SlotResponse = {
      date: date.toISODate()!,
      timezone: COACH_TIMEZONE,
      slots: [],
    };
    return NextResponse.json(payload);
  }

  const potentialSlots = generateSlotsForDate(date);
  if (potentialSlots.length === 0) {
    const payload: SlotResponse = {
      date: date.toISODate()!,
      timezone: COACH_TIMEZONE,
      slots: [],
    };
    return NextResponse.json(payload);
  }

  const dayStart = date.startOf("day");
  const dayEnd = dayStart.plus({ days: 1 });

  const { data, error } = await supabaseClient
    .from("booking")
    .select("start_time, end_time")
    .eq("coach_id", COACH_ID)
    .eq("status", "confirmed")
    .gte("start_time", dayStart.toISO())
    .lt("start_time", dayEnd.toISO());

  if (error) {
    console.error("/api/slots", error);
    return NextResponse.json({ error: "Unable to load slots" }, { status: 500 });
  }

  // Parse bookings into millis intervals for efficient checking
  const bookings = (data ?? []).map((row) => ({
    start: DateTime.fromISO(row.start_time).toMillis(),
    end: DateTime.fromISO(row.end_time).toMillis(),
  }));

  const LESSON_MS = 60 * 60 * 1000;

  const availableSlots = potentialSlots
    .filter((slot) => {
      const slotStart = slot.toMillis();
      const slotEnd = slotStart + LESSON_MS;

      // Strict overlap check:
      // A slot is invalid if it overlaps with ANY booking
      // Overlap formula: (SlotStart < BookingEnd) && (SlotEnd > BookingStart)
      const hasConflict = bookings.some(
        (b) => slotStart < b.end && slotEnd > b.start
      );

      return !hasConflict;
    })
    .map((slot) => serializeDateTime(slot));

  const payload: SlotResponse = {
    date: date.toISODate()!,
    timezone: COACH_TIMEZONE,
    slots: availableSlots,
  };

  return NextResponse.json(payload);
}
