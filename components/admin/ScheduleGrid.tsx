import { DateTime } from "luxon";
import type { StudentType } from "@/types";
import { BUSINESS_HOURS, MAX_BOOKING_DAYS } from "@/lib/time";
import { ChevronLeft, ChevronRight } from "lucide-react";

type AdminBooking = {
    id: string;
    start_time: string;
    end_time: string;
    student_name: string;
    student_type: StudentType;
    group_size: number;
    contact_phone: string;
    contact_email?: string | null;
    coach_id?: string;
};

type ScheduleGridProps = {
    weekDays: DateTime[];
    bookingsByDate: Map<string, AdminBooking[]>;
    coachTimezone: string;
    teamMembers: Record<string, { name: string; avatar: string }>;
    selectedDate?: DateTime;
    isPublic?: boolean;
    onSlotClick?: (date: DateTime) => void;
    // Window Navigation
    onPrevWindow?: () => void;
    onNextWindow?: () => void;
    disablePrev?: boolean;
    disableNext?: boolean;
    // Interaction
    onBookingClick?: (booking: AdminBooking) => void;
};

const SLOT_DURATION = 30; // minutes
const ROW_HEIGHT = 50; // Height for a 30-min slot
const HEADER_HEIGHT = 128; // Fixed height for alignment between time/day columns
const HOUR_START = BUSINESS_HOURS.START;
const HOUR_END = BUSINESS_HOURS.END;

export function ScheduleGrid({
    weekDays,
    bookingsByDate,
    coachTimezone,
    teamMembers,
    selectedDate,
    isPublic = false,
    onSlotClick,
    onPrevWindow,
    onNextWindow,
    disablePrev,
    disableNext,
    onBookingClick
}: ScheduleGridProps) {
    const hours = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);
    const intervals = hours.flatMap(h => [
        { hour: h, minute: 0 },
        { hour: h, minute: 30 }
    ]);
    const now = DateTime.now().setZone(coachTimezone);
    const nowMinutes = (now.hour - HOUR_START) * 60 + now.minute;
    const timeLineTop = (nowMinutes / SLOT_DURATION) * ROW_HEIGHT;
    const showTimeLineGlobal = now.hour >= HOUR_START && now.hour < HOUR_END;

    const getSlotStatus = (slotStart: DateTime, dayBookings: AdminBooking[]): string | null => {
        const slotEnd = slotStart.plus({ minutes: 60 });
        if (slotStart < now) return "Cannot book in the past";
        const daysDiff = slotStart.diff(now.startOf('day'), 'days').days;
        if (daysDiff > MAX_BOOKING_DAYS) return `Limit: ${MAX_BOOKING_DAYS} days`;

        const bEndLimit = slotStart.startOf('day').set({ hour: HOUR_END });
        if (slotEnd > bEndLimit) return `Closes at ${HOUR_END}:00`;

        const slotStartMs = slotStart.toMillis();
        const slotEndMs = slotEnd.toMillis();
        const hasConflict = dayBookings.some(b => {
            const bStart = DateTime.fromISO(b.start_time).setZone(coachTimezone).toMillis();
            const bEnd = DateTime.fromISO(b.end_time).setZone(coachTimezone).toMillis();
            return (slotStartMs < bEnd && slotEndMs > bStart);
        });

        if (hasConflict) return "Time conflict";
        return null;
    };

    const getTeamMember = (booking: AdminBooking) => {
        return booking.coach_id ? teamMembers[booking.coach_id] : undefined;
    };

    return (
        <div className="flex-1 overflow-hidden flex flex-col relative bg-white border-t border-slate-100">
            {/* Nav Controls Overlay (Floating) */}
            <div className="absolute top-9 left-0 right-0 z-50 pointer-events-none flex justify-between px-2">
                {onPrevWindow && (
                    <button
                        onClick={onPrevWindow}
                        disabled={disablePrev}
                        className="w-10 h-10 bg-white shadow-xl rounded-full flex items-center justify-center border border-slate-200 pointer-events-auto hover:bg-slate-50 disabled:opacity-0 transition-all active:scale-90"
                    >
                        <ChevronLeft size={20} className="text-[#2f6bb0]" />
                    </button>
                )}
                {onNextWindow && (
                    <button
                        onClick={onNextWindow}
                        disabled={disableNext}
                        className="w-10 h-10 bg-white shadow-xl rounded-full flex items-center justify-center border border-slate-200 pointer-events-auto hover:bg-slate-50 disabled:opacity-0 transition-all active:scale-90"
                    >
                        <ChevronRight size={20} className="text-[#2f6bb0]" />
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-auto bg-slate-50/30">
                <div className={`${weekDays.length > 1 ? 'min-w-[800px]' : 'min-w-full'} flex bg-white relative`}>

                    {/* Time Column (Sticky) */}
                    <div className="w-20 flex-shrink-0 sticky left-0 z-40 bg-slate-50/70 border-r border-slate-200 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
                        {/* Header Spacer */}
                        <div style={{ height: HEADER_HEIGHT }} className="border-b border-slate-200 flex items-end justify-center pb-4">
                        </div>
                        {intervals.map((it, i) => (
                            <div key={i} className={`relative ${it.minute === 30 ? 'border-b border-slate-200' : ''}`} style={{ height: ROW_HEIGHT }}>
                                {it.minute === 0 && (
                                    <span className="absolute -top-3 left-0 right-0 text-center text-[12px] font-semibold text-slate-600 tracking-wide leading-none tabular-nums">
                                        {DateTime.fromObject({ hour: it.hour }).toFormat("h a")}
                                    </span>
                                )}
                            </div>
                        ))}
                        {/* Final limit label */}
                        <div className="relative" style={{ height: ROW_HEIGHT }}>
                            <span className="absolute -top-3 left-0 right-0 text-center text-[12px] font-semibold text-slate-600 tracking-wide leading-none tabular-nums">
                                {DateTime.fromObject({ hour: HOUR_END }).toFormat("h a")}
                            </span>
                        </div>
                    </div>

                    {/* Day Columns */}
                    <div className="flex-1 flex divide-x divide-slate-200 border-r border-slate-200">
                        {weekDays.map((day, dIdx) => {
                            const isToday = day.hasSame(now, "day");
                            const isSelectedDay = selectedDate ? day.hasSame(selectedDate, "day") : false;
                            const isoDate = day.toISODate();
                            const dayBookings = isoDate ? bookingsByDate.get(isoDate) || [] : [];

                            return (
                                <div
                                    key={dIdx}
                                    className={`flex-1 flex flex-col relative min-w-[120px] ${isToday ? 'bg-slate-50' : ''} ${isSelectedDay && !isToday ? 'bg-blue-50/40' : ''}`}
                                >
                                    {/* Sticky Individual Day Header */}
                                    <div
                                        style={{ height: HEADER_HEIGHT }}
                                        className={`sticky top-0 z-30 bg-white border-b border-slate-200 flex flex-col items-center justify-center gap-2 ${isSelectedDay ? 'shadow-[inset_0_-2px_0_rgba(47,107,176,0.25)]' : ''}`}
                                    >
                                        <span
                                            className={`text-[11px] tracking-wide font-semibold transition-colors ${isSelectedDay ? 'text-[#184a8e]' : 'text-slate-400'}`}
                                        >
                                            {day.toFormat("cccc")}
                                        </span>
                                        <div className={`
                                            w-12 h-12 flex items-center justify-center font-semibold text-2xl transition-all
                                            ${isToday || isSelectedDay ? "text-[#184a8e] relative" : "text-slate-900"}
                                        `}>
                                            {day.day}
                                            {isToday && (
                                                <div className="absolute -bottom-1 left-2 right-2 h-1.5 bg-[#dfff00] rounded-full shadow-[0_0_8px_rgba(223,255,0,0.8)]" />
                                            )}
                                            {isSelectedDay && !isToday && (
                                                <div className="absolute -bottom-1 left-3 right-3 h-1 bg-blue-100 rounded-full" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Grid Body for this Day */}
                                    <div className="relative group/day">
                                        {/* Clickable Slots Grid */}
                                        <div className="flex flex-col">
                                            {intervals.map((it, i) => {
                                                const slotStart = day.set({ hour: it.hour, minute: it.minute, second: 0 });
                                                const status = getSlotStatus(slotStart, dayBookings);
                                                const isAvailable = !status;

                                                return (
                                                    <div
                                                        key={i}
                                                        onClick={() => isAvailable && onSlotClick?.(slotStart)}
                                                        className={`
                                                            w-full transition-all duration-150 cursor-pointer
                                                            ${it.minute === 30 ? 'border-b border-slate-200' : ''}
                                                            ${isAvailable ? "hover:bg-[#dfff00]/20 active:bg-[#dfff00]/40" : "cursor-not-allowed bg-slate-50/10"}
                                                        `}
                                                        style={{ height: ROW_HEIGHT }}
                                                    />
                                                );
                                            })}
                                        </div>

                                        {/* Current Time Indicator (Precise to Day) */}
                                        {isToday && showTimeLineGlobal && (
                                            <div
                                                className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
                                                style={{ top: timeLineTop }}
                                            >
                                                <div className="w-full h-0.5 bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]" />
                                                <div className="absolute -left-1 w-2.5 h-2.5 bg-red-500 rounded-full shadow-lg border-2 border-white" />
                                                <div className="absolute -right-1 w-2.5 h-2.5 bg-red-500 rounded-full shadow-lg border-2 border-white" />

                                                {/* Pulsing Dot */}
                                                <div className="absolute left-0 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping opacity-75" />
                                            </div>
                                        )}

                                        {/* Render Bookings */}
                                        {dayBookings.map(booking => {
                                            const bStart = DateTime.fromISO(booking.start_time).setZone(coachTimezone);
                                            const bEnd = DateTime.fromISO(booking.end_time).setZone(coachTimezone);

                                            const startMinutes = bStart.diff(bStart.startOf('day').set({ hour: HOUR_START }), 'minutes').minutes;
                                            const durationMinutes = bEnd.diff(bStart, 'minutes').minutes;

                                            const top = (startMinutes / SLOT_DURATION) * ROW_HEIGHT;
                                            const height = (durationMinutes / SLOT_DURATION) * ROW_HEIGHT;

                                            const member = getTeamMember(booking);

                                            return (
                                                <div
                                                    key={booking.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (!isPublic) onBookingClick?.(booking);
                                                    }}
                                                    className={`
                                                        absolute left-[2px] right-[2px] p-3 z-10 border-l-4
                                                        transition-all shadow-md group/booking overflow-hidden
                                                        flex flex-col gap-1
                                                        ${isPublic
                                                            ? "bg-slate-50 border-slate-200 text-slate-300 opacity-80 cursor-not-allowed"
                                                            : "bg-white border-[#2f6bb0] text-slate-900 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
                                                        }
                                                    `}
                                                    style={{ top, height }}
                                                >
                                                    <div className="text-[10px] font-semibold tracking-wide text-slate-400 tabular-nums">
                                                        {bStart.toFormat("H:mm")} - {bEnd.toFormat("H:mm")}
                                                    </div>
                                                    {isPublic ? (
                                                        <div className="text-[11px] font-semibold tracking-wide text-slate-500">
                                                            Booked
                                                        </div>
                                                    ) : (
                                                        <div className="font-semibold text-sm tracking-tight text-[#184a8e] truncate leading-none">
                                                            {booking.student_name}
                                                        </div>
                                                    )}
                                                    {!isPublic && member?.avatar && (
                                                        <div className="mt-auto flex items-center gap-2">
                                                            <div className="w-5 h-5 rounded-full bg-[#dfff00] flex items-center justify-center border border-black/5 overflow-hidden">
                                                                <img src={member.avatar} alt="" className="w-full h-full object-cover" />
                                                            </div>
                                                            <span className="text-[9px] font-black uppercase text-slate-400">{member.name}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
