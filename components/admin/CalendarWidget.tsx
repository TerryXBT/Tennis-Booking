import { ChevronLeft, ChevronRight } from "lucide-react";
import { DateTime } from "luxon";
import { useMemo } from "react";
import { COACH_TIMEZONE, MAX_BOOKING_DAYS } from "@/lib/time";

type CalendarWidgetProps = {
    currentDate: DateTime;
    onDateSelect: (date: DateTime) => void;
    allowPast?: boolean;
    className?: string; // Allow custom styling wrapper
    viewDate?: DateTime; // Optional: separate view date for browsing without selecting
    onViewDateChange?: (date: DateTime) => void;
};

export function CalendarWidget({
    currentDate,
    onDateSelect,
    allowPast = false,
    className = "",
    viewDate,
    onViewDateChange
}: CalendarWidgetProps) {
    // Use viewDate if provided, otherwise fallback to currentDate
    const displayDate = viewDate || currentDate;

    const calendarDays = useMemo(() => {
        const startOfMonth = displayDate.startOf("month");
        const startOfWeek = startOfMonth.minus({ days: startOfMonth.weekday - 1 }); // Start on Mon
        // 6 weeks * 7 days = 42
        return Array.from({ length: 42 }, (_, i) => startOfWeek.plus({ days: i }));
    }, [displayDate]);

    // Calculate today and max date for restriction
    const today = DateTime.now().setZone(COACH_TIMEZONE).startOf("day");
    const maxDate = today.plus({ days: MAX_BOOKING_DAYS });

    const handleMonthChange = (offset: number) => {
        const newDate = displayDate.plus({ months: offset });
        if (onViewDateChange) {
            onViewDateChange(newDate);
        } else {
            onDateSelect(newDate);
        }
    };

    return (
        <div className={className}>
            <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="font-semibold text-slate-900 text-lg tracking-tight">
                    {displayDate.toFormat("MMMM yyyy")}
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => handleMonthChange(-1)}
                        disabled={!allowPast && displayDate.hasSame(today, 'month')}
                        className="p-2 hover:bg-slate-100 rounded-xl text-slate-900 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronLeft size={20} strokeWidth={3} />
                    </button>
                    <button
                        onClick={() => handleMonthChange(1)}
                        disabled={displayDate.hasSame(today.plus({ months: 1 }), 'month')}
                        // Note: If using strict MAX_BOOKING_DAYS logic, might want to check against maxDate month too
                        className="p-2 hover:bg-slate-100 rounded-xl text-slate-900 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronRight size={20} strokeWidth={3} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[11px] tracking-wide text-slate-400 mb-4 font-semibold">
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
                <div>Sun</div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-sm">
                {calendarDays.map((date) => {
                    const isCurrentMonth = date.hasSame(displayDate, "month");
                    const isSelected = date.hasSame(currentDate, "day");
                    const isToday = date.hasSame(today, "day");

                    const isBeforeToday = date < today;
                    const isAfterMax = date > maxDate;
                    const isDisabled = (!allowPast && isBeforeToday) || isAfterMax;

                    if (!isCurrentMonth) {
                        return <div key={date.toString()} className="h-10 w-10" />;
                    }

                    return (
                        <button
                            key={date.toString()}
                            disabled={isDisabled}
                            onClick={() => onDateSelect(date)}
                            title={isDisabled ? `Bookings are only allowed within the next ${MAX_BOOKING_DAYS} days` : undefined}
                            className={`
                                h-10 w-10 rounded-xl flex flex-col items-center justify-center text-xs font-medium transition-all relative
                                ${isDisabled ? "text-slate-200 cursor-not-allowed" : "text-slate-600 hover:bg-blue-50 hover:text-[#2f6bb0]"}
                                ${isSelected ? "!bg-[#2f6bb0] !text-white shadow-md hover:!bg-[#184a8e]" : ""}
                                ${isToday && !isSelected ? "bg-blue-100/50" : ""}
                            `}
                        >
                            <span className="relative z-10">{date.day}</span>
                            {isToday && (
                                <div className={`absolute bottom-1 w-1 h-1 rounded-full z-20 ${isSelected ? "bg-white" : "bg-[#2f6bb0] animate-pulse"}`} />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
