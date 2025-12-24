import { DateTime } from "luxon";
import { CalendarWidget } from "./CalendarWidget";

type AdminSidebarProps = {
    currentDate: DateTime;
    onDateSelect: (date: DateTime) => void;
    teamMembers?: Array<{ name: string; avatar: string; color: string }>;
    allowPast?: boolean;
};

const LOCATIONS = [
    {
        suburb: "Hobart",
        name: "St Michael’s Collegiate - Junior School",
        address: "52-58 Anglesea St, South Hobart",
        mapUrl: "https://www.google.com/maps/search/?api=1&query=St+Michael%E2%80%99s+Collegiate+-+Junior+School,+52-58+Anglesea+St,+South+Hobart"
    },
    {
        suburb: "Sandy Bay",
        name: "The Hutchins School",
        address: "71 Nelson Road, Sandy Bay",
        mapUrl: "https://www.google.com/maps/search/?api=1&query=The+Hutchins+School,+71+Nelson+Road,+Sandy+Bay"
    },
    {
        suburb: "Kingston",
        name: "The Kingston Tennis Club",
        address: "7/10 Kingston View Drive, Kingston",
        mapUrl: "https://www.google.com/maps/search/?api=1&query=The+Kingston+Tennis+Club,+7/10+Kingston+View+Drive,+Kingston"
    }
];

export function AdminSidebar({
    currentDate,
    onDateSelect,
    allowPast = false,
}: AdminSidebarProps) {
    return (
        <aside className="w-full bg-white flex flex-col h-full shadow-sm">
            {/* Brand Header */}
            <div className="p-4 flex items-center justify-between border-b border-slate-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#dfff00] rounded-2xl flex items-center justify-center shadow-lg border border-black/5 transform -rotate-12">
                        <span className="text-black font-black text-xs">YS</span>
                    </div>
                    <div>
                        <span className="text-lg font-semibold tracking-tight text-[#184a8e] block leading-none">Yeoh&apos;s Schedule</span>
                        <span className="text-[11px] font-semibold tracking-wide text-slate-400">Coaching Hub</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 px-4 py-3 space-y-3">

                {/* Date Picker */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
                    <CalendarWidget
                        currentDate={currentDate}
                        onDateSelect={onDateSelect}
                        allowPast={allowPast}
                    />
                </div>

                {/* Location Context */}
                <div className="space-y-3">
                    <div className="px-2 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-slate-100/70 flex items-center justify-center text-slate-500">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                            </svg>
                        </div>
                        <h3 className="font-semibold text-slate-900 text-[11px] tracking-widest uppercase">Our Locations</h3>
                    </div>

                    <div className="space-y-2.5">
                        {LOCATIONS.map((loc) => (
                            <div key={loc.suburb} className="p-2.5 bg-white/80 rounded-2xl border border-slate-200/70 group hover:bg-white hover:border-slate-300 transition-all">
                                <p className="text-[10px] font-semibold text-slate-400 tracking-widest uppercase mb-1">{loc.suburb}</p>
                                <p className="text-[13px] font-semibold text-slate-800 leading-snug mb-1">{loc.name}</p>
                                <p className="text-[11px] text-slate-500 font-medium mb-2.5">{loc.address}</p>
                                <a
                                    href={loc.mapUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 tracking-widest uppercase hover:text-slate-700 transition-colors group/link"
                                >
                                    <span>Get Directions</span>
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transform group-hover/link:translate-x-0.5 transition-transform">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </a>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

        </aside>
    );
}
