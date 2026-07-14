export type AiPlatform = {
  id: string;
  name: string;
  plan?: string;
  category: "Chat" | "Research" | "Writing" | "Search";
  url: string;
  description: string;
  accent: string;
  accentLight: string;
  embedRisk: "medium" | "high";
  logo: string;
};

export const aiPlatforms: AiPlatform[] = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    plan: "Plus / Team",
    category: "Chat",
    url: "https://chatgpt.com",
    description: "สนทนา วิเคราะห์ไฟล์ สร้างเนื้อหา และช่วยเขียนงาน",
    accent: "#10a37f",
    accentLight: "#ecfdf5",
    embedRisk: "high",
    logo: "/logos/chatgpt.svg",
  },
  {
    id: "gemini",
    name: "Gemini",
    plan: "Advanced",
    category: "Chat",
    url: "https://gemini.google.com",
    description:
      "ผู้ช่วย AI ของ Google สำหรับค้นคว้า สรุป และทำงานร่วมกับบัญชี Google",
    accent: "#4285f4",
    accentLight: "#eff6ff",
    embedRisk: "high",
    logo: "/logos/gemini.png",
  },
  {
    id: "claude",
    name: "Claude",
    plan: "Pro",
    category: "Chat",
    url: "https://claude.ai",
    description:
      "ผู้ช่วย AI สำหรับอ่านเอกสารยาว วิเคราะห์ และเขียนอย่างเป็นระบบ",
    accent: "#d97706",
    accentLight: "#fffbeb",
    embedRisk: "high",
    logo: "/logos/claude.png",
  },
  {
    id: "consensus-pro",
    name: "Consensus",
    plan: "Pro",
    category: "Research",
    url: "https://consensus.app",
    description: "ค้นคว้าคำตอบจากงานวิจัยและบทความวิชาการ",
    accent: "#0d9488",
    accentLight: "#f0fdfa",
    embedRisk: "medium",
    logo: "/logos/consensus.png",
  },

  {
    id: "scispace",
    name: "SciSpace",
    plan: "Premium",
    category: "Research",
    url: "https://typeset.io",
    description: "อ่าน อธิบาย และจัดการบทความวิชาการ",
    accent: "#7c3aed",
    accentLight: "#f5f3ff",
    embedRisk: "medium",
    logo: "/logos/scispace.svg",
  },
];
