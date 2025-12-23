import { LayoutGrid, Calendar, Menu } from "lucide-react";
import { DateTime } from "luxon";

type AdminHeaderProps = {
    currentDate: DateTime;
    onSetToday: () => void;
    onRefresh?: () => void;
    viewMode: "daily" | "weekly";
    onViewModeChange: (mode: "daily" | "weekly") => void;
    onToggleSidebar?: () => void;
    onDateClick?: () => void;
};

export function AdminHeader({
    currentDate,
    onSetToday,
    onRefresh,
    viewMode,
    onViewModeChange,
    onToggleSidebar,
    onDateClick
}: AdminHeaderProps) {
    const weekEnd = currentDate.plus({ days: 6 });
    let dateTitle = "";

    if (viewMode === 'daily') {
        dateTitle = currentDate.toFormat("cccc, d MMMM yyyy");
    } else {
        const isSameMonth = currentDate.hasSame(weekEnd, "month");
        dateTitle = isSameMonth
            ? currentDate.toFormat("MMMM yyyy")
            : `${currentDate.toFormat("MMM")} - ${weekEnd.toFormat("MMM yyyy")}`;
    }

    return (
        <header className="px-4 py-3 lg:px-8 lg:py-6 border-b border-slate-200 bg-white/70 backdrop-blur-xl flex flex-col md:flex-row items-center md:justify-between gap-3 md:gap-4 sticky left-0 right-0 top-0 z-40">
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                    <div className="flex items-center gap-3">
                        {onToggleSidebar && (
                            <button
                                onClick={onToggleSidebar}
                                className="lg:hidden p-2.5 -ml-2.5 text-slate-400 hover:text-[#184a8e] hover:bg-slate-100 rounded-xl transition-all active:scale-90"
                            >
                                <Menu size={20} />
                            </button>
                        )}
                        <h1 className="text-xl lg:text-3xl font-semibold text-[#184a8e] tracking-tight">Coach Schedule</h1>
                    </div>

                    <button
                        onClick={onSetToday}
                        className="sm:hidden px-4 py-2 text-[11px] font-semibold text-black bg-[#dfff00] hover:bg-[#c6e300] rounded-full transition-all flex items-center gap-1.5 shadow-lg active:scale-95 border border-black/5 tracking-wide"
                    >
                        Today
                    </button>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
                    <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-full border border-slate-200 shadow-inner">
                        <button
                            onClick={() => onViewModeChange('daily')}
                            className={`px-6 py-2 text-[11px] font-semibold tracking-wide rounded-full transition-all duration-300 ${viewMode === 'daily'
                                ? "bg-[#2f6bb0] text-white shadow-md"
                                : "text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            Daily
                        </button>
                        <button
                            onClick={() => onViewModeChange('weekly')}
                            className={`px-6 py-2 text-[11px] font-semibold tracking-wide rounded-full transition-all duration-300 ${viewMode === 'weekly'
                                ? "bg-[#2f6bb0] text-white shadow-md"
                                : "text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            Weekly
                        </button>
                    </div>

                    <button
                        onClick={onSetToday}
                        className="hidden sm:flex pl-3 pr-5 py-2.5 text-[11px] font-semibold text-black bg-[#dfff00] hover:bg-[#c6e300] rounded-full transition-all items-center gap-2 shadow-lg active:scale-95 border border-black/5 tracking-wide"
                    >
                        <Calendar size={14} />
                        Today
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-between w-full md:w-auto gap-3 bg-slate-50/50 md:bg-transparent p-2 md:p-0 rounded-2xl border border-slate-100 md:border-0 relative z-20">
                <button
                    onClick={onDateClick}
                    className="text-[15px] lg:hidden font-semibold text-[#184a8e] tracking-tight truncate flex items-center gap-2 active:bg-slate-100 px-2 py-1 -ml-2 rounded-lg transition-colors"
                >
                    {dateTitle}
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                <div className="flex items-center gap-2">
                    {onRefresh && (
                        <button
                            onClick={onRefresh}
                            className="p-2.5 text-slate-400 hover:text-[#2f6bb0] rounded-xl hover:bg-white hover:shadow-md transition-all active:scale-90"
                            title="Refresh Schedule"
                        >
                            <LayoutGrid size={20} />
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
