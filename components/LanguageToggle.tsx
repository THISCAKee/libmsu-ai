"use client";

import { Languages } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { language, setLanguage } = useLanguage();
  const label = language === "th" ? "เปลี่ยนภาษา" : "Change language";

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white/90 p-1 shadow-sm ${className}`}
      role="group"
      aria-label={label}
    >
      <Languages className="ml-1.5 h-3.5 w-3.5 text-slate-400" />
      {(["th", "en"] as const).map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => setLanguage(item)}
          aria-pressed={language === item}
          className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
            language === item
              ? "bg-blue-600 text-white"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          }`}
        >
          {item === "th" ? "ไทย" : "EN"}
        </button>
      ))}
    </div>
  );
}
