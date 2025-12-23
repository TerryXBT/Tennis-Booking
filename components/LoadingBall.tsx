"use client";

import React from 'react';
import { DotLottiePlayer } from '@dotlottie/react-player';

interface LoadingBallProps {
    size?: number;
    text?: string;
}

export const LoadingBall: React.FC<LoadingBallProps> = ({
    size = 200,
    text = "Syncing Court..."
}) => {
    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <div style={{ width: size, height: size }}>
                <DotLottiePlayer
                    src="/tennis-ball.lottie"
                    autoplay
                    loop
                />
            </div>
            {text && (
                <span className="text-[#184a8e] font-black uppercase tracking-widest text-xs animate-pulse">
                    {text}
                </span>
            )}
        </div>
    );
};
