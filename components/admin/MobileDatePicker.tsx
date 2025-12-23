import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { CalendarWidget } from "./CalendarWidget";

type MobileDatePickerProps = {
    isOpen: boolean;
    onClose: () => void;
    selectedDate: DateTime;
    onDateSelect: (date: DateTime) => void;
};

export function MobileDatePicker({ isOpen, onClose, selectedDate, onDateSelect }: MobileDatePickerProps) {
    const [viewDate, setViewDate] = useState(selectedDate);
    const [shouldRender, setShouldRender] = useState(false);

    // Handle mounting/unmounting animation
    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            setViewDate(selectedDate);
            document.body.style.overflow = "hidden";
        } else {
            const timer = setTimeout(() => setShouldRender(false), 300); // Match transition duration
            document.body.style.overflow = "";
            return () => clearTimeout(timer);
        }
    }, [isOpen, selectedDate]);

    if (!shouldRender) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex items-end justify-center transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Bottom Sheet */}
            <div
                className={`
                bg-white w-full max-w-md rounded-t-[2rem] p-6 shadow-2xl transform transition-transform duration-300 ease-out z-10
                ${isOpen ? "translate-y-0" : "translate-y-full"}
            `}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-2 px-2">
                    <span className="text-xs font-black uppercase tracking-widest text-[#184a8e]/60">Select Date</span>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-full active:bg-slate-100 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <CalendarWidget
                    currentDate={selectedDate}
                    viewDate={viewDate}
                    onViewDateChange={setViewDate}
                    onDateSelect={(date) => {
                        onDateSelect(date);
                        onClose();
                    }}
                    className="w-full"
                />

                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-center">
                    <div className="w-16 h-1.5 bg-slate-200 rounded-full" />
                </div>
            </div>
        </div>
    );
}
