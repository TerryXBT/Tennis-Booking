import { NextRequest, NextResponse } from "next/server";
import { DateTime } from "luxon";

import { COACH_ID, supabaseClient } from "@/lib/supabaseClient";
import { COACH_TIMEZONE, LESSON_DURATION_MINUTES, MAX_GROUP_SIZE } from "@/lib/time";
import type { BookingInput } from "@/types";

const jsonError = (error: string, status = 400) =>
  NextResponse.json({ error }, { status });

const sanitizeString = (value?: unknown) =>
  typeof value === "string" ? value.trim() : "";

const isValidStudentType = (value: unknown): value is BookingInput["student_type"] =>
  value === "kid" || value === "adult";

export async function POST(request: NextRequest) {
  let payload: Partial<BookingInput> = {};
  try {
    payload = await request.json();
  } catch (error) {
    console.error("POST /api/bookings", error);
    return jsonError("Invalid request body");
  }

  const errors: Record<string, string> = {};
  const studentName = sanitizeString(payload.student_name);
  const contactPhone = sanitizeString(payload.contact_phone);
  const contactEmail = sanitizeString(payload.contact_email ?? undefined) || null;
  const studentType = payload.student_type;
  const groupSize = payload.group_size;
  const startTimeInput = payload.start_time;

  if (!studentName) errors.student_name = "Student name is required";
  if (!isValidStudentType(studentType))
    errors.student_type = "Student type must be 'kid' or 'adult'";
  if (!Number.isInteger(groupSize) || (groupSize ?? 0) < 1 || (groupSize ?? 0) > MAX_GROUP_SIZE)
    errors.group_size = `Group size must be between 1 and ${MAX_GROUP_SIZE}`;
  if (!contactPhone) errors.contact_phone = "Phone number is required";
  if (!startTimeInput) errors.start_time = "Start time is required";

  const startDateTime = startTimeInput
    ? DateTime.fromISO(startTimeInput, { setZone: true }).setZone(COACH_TIMEZONE)
    : null;

  if (startTimeInput && (!startDateTime || !startDateTime.isValid)) {
    errors.start_time = "Start time is invalid";
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const normalizedStart = startDateTime!;
  const endDateTime = normalizedStart.plus({ minutes: LESSON_DURATION_MINUTES });

  const startIsoUtc = normalizedStart.toUTC().toISO({ suppressMilliseconds: true });
  const endIsoUtc = endDateTime.toUTC().toISO({ suppressMilliseconds: true });

  // Conflict Check: Overlap Logic
  // A booking overlaps if (ExistingStart < NewEnd) AND (ExistingEnd > NewStart)
  const { data: conflict, error: conflictError } = await supabaseClient
    .from("booking")
    .select("id")
    .eq("coach_id", COACH_ID)
    .eq("status", "confirmed")
    .lt("start_time", endIsoUtc)
    .gt("end_time", startIsoUtc)
    .limit(1);

  if (conflictError) {
    console.error("Conflict check failed", conflictError);
    return jsonError("Unable to create booking", 500);
  }

  if (conflict && conflict.length > 0) {
    return NextResponse.json({ error: "Time conflict with an existing booking" }, { status: 409 });
  }

  const { data, error } = await supabaseClient
    .from("booking")
    .insert({
      coach_id: COACH_ID,
      student_name: studentName,
      student_type: studentType,
      group_size: groupSize,
      contact_phone: contactPhone,
      contact_email: contactEmail,
      start_time: startIsoUtc,
      end_time: endIsoUtc,
      status: "confirmed",
    })
    .select("id, start_time, end_time, student_name, student_type, group_size")
    .single();

  if (error) {
    console.error("Insert booking failed:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    // Better user-facing error message for common constraints
    if (error.code === "23514") { // CHECK constraint violation
      return jsonError("Booking limit exceeded (Group size or student type constraint)", 400);
    }

    return jsonError("Unable to create booking", 500);
  }

  const responsePayload = {
    ...data,
    start_time: DateTime.fromISO(data.start_time).setZone(COACH_TIMEZONE).toISO({
      suppressMilliseconds: true,
    }),
    end_time: DateTime.fromISO(data.end_time).setZone(COACH_TIMEZONE).toISO({
      suppressMilliseconds: true,
    }),
  };

  return NextResponse.json(responsePayload, { status: 201 });
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  const now = DateTime.now().setZone(COACH_TIMEZONE);
  const from = fromParam
    ? DateTime.fromISO(fromParam, { setZone: true }).setZone(COACH_TIMEZONE)
    : now;
  const to = toParam
    ? DateTime.fromISO(toParam, { setZone: true }).setZone(COACH_TIMEZONE)
    : now.plus({ days: 7 });

  if (!from.isValid || !to.isValid) {
    return jsonError("Invalid date range");
  }

  if (to <= from) {
    return jsonError("'to' must be after 'from'");
  }

  const fromUtc = from.toUTC().toISO({ suppressMilliseconds: true });
  const toUtc = to.toUTC().toISO({ suppressMilliseconds: true });

  const { data, error } = await supabaseClient
    .from("booking")
    .select(
      "id, start_time, end_time, student_name, student_type, group_size, contact_phone, contact_email"
    )
    .eq("coach_id", COACH_ID)
    .eq("status", "confirmed")
    .gte("start_time", fromUtc)
    .lt("start_time", toUtc)
    .order("start_time", { ascending: true });

  if (error) {
    console.error("GET /api/bookings", error);
    return jsonError("Unable to load bookings", 500);
  }

  const bookings = (data ?? []).map((booking) => ({
    ...booking,
    start_time: DateTime.fromISO(booking.start_time)
      .setZone(COACH_TIMEZONE)
      .toISO({ suppressMilliseconds: true }),
    end_time: DateTime.fromISO(booking.end_time)
      .setZone(COACH_TIMEZONE)
      .toISO({ suppressMilliseconds: true }),
  }));

  return NextResponse.json({ bookings });
}
