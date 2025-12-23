"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, Phone } from "lucide-react";

export default function LandingPage() {
  const ballRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (ballRef.current) {
        const rect = ballRef.current.getBoundingClientRect();
        const ballCenterX = rect.left + rect.width / 2;
        const ballCenterY = rect.top + rect.height / 2;

        const deltaX = e.clientX - ballCenterX;
        const deltaY = e.clientY - ballCenterY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (distance < 300) {
          const force = (300 - distance) / 300;
          const x = -deltaX * force * 0.2;
          const y = -deltaY * force * 0.2;
          ballRef.current.style.setProperty('--x', `${x}px`);
          ballRef.current.style.setProperty('--y', `${y}px`);
        } else {
          ballRef.current.style.setProperty('--x', '0px');
          ballRef.current.style.setProperty('--y', '0px');
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-yellow-400 selection:text-black">
      {/* Dynamic Court-Inspired Background */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(47,107,176,0.05),transparent_50%)] pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 p-6 md:p-8 flex justify-between items-center bg-transparent">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#dfff00] rounded-full flex items-center justify-center shadow-lg border border-black/5">
            <span className="text-black font-black text-xs">YS</span>
          </div>
          <span className="text-lg font-black tracking-tighter uppercase italic text-[#184a8e]">Yeoh&apos;s Schedule</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-slate-500">
          <Link href="#about" className="hover:text-[#2f6bb0] transition-colors">About</Link>
          <Link href="/booking" className="px-6 py-2 bg-[#2f6bb0] text-white rounded-full hover:bg-[#184a8e] transition-all shadow-lg hover:shadow-blue-500/20 active:scale-95">Book Now</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-start md:items-center justify-center pt-28 md:pt-32 overflow-hidden px-6 bg-gradient-to-b from-blue-50 to-white">
        <div className="relative z-10 text-center space-y-4 md:space-y-8 max-w-4xl">
          <h1 className="text-5xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.9] uppercase italic text-[#184a8e]">
            Unleash Your <span className="text-[#417d4d]">Potential</span>
          </h1>
          <p className="text-base md:text-xl text-slate-600 max-w-xl mx-auto font-medium leading-relaxed">
            Personal tennis coaching in Hobart for all ages — from beginners to competitive players. Elevate your game with 35+ years of professional guidance.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-0 md:pt-4">
            <Link href="/booking" className="group relative block cursor-pointer">
              <div
                ref={ballRef}
                className="relative w-32 h-32 md:w-36 md:h-36 animate-breathe transition-transform duration-300 ease-out"
                style={{
                  transform: `translate(var(--x, 0px), var(--y, 0px))`
                } as React.CSSProperties}
              >
                <div className="absolute inset-0 bg-[#dfff00]/30 blur-[60px] rounded-full animate-glow" />
                <div className="relative w-full h-full bg-[#dfff00] rounded-full shadow-[inset_-20px_-20px_60px_rgba(0,0,0,0.1),20px_20px_60px_rgba(0,0,0,0.05)] border-4 border-white/50 flex items-center justify-center overflow-hidden">
                  <svg viewBox="0 0 100 100" className="w-[120%] h-[120%] text-white/50 stroke-current fill-none stroke-[2]">
                    <path d="M-10 50 C 20 50, 50 20, 50 -10" />
                    <path d="M50 110 C 50 80, 80 50, 110 50" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-100 bg-white/20 backdrop-blur-[2px]">
                    <span className="text-black font-black text-sm tracking-[0.1em] uppercase italic text-center px-4 leading-tight drop-shadow-sm">Book a Course</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>


        {/* Background Text Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.03]">
          <span className="text-[30vw] font-black italic tracking-tighter uppercase leading-none text-[#184a8e]">ACE</span>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 px-6 border-t border-slate-100 relative bg-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
          <div className="relative aspect-square rounded-[3rem] overflow-hidden group shadow-2xl bg-slate-200">
            <Image
              src="/images/yeoh/portrait.png"
              alt="Coach Yeoh"
              fill
              className="object-cover group-hover:scale-105 transition-all duration-1000"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#184a8e]/60 via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-10 left-10 space-y-2">
              <span className="text-[#dfff00] font-black uppercase tracking-widest text-sm drop-shadow-md">Davis Cup Veteran</span>
              <h2 className="text-4xl font-bold uppercase italic text-white">Coach Yeoh</h2>
            </div>
          </div>
          <div className="space-y-8">
            <div className="inline-block h-1.5 w-20 bg-[#2f6bb0]" />
            <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter italic text-[#184a8e]">Seasoned <span className="text-[#417d4d]">Mastery</span></h2>
            <div className="space-y-6 text-slate-600 text-lg font-medium leading-relaxed">
              <p>
                Originally from Malaysia and now Hobart-based, Yeoh brings 35 years of coaching experience to the court. A former Davis Cup representative (1985-1988), his dedication to the sport is unmatched in Tasmania.
              </p>
              <p>
                Specializing in skills development, strength conditioning, and agility, Yeoh focuses on building mental and physical resilience. He believes tennis is a lifelong journey of self-improvement and social connection.
              </p>
              <p className="italic text-[#2f6bb0] font-bold">
                Fluent in English, Malay, Mandarin, and Hokien, Coach Yeoh ensures that top-notch tennis knowledge is accessible to everyone in our diverse community.
              </p>
            </div>
            <div className="flex gap-10 pt-4">
              <div>
                <div className="text-4xl font-black text-[#184a8e] italic tracking-tighter">35+</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mt-1 font-black italic">Years Coaching</div>
              </div>
              <div>
                <div className="text-4xl font-black text-[#184a8e] italic tracking-tighter">Elite</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mt-1 font-black italic">Davis Cup Pro</div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Contact Section */}
      <section className="py-32 px-6 bg-[#184a8e] relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="max-w-5xl mx-auto relative z-10 grid md:grid-cols-2 gap-20">
          <div className="space-y-12">
            <h2 className="text-6xl font-black uppercase tracking-tighter italic leading-tight">Ready to <br /><span className="text-[#dfff00] text-7xl">Dominate?</span></h2>
            <div className="space-y-8">
              <a href="tel:0400000000" className="flex items-center gap-6 group cursor-pointer">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-[#dfff00] group-hover:text-black transition-all">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-white/40 uppercase tracking-widest text-[10px] font-bold">Call Now</div>
                  <div className="text-xl font-bold">0400 000 000</div>
                </div>
              </a>
              <div className="flex items-center gap-6 group cursor-pointer">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-[#dfff00] group-hover:text-black transition-all">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-white/40 uppercase tracking-widest text-[10px] font-bold">Email Us</div>
                  <div className="text-xl font-bold">hello@tennis-elite.com</div>
                </div>
              </div>
            </div>
          </div>

          <form className="space-y-6 bg-white/10 p-10 rounded-[3rem] border border-white/10 backdrop-blur-xl" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-white/60 ml-4 font-black">Your Name</label>
              <input className="w-full bg-white/5 border border-white/20 rounded-2xl px-6 py-4 outline-none focus:border-[#dfff00] transition-all text-white placeholder:text-white/20" placeholder="Enter name..." />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-white/60 ml-4 font-black">Your Message</label>
              <textarea rows={4} className="w-full bg-white/5 border border-white/20 rounded-2xl px-6 py-4 outline-none focus:border-[#dfff00] transition-all text-white resize-none placeholder:text-white/20" placeholder="What&apos;s on your mind?" />
            </div>
            <button className="w-full py-5 bg-[#dfff00] hover:bg-[#c6e300] text-black font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-lg active:scale-95">
              Send Message
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#2f6bb0] rounded-full flex items-center justify-center">
                <span className="text-white font-black text-[10px]">YS</span>
              </div>
              <span className="text-sm font-black tracking-tighter uppercase italic text-[#184a8e]">Yeoh&apos;s Schedule</span>
            </div>
            <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-blue-700 text-[10px] font-black uppercase tracking-widest">
              Elite Hobart Coaching
            </div>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">© 2024 Yeoh&apos;s Schedule Coaching. All Rights Reserved.</p>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <Link href="#" className="hover:text-[#2f6bb0] transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-[#2f6bb0] transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
