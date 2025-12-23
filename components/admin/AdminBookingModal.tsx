import { useState, useEffect, useRef } from "react";
import { MAX_GROUP_SIZE } from "@/lib/time";
import { X, Trash2, User, Phone, Mail, Calendar, Trophy, ArrowRight } from "lucide-react";
import { DateTime } from "luxon";

type AdminBooking = {
    id: string;
    start_time: string;
    end_time: string;
    student_name: string;
    student_type: "kid" | "adult";
    group_size: number;
    contact_phone: string;
    contact_email?: string | null;
};

type AdminBookingModalProps = {
    slot?: string; // ISO string for creating new
    booking?: AdminBooking; // Existing booking object for editing
    onClose: () => void;
    onSuccess: (action?: "create" | "update" | "delete", bookingId?: string) => void;
};

const initialFormState = {
    student_name: "",
    age_group: "kid" as const,
    skill_level: "Beginner",
    group_size: 1,
    contact_phone: "",
    contact_email: "",
};

export function AdminBookingModal({ slot, booking, onClose, onSuccess }: AdminBookingModalProps) {
    const isEditing = !!booking;
    const startTimeDisplay = booking ? booking.start_time : slot!;
    const dt = DateTime.fromISO(startTimeDisplay);
    const endDt = dt.plus({ hours: 1 });

    const [formValues, setFormValues] = useState(() => {
        if (booking) {
            // Extract skill level from name if present: "Name (Skill)"
            const match = booking.student_name.match(/^(.*?)\s\(([^)]+)\)$/);
            return {
                student_name: match ? match[1] : booking.student_name,
                age_group: booking.student_type,
                skill_level: match ? match[2] : "Beginner",
                group_size: booking.group_size,
                contact_phone: booking.contact_phone,
                contact_email: booking.contact_email || "",
            };
        }
        return initialFormState;
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setSubmitting] = useState(false);
    const [isDeleting, setDeleting] = useState(false);
    const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const firstInputRef = useRef<HTMLInputElement>(null);
    const telNumber = formValues.contact_phone.trim().replace(/[^\d+]/g, "");
    const phoneHref = telNumber ? `tel:${telNumber}` : "";

    // Focus trap and focus management
    useEffect(() => {
        const modal = document.getElementById("admin-booking-modal");
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
        if (!formValues.contact_phone.trim()) errors.contact_phone = "Required";
        if (formValues.group_size < 1 || formValues.group_size > MAX_GROUP_SIZE) errors.group_size = `1-${MAX_GROUP_SIZE} people`;
        return errors;
    };

    const handleSubmit = async (e: React.FormEvent | React.MouseEvent) => {
        e.preventDefault();
        const errors = validate();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setSubmitting(true);
        setSubmitError(null);

        // Join name and skill level
        const finalStudentName = `${formValues.student_name.trim()} (${formValues.skill_level})`;

        try {
            const url = isEditing ? `/api/bookings/${booking.id}` : "/api/bookings";
            const method = isEditing ? "PATCH" : "POST";

            const body = {
                student_name: finalStudentName,
                student_type: formValues.age_group, // Changed from student_type
                group_size: formValues.group_size,
                contact_phone: formValues.contact_phone,
                contact_email: formValues.contact_email,
                ...(isEditing ? {} : { start_time: slot }),
            };

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!res.ok) {
                setSubmitError(data.error || "Operation failed");
                return;
            }

            onSuccess(isEditing ? "update" : "create");
        } catch (err) {
            console.error(err);
            setSubmitError("Network error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!booking) return;

        if (!isDeleteConfirming) {
            setIsDeleteConfirming(true);
            return;
        }

        setDeleting(true);
        try {
            const res = await fetch(`/api/bookings/${booking.id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const data = await res.json();
                setSubmitError(data.error || "Delete failed");
                setIsDeleteConfirming(false);
                return;
            }

            onSuccess("delete", booking.id);
        } catch (err) {
            console.error(err);
            setSubmitError("Network error");
        } finally {
            setDeleting(false);
            setIsDeleteConfirming(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-8">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />

            <div
                id="admin-booking-modal"
                className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-8 duration-500 ease-out border border-slate-200 flex flex-col max-h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                <div className={`absolute top-0 left-0 right-0 h-2 ${isDeleteConfirming ? 'bg-red-500' : 'bg-gradient-to-r from-[#2f6bb0] via-[#dfff00] to-[#417d4d]'} transition-colors duration-500 shrink-0`} />

                <div className="p-6 md:p-10 text-slate-900 overflow-y-auto custom-scrollbar">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <div className={`inline-flex items-center gap-2 px-3 py-1 ${isDeleteConfirming ? 'bg-red-50 border-red-100 text-red-600' : 'bg-blue-50 border-blue-100 text-[#2f6bb0]'} border rounded-full text-[10px] font-black uppercase tracking-[0.2em] italic mb-3 transition-colors`}>
                                {isDeleteConfirming ? <Trash2 size={12} /> : <Calendar size={12} />}
                                {isDeleteConfirming ? "Danger Zone" : isEditing ? "Modify Booking" : "Internal Booking"}
                            </div>
                            <h2 className={`text-2xl md:text-3xl font-black uppercase italic tracking-tighter leading-none transition-colors ${isDeleteConfirming ? 'text-red-600' : 'text-[#184a8e]'}`}>
                                {isDeleteConfirming ? "Remove" : isEditing ? "Edit" : "New"} <br />
                                <span className={isDeleteConfirming ? 'text-red-400' : 'text-[#417d4d]'}>
                                    {isDeleteConfirming ? "Booking?" : "Booking"}
                                </span>
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100 flex items-center justify-between mb-6 shadow-inner overflow-hidden">
                        <div className="flex items-center gap-4">
                            <div>
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Time Slot</p>
                                <p className="text-base md:text-lg font-black text-[#184a8e]">
                                    {dt.toFormat("cccc, d MMMM")}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Duration</p>
                            <p className="text-base md:text-lg font-black text-[#2f6bb0]">
                                {dt.toFormat("h:mm a")} to {endDt.toFormat("h:mm a")}
                            </p>
                        </div>
                    </div>

                    {isDeleteConfirming ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-red-50 border border-red-100 rounded-[2.5rem] p-8 text-center space-y-4 shadow-inner">
                                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-2 animate-bounce shadow-xl border border-white">
                                    <Trash2 size={32} />
                                </div>
                                <h3 className="text-xl font-black text-red-600 uppercase italic tracking-tight">Are you absolutely sure?</h3>
                                <p className="text-sm text-red-500/80 font-medium leading-relaxed">
                                    You are about to delete the booking for <span className="font-bold text-red-600 underline underline-offset-4 decoration-2">{formValues.student_name}</span>. This action cannot be undone.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsDeleteConfirming(false)}
                                    disabled={isDeleting}
                                    className="flex-1 py-5 bg-white border-2 border-slate-100 text-slate-400 font-black uppercase tracking-widest rounded-[2rem] hover:bg-slate-50 hover:text-slate-600 transition-all active:scale-95 shadow-sm"
                                >
                                    No, Keep it
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="flex-[1.5] py-5 bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest rounded-[2rem] transition-all shadow-xl shadow-red-500/20 active:scale-95 flex items-center justify-center gap-3 group"
                                >
                                    {isDeleting ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Deleting...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <Trash2 size={20} className="group-hover:rotate-12 transition-transform" />
                                            Confirm Delete
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-3.5">
                            {/* Name & Age */}
                            <div className="grid grid-cols-2 gap-3.5">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] uppercase tracking-[0.2em] text-slate-500 ml-4 font-black">Student Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                                        <input
                                            ref={firstInputRef}
                                            className={`w-full bg-slate-50 border ${formErrors.student_name ? 'border-red-400' : 'border-slate-200'} rounded-xl pl-10 pr-4 py-3 outline-none focus:border-[#2f6bb0] focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-900 font-bold placeholder:text-slate-300 text-base`}
                                            value={formValues.student_name}
                                            onChange={(e) => handleFieldChange("student_name", e.target.value)}
                                            placeholder="Name"
                                        />
                                    </div>
                                    {formErrors.student_name && <p className="text-[9px] text-red-500 font-bold uppercase tracking-wider ml-4">{formErrors.student_name}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] uppercase tracking-[0.2em] text-slate-500 ml-4 font-black italic">Age Group</label>
                                    <select
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#2f6bb0] focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-900 font-bold appearance-none cursor-pointer text-base"
                                        value={formValues.age_group}
                                        onChange={(e) => handleFieldChange("age_group", e.target.value as "kid" | "adult")}
                                    >
                                        <option value="kid">Junior (U18)</option>
                                        <option value="adult">Adult (18+)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Phone & Size */}
                            <div className="grid grid-cols-2 gap-3.5">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] uppercase tracking-[0.2em] text-slate-500 ml-4 font-black italic">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                                        <input
                                            className={`w-full bg-slate-50 border ${formErrors.contact_phone ? 'border-red-400' : 'border-slate-200'} rounded-xl pl-10 pr-4 py-3 outline-none focus:border-[#2f6bb0] focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-900 font-bold placeholder:text-slate-300 text-base`}
                                            value={formValues.contact_phone}
                                            onChange={(e) => handleFieldChange("contact_phone", e.target.value)}
                                            placeholder="04xx..."
                                        />
                                    </div>
                                    {formErrors.contact_phone && <p className="text-[9px] text-red-500 font-bold uppercase tracking-wider ml-4">{formErrors.contact_phone}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] uppercase tracking-[0.2em] text-slate-500 ml-4 font-black italic">Group (Max {MAX_GROUP_SIZE})</label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={MAX_GROUP_SIZE}
                                        className={`w-full bg-slate-50 border ${formErrors.group_size ? 'border-red-400' : 'border-slate-200'} rounded-xl px-4 py-3 outline-none focus:border-[#2f6bb0] focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-900 font-bold text-base`}
                                        value={formValues.group_size}
                                        onChange={(e) => handleFieldChange("group_size", parseInt(e.target.value))}
                                    />
                                    {formErrors.group_size && <p className="text-[9px] text-red-500 font-bold uppercase tracking-wider ml-4">{formErrors.group_size}</p>}
                                </div>
                            </div>

                            {/* Email & Skill */}
                            <div className="grid grid-cols-2 gap-3.5">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] uppercase tracking-[0.2em] text-slate-500 ml-4 font-black italic">Email (Optional)</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                                        <input
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-[#2f6bb0] focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-900 font-bold placeholder:text-slate-300 text-base"
                                            value={formValues.contact_email}
                                            onChange={(e) => handleFieldChange("contact_email", e.target.value)}
                                            placeholder="Optional"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] uppercase tracking-[0.2em] text-slate-500 ml-4 font-black italic">Skill Level</label>
                                    <div className="relative">
                                        <Trophy className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                                        <select
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-[#2f6bb0] focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-900 font-bold appearance-none cursor-pointer text-base"
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

                            <div className="pt-2">
                                <a
                                    href={phoneHref}
                                    aria-disabled={!phoneHref}
                                    className={`w-full p-5 rounded-[1.5rem] border flex items-center justify-between gap-4 transition-all shadow-inner ${phoneHref
                                        ? "bg-[#2f6bb0] border-[#2f6bb0] text-white hover:bg-[#184a8e]"
                                        : "bg-slate-100 border-slate-200 text-slate-400 pointer-events-none"
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg border ${phoneHref
                                            ? "bg-white/15 border-white/30"
                                            : "bg-white border-slate-200"
                                            }`}>
                                            <Phone className={phoneHref ? "text-white w-5 h-5" : "text-slate-400 w-5 h-5"} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[11px] font-semibold tracking-wide">Call Student</p>
                                            <p className={`text-xs font-semibold ${phoneHref ? "text-white/90" : "text-slate-400"}`}>
                                                {formValues.contact_phone || "No phone number"}
                                            </p>
                                        </div>
                                    </div>
                                    <ArrowRight size={18} className={phoneHref ? "text-white" : "text-slate-400"} />
                                </a>
                            </div>

                            <div className="pt-4 flex items-center gap-4">
                                {isEditing && (
                                    <button
                                        type="button"
                                        onClick={() => setIsDeleteConfirming(true)}
                                        disabled={isDeleting || isSubmitting}
                                        className="p-5 bg-red-50 hover:bg-red-500 hover:text-white text-red-500 font-bold rounded-2xl transition-all disabled:opacity-50 shadow-sm border border-red-100 active:scale-95 group"
                                    >
                                        <Trash2 size={24} className="group-hover:scale-110 transition-transform" />
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={isSubmitting || isDeleting}
                                    className="flex-1 py-5 bg-[#2f6bb0] hover:bg-[#184a8e] text-white font-black uppercase tracking-[0.2em] rounded-[2rem] transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl hover:shadow-[#2f6bb0]/30 active:scale-95 group italic"
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Processing...</span>
                                        </div>
                                    ) : (
                                        <>
                                            {isEditing ? "Update Booking" : "Create Booking"}
                                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
