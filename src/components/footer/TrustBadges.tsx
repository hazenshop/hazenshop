import React from "react";
import { Truck, ShieldCheck, RefreshCw, Award } from "lucide-react";

export default function TrustBadges() {
  const badges = [
    {
      icon: Truck,
      title: "সারা দেশে ডেলিভারি",
      subtitle: "৬৪ জেলায় দ্রুত হোম ডেলিভারি",
    },
    {
      icon: ShieldCheck,
      title: "ক্যাশ অন ডেলিভারি",
      subtitle: "প্যাকেট দেখে মূল্য পরিশোধ করুন",
    },
    {
      icon: RefreshCw,
      title: "৭ দিনের ফ্রি এক্সচেঞ্জ",
      subtitle: "সাইজ বা কালার পরিবর্তন সুবিধা",
    },
    {
      icon: Award,
      title: "১০০% প্রিমিয়াম ফেব্রিক",
      subtitle: "রং ও কোয়ালিটি শতভাগ গ্যারান্টি",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 py-4 sm:py-6">
      {badges.map((b, idx) => {
        const Icon = b.icon;
        return (
          <div
            key={idx}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-3.5 p-3.5 sm:p-5 rounded-2xl bg-white border border-brand-maroon-700/10 shadow-subtle hover:shadow-card transition-all"
          >
            <div className="p-2 sm:p-2.5 rounded-xl bg-brand-maroon-50 text-brand-maroon-700 shrink-0">
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2]" />
            </div>
            <div>
              <h4 className="font-heading font-extrabold text-xs sm:text-sm text-slate-900 leading-tight">
                {b.title}
              </h4>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-normal mt-0.5 leading-snug">{b.subtitle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}



