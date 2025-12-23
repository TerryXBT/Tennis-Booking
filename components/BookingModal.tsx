import { useState, useEffect, useRef } from "react";
import { X, Calendar, User, Phone, Mail, ArrowRight, Trophy } from "lucide-react";
import { DateTime } from "luxon";
import { MAX_GROUP_SIZE } from "@/lib/time";
import type { StudentType } from "@/types";

type BookingModalProps = {
    slot: string; // ISO string
    onClose: () => void;
    onSuccess: (details: { student_name: string; student_type: StudentType; group_size: number; contact_phone: string; contact_email: string }) => void;
};

// Internal state separates UI fields from API fields
const initialFormState = {
    student_name: "",
    age_group: "kid" as StudentType, // Maps to student_type
    skill_level: "Beginner",
    group_size: 1,
    contact_phone: "",
    contact_email: "",
};

export function BookingModal({ slot, onClose, onSuccess }: BookingModalProps) {
    const [formValues, setFormValues] = useState(initialFormState);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const firstInputRef = useRef<HTMLInputElement>(null);
    const dt = DateTime.fromISO(slot);
    const endDt = dt.plus({ hours: 1 });

    // Focus trap and focus management
    useEffect(() => {
        const modal = document.getElementById("booking-modal");
        const focusableElements = modal?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements?.[0] as HTMLElement;
        const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (e.key === "Tab") {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement?.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement?.focus();
                    }
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        firstInputRef.current?.focus();

        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    const handleFieldChange = (field: keyof typeof initialFormState, value: string | number) => {
        setFormValues((prev) => ({ ...prev, [field]: value }));
        setFormErrors((prev) => ({ ...prev, [field]: "" }));
    };

    const validate = () => {
        const errors: Record<string, string> = {};
        if (!formValues.student_name.trim()) errors.student_name = "Required";

        const cleanedPhone = formValues.contact_phone.replace(/\s+/g, '').replace(/-/g, '');
        const phoneRegex = /^0?4\d{8}$/;
        if (!formValues.contact_phone.trim()) {
            errors.contact_phone = "Required";
        } else if (!phoneRegex.test(cleanedPhone)) {
            errors.contact_phone = "Invalid Australian mobile (04xx xxx xxx)";
        }

        if (formValues.group_size < 1 || formValues.group_size > MAX_GROUP_SIZE) errors.group_size = `1-${MAX_GROUP_SIZE} people`;
        return errors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errors = validate();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setSubmitting(true);
        setSubmitError(null);

        // Append skill level to name so coach sees it in the calendar
        const finalStudentName = `${formValues.student_name.trim()} (${formValues.skill_level})`;

        try {
            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    student_name: finalStudentName,
                    student_type: formValues.age_group,
                    group_size: formValues.group_size,
                    contact_phone: formValues.contact_phone,
                    contact_email: formValues.contact_email,
                    start_time: slot,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                setSubmitError(data.error || "Booking failed");
                return;
            }

            // Return the form values as they were (or updated) for the success message
            onSuccess({
                ...formValues,
                student_name: finalStudentName,
                student_type: formValues.age_group
            });
        } catch (err) {
            console.error(err);
            setSubmitError("Network error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-8">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />

            <div
                id="booking-modal"
                className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-8 duration-500 ease-out border border-slate-200 flex flex-col max-h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#2f6bb0] via-[#dfff00] to-[#417d4d] shrink-0" />

                <div className="p-6 md:p-10 overflow-y-auto custom-scrollbar">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-[#2f6bb0] text-[11px] font-semibold tracking-wide mb-3">
                                <Calendar size={12} />
                                New booking
                            </div>
                            <h2 className="text-2xl md:text-3xl font-semibold text-[#184a8e] tracking-tight leading-tight">
                                Confirm your <span className="text-[#417d4d]">booking</span>
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100 flex items-center justify-between mb-6 shadow-inner">
                        <div className="flex items-center gap-4">
                            <div>
                                <p className="text-[11px] font-semibold text-slate-500 tracking-wide leading-none mb-1.5">Time slot</p>
                                <p className="text-base md:text-lg font-semibold text-[#184a8e]">
                                    {dt.toFormat("cccc, d MMMM")}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[11px] font-semibold text-slate-500 tracking-wide leading-none mb-1.5">Duration</p>
                            <p className="text-base md:text-lg font-semibold text-[#2f6bb0]">
                                {dt.toFormat("h:mm a")} to {endDt.toFormat("h:mm a")}
                            </p>
                        </div>
                    </div>

                    <form className="space-y-3.5" onSubmit={handleSubmit}>
                        {/* Name & Age */}
                        <div className="grid grid-cols-2 gap-3.5">
                            <div className="space-y-1.5">
                                <label className="text-[11px] tracking-wide text-slate-500 ml-4 font-semibold">Student name</label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                                    <input
                                        ref={firstInputRef}
                                        className={`w-full bg-slate-50 border ${formErrors.student_name ? 'border-red-400' : 'border-slate-200'} rounded-xl pl-10 pr-4 py-3 outline-none focus:border-[#2f6bb0] focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-900 font-bold placeholder:text-slate-300 text-sm md:text-base`}
                                        placeholder="Name"
                                        value={formValues.student_name}
                                        onChange={(e) => handleFieldChange("student_name", e.target.value)}
                                    />
                                </div>
                                {formErrors.student_name && <p className="text-[9px] text-red-500 font-bold uppercase tracking-wider ml-4">{formErrors.student_name}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] tracking-wide text-slate-500 ml-4 font-semibold">Age group</label>
                                <select
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#2f6bb0] focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-900 font-bold appearance-none cursor-pointer text-sm md:text-base"
                                    value={formValues.age_group}
                                    onChange={(e) => handleFieldChange("age_group", e.target.value as StudentType)}
                                >
                                    <option value="kid">Junior (U18)</option>
                                    <option value="adult">Adult (18+)</option>
                                </select>
                            </div>
                        </div>

                        {/* Phone & Size */}
                        <div className="grid grid-cols-2 gap-3.5">
                            <div className="space-y-1.5">
                                <label className="text-[11px] tracking-wide text-slate-500 ml-4 font-semibold">Phone number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                                    <input
                                        className={`w-full bg-slate-50 border ${formErrors.contact_phone ? 'border-red-400' : 'border-slate-200'} rounded-xl pl-10 pr-4 py-3 outline-none focus:border-[#2f6bb0] focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-900 font-bold placeholder:text-slate-300 text-sm md:text-base`}
                                        placeholder="04xx..."
                                        value={formValues.contact_phone}
                                        onChange={(e) => handleFieldChange("contact_phone", e.target.value)}
                                    />
                                </div>
                                {formErrors.contact_phone && <p className="text-[9px] text-red-500 font-bold uppercase tracking-wider ml-4">{formErrors.contact_phone}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] tracking-wide text-slate-500 ml-4 font-semibold">Group (max {MAX_GROUP_SIZE})</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={MAX_GROUP_SIZE}
                                    className={`w-full bg-slate-50 border ${formErrors.group_size ? 'border-red-400' : 'border-slate-200'} rounded-xl px-4 py-3 outline-none focus:border-[#2f6bb0] focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-900 font-bold text-sm md:text-base`}
                                    value={formValues.group_size}
                                    onChange={(e) => handleFieldChange("group_size", parseInt(e.target.value))}
                                />
                                {formErrors.group_size && <p className="text-[9px] text-red-500 font-bold uppercase tracking-wider ml-4">{formErrors.group_size}</p>}
                            </div>
                        </div>

                        {/* Email & Skill */}
                        <div className="grid grid-cols-2 gap-3.5">
                            <div className="space-y-1.5">
                                <label className="text-[11px] tracking-wide text-slate-500 ml-4 font-semibold">Email (optional)</label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                                    <input
                                        type="email"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-[#2f6bb0] focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-900 font-bold placeholder:text-slate-300 text-sm md:text-base"
                                        placeholder="Optional"
                                        value={formValues.contact_email}
                                        onChange={(e) => handleFieldChange("contact_email", e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] tracking-wide text-slate-500 ml-4 font-semibold">Skill level</label>
                                <div className="relative">
                                    <Trophy className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                                    <select
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-[#2f6bb0] focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-900 font-bold appearance-none cursor-pointer text-sm md:text-base"
                                        value={formValues.skill_level}
                                        onChange={(e) => handleFieldChange("skill_level", e.target.value)}
                                    >
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Interm.</option>
                                        <option value="Advanced">Advanced</option>
                                        <option value="Pro">Pro</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {submitError && (
                            <p className="text-red-500 text-[10px] uppercase tracking-widest font-black text-center bg-red-50 py-3 rounded-2xl border border-red-100 animate-in fade-in zoom-in duration-300">
                                {submitError}
                            </p>
                        )}

                        <div className="pt-2 space-y-4">
                            <div className="bg-blue-50/50 p-5 rounded-[1.5rem] border border-blue-100 flex gap-4 items-start shadow-inner">
                                <div className="w-10 h-10 bg-[#2f6bb0] rounded-xl flex items-center justify-center shrink-0 shadow-lg border border-white/20">
                                    <Calendar className="text-[#dfff00] w-5 h-5" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[11px] font-semibold tracking-wide text-[#184a8e]">Booking policy</p>
                                    <p className="text-xs text-[#2f6bb0] font-semibold leading-relaxed">
                                        To cancel or reschedule, please contact the coach directly. Cancellations within 24 hours may incur a fee.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-5 bg-[#2f6bb0] hover:bg-[#184a8e] disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold tracking-wide rounded-[2rem] transition-all shadow-xl hover:shadow-[#2f6bb0]/30 active:scale-95 flex items-center justify-center gap-3 group"
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Processing...</span>
                                    </div>
                                ) : (
                                    <>
                                        Confirm Booking
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
