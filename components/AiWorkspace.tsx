"use client";

import { useMemo, useState } from "react";
import {
  ExternalLink,
  Search,
  Sparkles,
  Compass,
  GraduationCap,
  MessageSquare,
  SearchCode,
} from "lucide-react";
import type { AiPlatform } from "@/data/platforms";

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

export function AiWorkspace({
  platforms,
  userProfile,
  onLogout,
}: AiWorkspaceProps) {
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [query, setQuery] = useState("");

  const filteredPlatforms = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();

    return platforms.filter((platform) => {
      const matchesCategory =
        category === "All" || platform.category === category;
      const matchesQuery =
        cleanQuery.length === 0 ||
        [platform.name, platform.plan, platform.category, platform.description]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(cleanQuery);

      return matchesCategory && matchesQuery;
    });
  }, [category, platforms, query]);

  const handleCardClick = async (platformName: string) => {
    try {
      await fetch("/api/log", {
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
    } catch (error) {
      console.error("Error logging platform selection:", error);
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "Chat":
        return <MessageSquare size={16} />;
      case "Research":
        return <GraduationCap size={16} />;
      case "Search":
        return <SearchCode size={16} />;
      default:
        return <Compass size={16} />;
    }
  };

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-20">
      <header className="mb-14 text-center">
        <div className="flex justify-between items-center bg-slate-900/60 border border-white/8 px-6 py-3 rounded-2xl mb-10 backdrop-blur-md max-sm:flex-col max-sm:items-start max-sm:gap-3 max-sm:p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="bg-gradient-to-r from-teal-600 to-teal-800 text-white text-[11px] font-bold px-2 py-0.5 rounded-md uppercase">
              {userProfile.role}
            </span>
            <span className="font-semibold text-white text-sm">
              {userProfile.name}
            </span>
            {userProfile.role === "นิสิต" && (
              <span className="text-slate-400 text-xs border-l border-white/15 pl-3 max-sm:border-l-0 max-sm:pl-0 max-sm:block max-sm:mt-1">
                {[
                  `รหัส: ${userProfile.studentId}`,
                  userProfile.year,
                  userProfile.faculty,
                  userProfile.major,
                ]
                  .filter(Boolean)
                  .join(" • ")}
              </span>
            )}
            {userProfile.role === "บุคลากร" && (
              <span className="text-slate-400 text-xs border-l border-white/15 pl-3 max-sm:border-l-0 max-sm:pl-0 max-sm:block max-sm:mt-1">
                หน่วยงาน: {userProfile.department}
              </span>
            )}
          </div>
          <button
            type="button"
            className="bg-transparent border border-white/15 text-slate-300 px-3.5 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all duration-250 hover:bg-white/8 hover:text-white hover:border-white/30 max-sm:w-full max-sm:text-center"
            onClick={onLogout}
          >
            เปลี่ยนข้อมูลผู้ใช้
          </button>
        </div>

        <div className="inline-flex flex-col items-center gap-1 mb-3">
          <img
            src="/logo.png"
            alt="MSU Logo"
            className="w-auto h-[100px] object-contain mb-2"
          />
          <div>
            <span className="block text-[13px] font-bold tracking-[0.2em] text-[#2dd4bf] uppercase">
              LIB AI PLATFORMS
            </span>
            <h1 className="text-[38px] font-bold tracking-tight bg-gradient-to-b from-white to-slate-300 bg-clip-text text-transparent">
              ศูนย์รวมเครื่องมือ AI
            </h1>
          </div>
        </div>
        <p className="max-w-[600px] mx-auto text-base leading-relaxed text-slate-400 font-light">
          เลือกใช้งานเครื่องมือปัญญาประดิษฐ์ชั้นนำตามความเหมาะสมของงาน
          โดยเชื่อมต่อไปยังระบบหลักของแต่ละแพลตฟอร์มโดยตรง
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-[1fr_auto] items-center gap-5 mb-12 bg-slate-900/40 border border-white/8 p-4 rounded-[20px] backdrop-blur-[20px]">
        <div className="relative flex items-center w-full">
          <Search
            className="absolute left-[18px] text-slate-500 pointer-events-none"
            size={20}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาตามชื่อ, รายละเอียด หรือประเภท..."
            className="w-full py-3.5 pl-[50px] pr-4 text-[15px] rounded-xl border border-white/10 bg-slate-950/60 text-slate-50 outline-none transition-all duration-250 focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10 focus:bg-slate-950/80"
            aria-label="ค้นหาแพลตฟอร์ม AI"
          />
        </div>

        <div className="flex gap-2">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              className={`flex items-center gap-2 px-[18px] py-3 text-sm font-medium rounded-xl border border-transparent bg-transparent text-slate-400 cursor-pointer transition-all duration-200 hover:bg-white/4 hover:text-slate-50 ${
                category === item
                  ? "bg-white/8! text-teal-400! border-teal-500/20! shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                  : ""
              }`}
              onClick={() => setCategory(item)}
            >
              {getCategoryIcon(item)}
              <span>{item === "All" ? "ทั้งหมด" : item}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
        {filteredPlatforms.map((platform) => (
          <a
            key={platform.id}
            href={platform.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col justify-between p-7 rounded-[20px] bg-slate-900/45 border border-white/8 text-inherit no-underline transition-all duration-300 relative overflow-hidden backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.2)] before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-[3px] before:bg-[var(--accent-color)] before:opacity-70 before:transition-opacity before:duration-200 hover:before:opacity-100 hover:-translate-y-1.5 hover:border-white/15 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.6)]"
            style={{ "--accent-color": platform.accent } as React.CSSProperties}
            onClick={() => handleCardClick(platform.name)}
          >
            <div className="flex items-center justify-between mb-6">
              <span className="text-[11px] font-semibold uppercase px-2.5 py-1 rounded-lg bg-white/5 text-slate-400 tracking-wider border border-white/3">
                {platform.category}
              </span>
              {platform.plan && (
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-teal-500/5 text-[#2dd4bf] border border-teal-500/15">
                  {platform.plan}
                </span>
              )}
            </div>

            <div className="mb-7 flex-grow">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-color)] shadow-[0_0_10px_var(--accent-color)]" />
                <h3 className="text-22px font-semibold text-white">
                  {platform.name}
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-slate-400 font-light">
                {platform.description}
              </p>
            </div>

            <div className="flex items-center justify-between pt-[18px] border-t border-white/4 text-slate-500 text-sm font-medium transition-all duration-200 group-hover:text-white">
              <span>เปิดใช้งานแพลตฟอร์ม</span>
              <ExternalLink
                size={16}
                className="transition-transform duration-200 group-hover:translate-x-[3px] group-hover:-translate-y-[3px] group-hover:text-[var(--accent-color)]"
              />
            </div>
          </a>
        ))}

        {filteredPlatforms.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-400 text-base">
            <p>ไม่พบแพลตฟอร์ม AI ที่ตรงกับการค้นหา</p>
          </div>
        )}
      </div>
    </div>
  );
}
