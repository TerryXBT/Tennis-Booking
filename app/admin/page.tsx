"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DateTime } from "luxon";
import { CheckCircle } from "lucide-react";

import { COACH_TIMEZONE } from "@/lib/time";
import type { StudentType } from "@/types";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ScheduleGrid } from "@/components/admin/ScheduleGrid";
import { AdminBookingModal } from "@/components/admin/AdminBookingModal";
import { LoadingBall } from "@/components/LoadingBall";

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

import { TEAM_MEMBERS } from "@/lib/constants";


import { MobileDatePicker } from "@/components/admin/MobileDatePicker";

export default function AdminPage() {
  const now = DateTime.now().setZone(COACH_TIMEZONE);
  const [currentDate, setCurrentDate] = useState(now);

  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedSlot, setSelectedSlot] = useState<DateTime | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastAction, setLastAction] = useState<"create" | "update" | "delete" | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobilePickerOpen, setIsMobilePickerOpen] = useState(false);


  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('weekly');

  // Enforce Daily view on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) { // lg breakpoint
        setViewMode('daily');
      }
    };

    // Initial check
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

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const startDay = displayedDays[0];
      const endDay = displayedDays[displayedDays.length - 1];

      const from = startDay.startOf('day').setZone(COACH_TIMEZONE).toISO();
      const to = endDay.endOf('day').setZone(COACH_TIMEZONE).toISO();

      if (!from || !to) return;

      const response = await fetch(`/api/bookings?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, {
        cache: "no-store",
      });
      if (!response.ok) {
        console.warn("API Error, defaulting to empty schedule");
        setBookings([]);
        return;
      }

      const payload = await response.json();
      setBookings(payload.bookings ?? []);
    } catch (err) {
      console.error(err);
      setError("Could not load schedule. Please check your connection or API configuration.");
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

  const handleDateSelect = (date: DateTime) => {
    setCurrentDate(date);
    setIsSidebarOpen(false);
  };

  // Mobile specific handler (date picker)
  const handleMobileDateSelect = (date: DateTime) => {
    handleDateSelect(date);
    // Picker will close automatically via component prop, or we can explicit close if needed
  };

  const handleSetToday = () => {
    const today = DateTime.now().setZone(COACH_TIMEZONE);
    setCurrentDate(today);
  };

  const handleSlotClick = (date: DateTime) => {
    if (date < now) return;
    const idx = bookings.findIndex(b => {
      const start = DateTime.fromISO(b.start_time).setZone(COACH_TIMEZONE);
      const end = DateTime.fromISO(b.end_time).setZone(COACH_TIMEZONE);
      return date >= start && date < end;
    });
    if (idx !== -1) return;
    setSelectedSlot(date);
    setSelectedBooking(null);
  };

  const handleBookingClick = (booking: AdminBooking) => {
    setSelectedBooking(booking);
    setSelectedSlot(null);
  };

  const handleBookingSuccess = (action?: "create" | "update" | "delete", bookingId?: string) => {
    if (action === "delete" && bookingId) {
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    }
    setSelectedSlot(null);
    setSelectedBooking(null);
    setLastAction(action || "update");
    setShowSuccess(true);
    fetchBookings();
    setTimeout(() => setShowSuccess(false), 5000);
  };

  const handlePrevWindow = () => {
    const diff = viewMode === 'daily' ? 1 : 7;
    const newDate = currentDate.minus({ days: diff });
    setCurrentDate(newDate);
  };

  const handleNextWindow = () => {
    const diff = viewMode === 'daily' ? 1 : 7;
    const newDate = currentDate.plus({ days: diff });
    setCurrentDate(newDate);
  };

  const teamMemberMap = useMemo(() => {
    const map: Record<string, typeof TEAM_MEMBERS[0]> = {};
    TEAM_MEMBERS.forEach(m => map[m.name] = m);
    return map;
  }, []);

  return (
    <div className="flex h-[100dvh] bg-[#f8fafc] font-sans text-slate-900 overflow-hidden flex-col lg:flex-row">
      <div className="hidden lg:block h-full border-r border-slate-200 bg-white">
        <AdminSidebar
          currentDate={currentDate}
          onDateSelect={handleDateSelect}
          teamMembers={TEAM_MEMBERS}
          allowPast={true}
        />
      </div>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 lg:hidden backdrop-blur-md transition-opacity" onClick={() => setIsSidebarOpen(false)}>
          <div className="absolute left-0 top-0 bottom-0 w-[320px] bg-white shadow-2xl overflow-y-auto" onClick={e => e.stopPropagation()}>
            <AdminSidebar
              currentDate={currentDate}
              onDateSelect={handleDateSelect}
              teamMembers={TEAM_MEMBERS}
              allowPast={true}
            />
          </div>
        </div>
      )}

      {/* Mobile Date Picker Bottom Sheet */}
      <MobileDatePicker
        isOpen={isMobilePickerOpen}
        onClose={() => setIsMobilePickerOpen(false)}
        selectedDate={currentDate}
        onDateSelect={handleMobileDateSelect}
      />

      <main className="flex-1 flex flex-col min-w-0 bg-white lg:m-4 lg:rounded-[2.5rem] border-0 lg:border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden relative h-full">
        <AdminHeader
          currentDate={currentDate}
          onSetToday={handleSetToday}
          onRefresh={fetchBookings}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onToggleSidebar={() => setIsSidebarOpen(true)}
          onDateClick={() => setIsMobilePickerOpen(true)}
        />

        {loading && (
          <div className="absolute inset-0 bg-white/60 z-30 flex items-center justify-center pointer-events-none backdrop-blur-[2px]">
            <LoadingBall />
          </div>
        )}

        {showSuccess && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 bg-[#417d4d] text-white px-8 py-5 rounded-[2rem] shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-6 duration-500 w-[90%] sm:w-auto border-4 border-white">
            <div className="bg-white/20 p-2 rounded-2xl hidden sm:block">
              <CheckCircle size={32} />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-xl font-black uppercase italic leading-tight tracking-tighter">
                {lastAction === "delete" ? "Deleted!" : lastAction === "create" ? "Created!" : "Updated!"}
              </h3>
              <p className="text-green-50 text-[10px] font-black uppercase tracking-widest leading-none">
                {lastAction === "delete" ? "Booking removed from schedule." : "Schedule session sync complete."}
              </p>
            </div>
          </div>
        )}

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
            onPrevWindow={handlePrevWindow}
            onNextWindow={handleNextWindow}
            disablePrev={false}
            disableNext={false}
            onSlotClick={handleSlotClick}
            onBookingClick={handleBookingClick}
          />
        )}
      </main>

      {(selectedSlot || selectedBooking) && (
        <AdminBookingModal
          slot={selectedSlot?.toISO() ?? undefined}
          booking={selectedBooking ?? undefined}
          onClose={() => {
            setSelectedSlot(null);
            setSelectedBooking(null);
          }}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
}
