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
    <div className="hub-container">
      <header className="hub-header">
        <div className="user-profile-bar">
          <div className="user-info">
            <span className="user-badge">{userProfile.role}</span>
            <span className="user-name">{userProfile.name}</span>
            {userProfile.role === "นิสิต" && (
              <span className="user-subinfo">
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
              <span className="user-subinfo">
                หน่วยงาน: {userProfile.department}
              </span>
            )}
          </div>
          <button type="button" className="logout-btn" onClick={onLogout}>
            เปลี่ยนข้อมูลผู้ใช้
          </button>
        </div>

        <div className="hub-brand">
          <img src="/logo.png" alt="MSU Logo" className="hub-logo-img h-20" />
          <div>
            <span className="hub-eyebrow">LIB AI PLATFORMS</span>
            <h1 className="hub-title">ศูนย์รวมเครื่องมือ AI</h1>
          </div>
        </div>
        <p className="hub-subtitle">
          เลือกใช้งานเครื่องมือปัญญาประดิษฐ์ชั้นนำตามความเหมาะสมของงาน
          โดยเชื่อมต่อไปยังระบบหลักของแต่ละแพลตฟอร์มโดยตรง
        </p>
      </header>

      <section className="hub-controls">
        <div className="search-wrapper">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาตามชื่อ, รายละเอียด หรือประเภท..."
            className="search-input"
            aria-label="ค้นหาแพลตฟอร์ม AI"
          />
        </div>

        <div className="filter-tabs">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              className={`filter-tab ${category === item ? "active" : ""}`}
              onClick={() => setCategory(item)}
            >
              {getCategoryIcon(item)}
              <span>{item === "All" ? "ทั้งหมด" : item}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="hub-grid">
        {filteredPlatforms.map((platform) => (
          <a
            key={platform.id}
            href={platform.url}
            target="_blank"
            rel="noopener noreferrer"
            className="platform-card"
            style={{ "--accent-color": platform.accent } as React.CSSProperties}
            onClick={() => handleCardClick(platform.name)}
          >
            <div className="card-header">
              <span className="category-badge">{platform.category}</span>
              {platform.plan && (
                <span className="plan-badge">{platform.plan}</span>
              )}
            </div>

            <div className="card-body">
              <div className="title-area">
                <span className="accent-dot" />
                <h3 className="platform-name">{platform.name}</h3>
              </div>
              <p className="platform-desc">{platform.description}</p>
            </div>

            <div className="card-footer">
              <span className="card-link-text">เปิดใช้งานแพลตฟอร์ม</span>
              <ExternalLink size={16} className="link-icon" />
            </div>
          </a>
        ))}

        {filteredPlatforms.length === 0 && (
          <div className="no-results">
            <p>ไม่พบแพลตฟอร์ม AI ที่ตรงกับการค้นหา</p>
          </div>
        )}
      </div>
    </div>
  );
}
