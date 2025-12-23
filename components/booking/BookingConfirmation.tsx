import { DateTime } from "luxon";
import { COACH_TIMEZONE } from "@/lib/time";
import { Calendar, ArrowRight, Info, CheckCircle2, MapPin, User, Users, Phone, Mail } from "lucide-react";

type BookingConfirmationProps = {
    slot: string; // ISO string
    details?: {
        student_name: string;
        student_type: string;
        group_size: number;
        contact_phone: string;
        contact_email?: string;
    };
    onBookAnother: () => void;
};

export function BookingConfirmation({ slot, details, onBookAnother }: BookingConfirmationProps) {
    const date = DateTime.fromISO(slot).setZone(COACH_TIMEZONE);

    // Mock coach name or get it from props if dynamic
    const coachName = "Tennis Coaching";

    // Calculate end time
    const endTime = date.plus({ minutes: 60 });

    const handleAddToCalendar = () => {
        const startStr = date.toFormat("yyyyMMdd'T'HHmmss");
        const endStr = endTime.toFormat("yyyyMMdd'T'HHmmss");
        const title = encodeURIComponent("Tennis Lesson");
        const detailsText = encodeURIComponent(`Tennis Lesson with ${coachName}\nStudent: ${details?.student_name}\nPhone: ${details?.contact_phone}`);
        const location = encodeURIComponent("Hobart Tennis Centre");

        const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${detailsText}&location=${location}&sf=true&output=xml`;
        window.open(url, "_blank");
    };

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto px-4 py-6 sm:py-12 animate-in fade-in slide-in-from-top-8 duration-1000 ease-out relative">
            <button
                onClick={onBookAnother}
                className="absolute top-3 sm:top-8 left-4 md:left-0 p-2 sm:p-3 text-slate-400 hover:text-[#2f6bb0] transition-all rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 group flex items-center gap-2"
                aria-label="Back to Schedule"
            >
                <ArrowRight size={20} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden sm:inline">Back to Court</span>
            </button>

            <div className="mb-4 sm:mb-8 relative">
                <div className="relative w-14 h-14 sm:w-20 sm:h-20 bg-[#dfff00] rounded-2xl shadow-md flex items-center justify-center animate-in zoom-in duration-700 border-2 border-white rotate-6">
                    <CheckCircle2 className="text-[#184a8e] w-8 h-8 sm:w-10 sm:h-10" />
                </div>
            </div>

            <div className="text-center space-y-2 sm:space-y-3 mb-6 sm:mb-10">
                <h1 className="text-2xl sm:text-4xl font-semibold text-[#184a8e] tracking-tight leading-tight">
                    Session <span className="text-[#417d4d]">secured</span>
                </h1>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-[0_24px_48px_-16px_rgba(30,41,59,0.12)] w-full overflow-hidden relative group">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#2f6bb0] via-[#dfff00] to-[#417d4d]" />
                <div className="absolute -bottom-24 -right-24 w-52 h-52 bg-[#dfff00]/5 blur-[80px] rounded-full group-hover:bg-[#dfff00]/10 transition-colors" />

                <div className="p-6 sm:p-10 relative z-10">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 sm:pb-8 border-b border-slate-100">
                        <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-500">
                            <span className="text-[9px] font-semibold text-[#2f6bb0] mb-1 tracking-wide">
                                {date.toFormat("MMM")}
                            </span>
                            <span className="text-2xl sm:text-3xl font-semibold text-[#184a8e] leading-none">
                                {date.toFormat("dd")}
                            </span>
                            <span className="text-[9px] font-semibold text-slate-400 mt-1 tracking-wide leading-none">
                                {date.toFormat("ccc")}
                            </span>
                        </div>

                        <div className="flex-1 space-y-3 text-center sm:text-left">
                            <div className="space-y-1">
                                <h2 className="text-xl sm:text-2xl font-semibold text-[#184a8e] leading-tight tracking-tight">
                                    {date.toFormat("h:mm a")} — {endTime.toFormat("h:mm a")}
                                </h2>
                                <p className="text-[#2f6bb0] font-semibold tracking-wide text-[10px]">
                                    Coach Yeoh • Hobart Tennis Centre
                                </p>
                            </div>

                            <div className="inline-flex items-center gap-2 text-[10px] font-semibold text-slate-400 bg-slate-50 py-2 px-4 rounded-full border border-slate-100 tracking-wide">
                                <MapPin size={12} className="text-[#417d4d]" />
                                <span>Court Booking Confirmed</span>
                            </div>
                        </div>
                    </div>

                    {details && (
                        <div className="grid grid-cols-2 gap-4 sm:gap-6 py-6 sm:py-8">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-[9px] font-semibold text-slate-400 tracking-wide">
                                    <User size={12} className="text-[#2f6bb0]" /> Student Alias
                                </div>
                                <div className="text-[#184a8e] font-semibold text-sm sm:text-lg tracking-tight truncate">
                                    {details.student_name}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-[9px] font-semibold text-slate-400 tracking-wide">
                                    <Users size={12} className="text-[#417d4d]" /> Squad Size
                                </div>
                                <div className="text-[#184a8e] font-semibold text-sm sm:text-lg flex items-center gap-2">
                                    {details.group_size} <span className="text-slate-200">/</span> <span className="text-[10px] font-semibold bg-[#dfff00] text-black px-2 py-0.5 rounded-md">{details?.student_type === 'kid' ? 'Junior' : 'Adult'}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-[9px] font-semibold text-slate-400 tracking-wide">
                                    <Phone size={12} className="text-[#2f6bb0]" /> Direct Line
                                </div>
                                <div className="text-[#184a8e] font-semibold text-sm sm:text-lg tracking-tight">
                                    {details.contact_phone}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-[9px] font-semibold text-slate-400 tracking-wide">
                                    <Mail size={12} className="text-[#417d4d]" /> Receipt
                                </div>
                                <div className="text-[#184a8e] font-semibold text-xs sm:text-sm truncate tracking-tight opacity-60">
                                    {details.contact_email || "Not Provided"}
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleAddToCalendar}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border border-slate-200 bg-white text-[#184a8e] font-semibold tracking-wide hover:bg-[#184a8e] hover:text-white transition-all text-[10px] group shadow-md shadow-slate-200/50 active:scale-[0.98]"
                    >
                        <Calendar size={20} className="text-[#2f6bb0] group-hover:text-[#dfff00] group-hover:scale-110 transition-all" />
                        Sync to My Schedule
                    </button>
                </div>
            </div>

            <div className="mt-6 sm:mt-10 flex flex-col items-center gap-6 w-full">
                <div className="hidden sm:flex gap-4 p-6 bg-blue-50/50 rounded-[2.5rem] border border-blue-100 shadow-inner max-w-lg">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg border border-blue-100">
                        <Info className="text-[#2f6bb0]" size={20} />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-semibold tracking-wide text-[#184a8e]">Important Notice</p>
                        <p className="text-xs text-[#2f6bb0] font-semibold leading-relaxed">
                            Rescheduling requires 24h notice. No-shows or late cancellations will incur the full session fee.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
                    <button
                        onClick={onBookAnother}
                        className="px-8 py-4 sm:px-12 sm:py-6 bg-[#2f6bb0] hover:bg-[#184a8e] text-white font-semibold tracking-wide rounded-full transition-all shadow-lg hover:shadow-[#2f6bb0]/30 flex items-center gap-3 justify-center text-[11px] sm:text-xs group active:scale-95"
                    >
                        New Booking
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
}
