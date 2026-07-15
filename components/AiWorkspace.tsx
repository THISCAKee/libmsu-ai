"use client";

import { useMemo, useState } from "react";
import {
  ExternalLink,
  Search,
  Compass,
  GraduationCap,
  MessageSquare,
  SearchCode,
  LogOut,
  ChevronRight,
} from "lucide-react";
import type { AiPlatform } from "@/data/platforms";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/components/LanguageProvider";

type UserProfile = {
  name: string;
  role: "นิสิต" | "บุคลากร";
  studentId?: string;
  year?: string;
  faculty?: string;
  major?: string;
  department?: string;
};

type AiWorkspaceProps = {
  platforms: AiPlatform[];
  userProfile: UserProfile;
  onLogout: () => void;
};

const categories = ["All", "Chat", "Research", "Search"] as const;

const WORKSPACE_COPY = {
  th: {
    institution: "สำนักวิทยบริการ มหาวิทยาลัยมหาสารคาม",
    student: "นิสิต",
    staff: "บุคลากร",
    logout: "ออกจากระบบ",
    title: "เลือกเครื่องมือ AI ที่เหมาะกับงานของคุณ",
    subtitle: "เชื่อมต่อไปยังระบบหลักของแต่ละแพลตฟอร์มโดยตรง",
    searchPlaceholder: "ค้นหาตามชื่อ, รายละเอียด หรือประเภท...",
    searchLabel: "ค้นหาแพลตฟอร์ม AI",
    open: "เปิดใช้งาน",
    noResults: "ไม่พบแพลตฟอร์ม AI ที่ตรงกับการค้นหา",
    categories: {
      All: "ทั้งหมด",
      Chat: "สนทนา",
      Research: "วิจัย",
      Search: "ค้นหา",
    },
  },
  en: {
    institution: "Academic Resource Center, Mahasarakham University",
    student: "Student",
    staff: "Staff",
    logout: "Sign out",
    title: "Choose the right AI platform for your work",
    subtitle: "Connect directly to each platform's official service.",
    searchPlaceholder: "Search by name, description, or category...",
    searchLabel: "Search AI platforms",
    open: "Open platform",
    noResults: "No AI platforms match your search.",
    categories: {
      All: "All",
      Chat: "Chat",
      Research: "Research",
      Search: "Search",
    },
  },
} as const;

export function AiWorkspace({
  platforms,
  userProfile,
  onLogout,
}: AiWorkspaceProps) {
  const { language } = useLanguage();
  const copy = WORKSPACE_COPY[language];
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [query, setQuery] = useState("");

  const filteredPlatforms = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();

    return platforms.filter((platform) => {
      const matchesCategory =
        category === "All" || platform.category === category;
      const matchesQuery =
        cleanQuery.length === 0 ||
        [
          platform.name,
          platform.plan,
          platform.category,
          platform.description.th,
          platform.description.en,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(cleanQuery);

      return matchesCategory && matchesQuery;
    });
  }, [category, platforms, query]);

  const handleCardClick = async (platformName: string) => {
    try {
      const response = await fetch("/api/log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...userProfile,
          action: "Click AI Platform",
          platformName,
        }),
      });

      const result = (await response.json().catch(() => null)) as {
        success?: boolean;
        error?: string;
      } | null;

      if (!response.ok || result?.success !== true) {
        throw new Error(
          result?.error || `Logging request failed with HTTP ${response.status}`,
        );
      }
    } catch (error) {
      console.error("Error logging platform selection:", error);
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "Chat":
        return <MessageSquare size={15} />;
      case "Research":
        return <GraduationCap size={15} />;
      case "Search":
        return <SearchCode size={15} />;
      default:
        return <Compass size={15} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Top navigation bar */}
      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/80">
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img
              src="/logotab.png"
              alt="MSU Logo"
              className="h-9 w-auto object-contain"
            />
            <div className="hidden sm:block">
              <span className="text-sm font-bold text-slate-800 tracking-tight">
                LIB AI Hub
              </span>
              <span className="text-[11px] text-slate-400 block leading-none">
                {copy.institution}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <LanguageToggle />
            <div className="hidden md:flex items-center gap-2.5">
              <div className="flex items-center gap-2 bg-slate-100 rounded-full px-3.5 py-1.5">
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">
                  {userProfile.name.charAt(0)}
                </div>
                <span className="text-sm font-medium text-slate-700 max-w-[150px] truncate">
                  {userProfile.name}
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-700 uppercase">
                  {userProfile.role === "นิสิต" ? copy.student : copy.staff}
                </span>
              </div>
            </div>
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200 cursor-pointer"
              onClick={onLogout}
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">{copy.logout}</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-[1200px] mx-auto px-6 py-10">
        {/* Hero section */}
        <header className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-3">
            {copy.title}
          </h1>
          <p className="max-w-[550px] mx-auto text-base text-slate-500 leading-relaxed">
            {copy.subtitle}
          </p>
        </header>

        {/* Search & Filters */}
        <section className="flex flex-col md:flex-row items-stretch md:items-center gap-4 mb-10">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              size={18}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={copy.searchPlaceholder}
              className="w-full py-3 pl-11 pr-4 text-sm rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 shadow-sm"
              aria-label={copy.searchLabel}
            />
          </div>

          <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer ${
                  category === item
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
                onClick={() => setCategory(item)}
              >
                {getCategoryIcon(item)}
                <span>{copy.categories[item]}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Platform cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPlatforms.map((platform) => (
            <a
              key={platform.id}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              onClick={() => handleCardClick(platform.name)}
            >
              {/* Card top accent */}
              <div
                className="h-1 w-full"
                style={{ backgroundColor: platform.accent }}
              />

              <div className="flex flex-col flex-grow p-6">
                {/* Top row: logo + plan badge */}
                <div className="flex items-start justify-between mb-5">
                  <div
                    className="h-12 w-12 rounded-xl flex items-center justify-center shadow-sm border border-slate-100"
                    style={{ backgroundColor: platform.accentLight }}
                  >
                    <img
                      src={platform.logo}
                      alt={`${platform.name} logo`}
                      className="h-7 w-7 object-contain"
                      onError={(e) => {
                        // Fallback: ใช้ตัวอักษรแรกของชื่อ
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `<span style="font-size:18px;font-weight:700;color:${platform.accent}">${platform.name.charAt(0)}</span>`;
                        }
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase px-2 py-1 rounded-md bg-slate-100 text-slate-500 tracking-wider">
                      {platform.category}
                    </span>
                    {platform.plan && (
                      <span
                        className="text-[10px] font-semibold px-2 py-1 rounded-md"
                        style={{
                          backgroundColor: platform.accentLight,
                          color: platform.accent,
                        }}
                      >
                        {platform.plan}
                      </span>
                    )}
                  </div>
                </div>

                {/* Name & description */}
                <div className="mb-6 flex-grow">
                  <h3 className="text-lg font-bold text-slate-900 mb-1.5">
                    {platform.name}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-500">
                      {platform.description[language]}
                  </p>
                </div>

                {/* Footer action */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-sm font-medium text-slate-400 transition-all duration-200 group-hover:text-slate-700">
                  <span>{copy.open}</span>
                  <div className="flex items-center gap-1 transition-transform duration-200 group-hover:translate-x-1">
                    <ExternalLink size={14} />
                    <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            </a>
          ))}

          {filteredPlatforms.length === 0 && (
            <div className="col-span-full text-center py-16 text-slate-400 text-sm">
              <Search size={40} className="mx-auto mb-3 text-slate-300" />
              <p>{copy.noResults}</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-xs text-slate-400">
        {copy.institution}
      </footer>
    </div>
  );
}
