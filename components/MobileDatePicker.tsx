"use client";

import React, { useEffect, useState } from "react";
import { DateTime } from "luxon";
import { X } from "lucide-react";
import { CalendarWidget } from "./admin/CalendarWidget";

type MobileDatePickerProps = {
    isOpen: boolean;
    onClose: () => void;
    currentDate: DateTime;
    onDateSelect: (date: DateTime) => void;
};

export function MobileDatePicker({
    isOpen,
    onClose,
    currentDate,
    onDateSelect,
}: MobileDatePickerProps) {
    const [viewDate, setViewDate] = useState(currentDate);

    // Prevent body scroll when open
    useEffect(() => {
        if (isOpen) {
            setViewDate(currentDate);
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen, currentDate]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] lg:hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Bottom Sheet */}
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-300">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div className="w-10 h-1 rounded-full bg-slate-200 absolute left-1/2 -translate-x-1/2 top-4" />
                    <h3 className="text-lg font-black uppercase italic tracking-tighter text-[#184a8e] mt-2">Select Date</h3>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors mt-2"
                    >
                        <X size={20} strokeWidth={2.5} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <CalendarWidget
                        currentDate={currentDate}
                        viewDate={viewDate}
                        onViewDateChange={setViewDate}
                        onDateSelect={(date) => {
                            onDateSelect(date);
                            onClose();
                        }}
                        allowPast={false}
                    />
                </div>

                <div className="p-6 pt-0">
                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black uppercase tracking-widest rounded-2xl transition-all"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
