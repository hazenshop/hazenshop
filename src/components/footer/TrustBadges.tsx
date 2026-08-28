import React from "react";
import { Truck, ShieldCheck, RefreshCw, Award } from "lucide-react";

export default function TrustBadges() {
  const badges = [
    {
      icon: Truck,
      title: "Nationwide Delivery",
      subtitle: "Direct across Bangladesh",
    },
    {
      icon: ShieldCheck,
      title: "100% Cash On Delivery",
      subtitle: "Inspect before paying",
    },
    {
      icon: RefreshCw,
      title: "7 Days Exchange",
      subtitle: "Hassle-free guarantee",
    },
    {
      icon: Award,
      title: "Artisanal Cotton",
      subtitle: "Finest combed yarn",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 py-4 sm:py-8">
      {badges.map((b, idx) => {
        const Icon = b.icon;
        return (
          <div
            key={idx}
            className="flex flex-col sm:flex-row items-start gap-2.5 sm:gap-4 p-3.5 sm:p-5 rounded-2xl bg-white border border-black/[0.05] shadow-subtle hover:shadow-card transition-all"
          >
            <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-brand-dark shrink-0">
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.75]" />
            </div>
            <div>
              <h4 className="font-heading font-semibold text-xs sm:text-sm text-slate-900 leading-tight">
                {b.title}
              </h4>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-normal mt-0.5 sm:mt-1 leading-snug">{b.subtitle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}


