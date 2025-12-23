"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DateTime } from "luxon";

import { COACH_TIMEZONE } from "@/lib/time";
import type { StudentType } from "@/types";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ScheduleGrid } from "@/components/admin/ScheduleGrid";
import { TEAM_MEMBERS } from "@/lib/constants";
import { BookingModal } from "@/components/BookingModal";
import { BookingConfirmation } from "@/components/booking/BookingConfirmation";
import { LoadingBall } from "@/components/LoadingBall";
import { MobileDatePicker } from "@/components/MobileDatePicker";

type AdminBooking = {
  id: string;
  start_time: string;
  end_time: string;
  student_name: string;
  student_type: StudentType;
  group_size: number;
  contact_phone: string;
  contact_email?: string | null;
};

export default function StudentBookingPage() {
  const now = useMemo(() => DateTime.now().setZone(COACH_TIMEZONE), []);

  const maxDate = useMemo(() => now.startOf("day").plus({ days: 30 }), [now]);
  const maxStartDate = useMemo(() => maxDate.minus({ days: 6 }), [maxDate]);

  const [currentDate, setCurrentDate] = useState(now);

  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedSlot, setSelectedSlot] = useState<DateTime | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('weekly');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileDatePickerOpen, setIsMobileDatePickerOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setViewMode('daily');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const displayedDays = useMemo(() => {
    const start = currentDate.startOf("day");
    if (viewMode === 'daily') {
      return [start];
    }
    // Weekly mode: start 7-day display from the currentDate
    return Array.from({ length: 7 }, (_, index) => start.plus({ days: index }));
  }, [viewMode, currentDate]);

  const handlePrevWindow = () => {
    const today = now.startOf("day");
    const diff = viewMode === 'daily' ? 1 : 7;
    let newDate = currentDate.minus({ days: diff });
    if (newDate < today) newDate = today;
    setCurrentDate(newDate);
  };

  const handleNextWindow = () => {
    const diff = viewMode === 'daily' ? 1 : 7;
    const limit = viewMode === 'daily' ? maxDate : maxStartDate;
    let newDate = currentDate.plus({ days: diff });
    if (newDate > limit) newDate = limit;
    setCurrentDate(newDate);
  };

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const startDay = displayedDays[0];
      const endDay = displayedDays[displayedDays.length - 1];
      const from = startDay.startOf('day').setZone(COACH_TIMEZONE).toISO();
      const to = endDay.endOf('day').setZone(COACH_TIMEZONE).toISO();
      if (!from || !to) return;
      const response = await fetch(`/api/bookings?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
      if (!response.ok) {
        setBookings([]);
        return;
      }
      const payload = await response.json();
      setBookings(payload.bookings ?? []);
    } catch (err) {
      console.error(err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [displayedDays]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const bookingsByDate = useMemo(() => {
    const map = new Map<string, AdminBooking[]>();
    displayedDays.forEach((day) => {
      const iso = day.toISODate();
      if (iso) map.set(iso, []);
    });
    bookings.forEach((booking) => {
      const start = DateTime.fromISO(booking.start_time).setZone(COACH_TIMEZONE);
      const key = start.toISODate();
      if (!key || !map.has(key)) return;
      map.get(key)!.push(booking);
    });
    return map;
  }, [bookings, displayedDays]);

  const handleSetToday = () => {
    const today = DateTime.now().setZone(COACH_TIMEZONE);
    setCurrentDate(today);
  };

  const teamMemberMap = useMemo(() => {
    const map: Record<string, typeof TEAM_MEMBERS[0]> = {};
    TEAM_MEMBERS.forEach(m => map[m.name] = m);
    return map;
  }, []);

  const handleSlotClick = (date: DateTime) => {
    if (date < now) return;
    const idx = bookings.findIndex(b => {
      const start = DateTime.fromISO(b.start_time).setZone(COACH_TIMEZONE);
      const end = DateTime.fromISO(b.end_time).setZone(COACH_TIMEZONE);
      return date >= start && date < end;
    });
    if (idx !== -1) return;
    setSelectedSlot(date);
  }

  const [lastBookingDetails, setLastBookingDetails] = useState<{ student_name: string; student_type: StudentType; group_size: number; contact_phone: string; contact_email: string } | null>(null);

  const handleBookingSuccess = (details: { student_name: string; student_type: StudentType; group_size: number; contact_phone: string; contact_email: string }) => {
    setLastBookingDetails(details);
    setShowSuccess(true);
    fetchBookings();
  };

  const isAtStart = currentDate.startOf("day") <= now.startOf("day");
  const isAtEnd = currentDate.startOf("day") >= (viewMode === 'daily' ? maxDate : maxStartDate);

  const handleDateSelect = (date: DateTime) => {
    const today = now.startOf('day');
    if (date < today) date = today;
    if (date > maxDate) date = maxDate;
    setCurrentDate(date);
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-[100dvh] bg-[#f8fafc] font-sans text-slate-900 overflow-hidden flex-col lg:flex-row selection:bg-[#dfff00] selection:text-black">
      <div className="hidden lg:block h-full border-r border-slate-200 bg-white">
        <AdminSidebar
          currentDate={currentDate}
          onDateSelect={handleDateSelect}
        />
      </div>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 lg:hidden backdrop-blur-md transition-opacity" onClick={() => setIsSidebarOpen(false)}>
          <div className="absolute left-0 top-0 bottom-0 w-[320px] bg-white shadow-2xl overflow-y-auto" onClick={e => e.stopPropagation()}>
            <AdminSidebar
              currentDate={currentDate}
              onDateSelect={handleDateSelect}
            />
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col min-w-0 bg-white lg:m-4 lg:rounded-[2.5rem] border-0 lg:border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden relative h-full">
        <AdminHeader
          currentDate={displayedDays[0]}
          onSetToday={handleSetToday}
          onRefresh={fetchBookings}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onToggleSidebar={() => setIsSidebarOpen(true)}
          onDateClick={() => setIsMobileDatePickerOpen(true)}
        />


        {showSuccess ? (
          <div className="flex-1 overflow-y-auto bg-slate-50/30">
            <BookingConfirmation
              slot={selectedSlot?.toISO() || ""}
              details={lastBookingDetails!}
              onBookAnother={() => {
                setShowSuccess(false);
                setSelectedSlot(null);
                setLastBookingDetails(null);
              }}
            />
          </div>
        ) : (
          <div className="flex-1 relative flex flex-col overflow-hidden">
            {loading && (
              <div className="absolute inset-0 bg-white/60 z-30 flex items-center justify-center pointer-events-none backdrop-blur-[2px]">
                <LoadingBall />
              </div>
            )}

            <div className="flex-1 overflow-hidden flex flex-col">
              {error ? (
                <div className="flex-1 flex items-center justify-center p-10">
                  <div className="bg-red-50 text-red-500 px-8 py-6 rounded-[2rem] border border-red-100 font-black uppercase tracking-widest text-xs text-center flex flex-col gap-2">
                    <p>System Error</p>
                    <p className="opacity-60">{error}</p>
                  </div>
                </div>
              ) : (
                <ScheduleGrid
                  weekDays={displayedDays}
                  bookingsByDate={bookingsByDate}
                  coachTimezone={COACH_TIMEZONE}
                  teamMembers={teamMemberMap}
                  selectedDate={currentDate}
                  isPublic={true}
                  onSlotClick={handleSlotClick}
                  onPrevWindow={handlePrevWindow}
                  onNextWindow={handleNextWindow}
                  disablePrev={isAtStart}
                  disableNext={isAtEnd}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {selectedSlot && !showSuccess && (
        <BookingModal
          slot={selectedSlot.toISO() ?? ""}
          onClose={() => setSelectedSlot(null)}
          onSuccess={handleBookingSuccess}
        />
      )}

      <MobileDatePicker
        isOpen={isMobileDatePickerOpen}
        onClose={() => setIsMobileDatePickerOpen(false)}
        currentDate={currentDate}
        onDateSelect={(date) => {
          handleDateSelect(date);
          setIsMobileDatePickerOpen(false);
        }}
      />
    </div>
  );
}
