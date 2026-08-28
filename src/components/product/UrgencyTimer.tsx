"use client";

import React, { useState, useEffect } from "react";
import { Clock, Eye, Sparkles } from "lucide-react";

export default function UrgencyTimer({ stock = 12 }: { stock?: number }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 28, seconds: 45 });
  const [viewersCount, setViewersCount] = useState(18);

  useEffect(() => {
    const viewerInterval = setInterval(() => {
      setViewersCount(Math.floor(14 + Math.random() * 12));
    }, 8000);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 5, minutes: 30, seconds: 0 };
      });
    }, 1000);

    return () => {
      clearInterval(viewerInterval);
      clearInterval(timer);
    };
  }, []);

  const format = (n: number) => n.toString().padStart(2, "0");

  return (
    <div className="space-y-2.5 p-4 rounded-2xl bg-white border border-black/[0.06] shadow-subtle">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 font-medium text-slate-700">
          <Clock className="w-3.5 h-3.5 text-brand-600" />
          <span className="tracking-wide">Limited Edition Offer Closes In:</span>
        </div>

        <div className="flex items-center gap-1 font-mono font-bold text-slate-900 text-xs">
          <span className="bg-slate-100 text-brand-dark px-2 py-0.5 rounded-md border border-slate-200/60">
            {format(timeLeft.hours)}h
          </span>
          <span className="text-slate-400">:</span>
          <span className="bg-slate-100 text-brand-dark px-2 py-0.5 rounded-md border border-slate-200/60">
            {format(timeLeft.minutes)}m
          </span>
          <span className="text-slate-400">:</span>
          <span className="bg-slate-100 text-brand-dark px-2 py-0.5 rounded-md border border-slate-200/60">
            {format(timeLeft.seconds)}s
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 font-normal pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-slate-600">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
          <span>{viewersCount} viewing this collection</span>
        </div>

        <div className="text-slate-700 font-medium">
          {stock} parcels remaining in current batch
        </div>
      </div>
    </div>
  );
}

