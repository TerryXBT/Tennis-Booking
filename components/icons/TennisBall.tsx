import React from "react";

export const TennisBall = ({ size = 24, className = "" }: { size?: number, className?: string }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
            <path d="M2 12h20" className="opacity-0" /> {/* Hidden helper or just keep simple curves */}
            {/* Better curve for tennis ball seam */}
            <path d="M2 12c5.5 0 10-4.5 10-10" />
            <path d="M12 22c0-5.5 4.5-10 10-10" />
        </svg>
    );
};
