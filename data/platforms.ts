export type AiPlatform = {
  id: string;
  name: string;
  plan?: string;
  category: "Chat" | "Research" | "Writing" | "Search";
  url: string;
  description: string;
  accent: string;
  embedRisk: "medium" | "high";
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
    embedRisk: "high",
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
    embedRisk: "high",
  },
  {
    id: "claude",
    name: "Claude",
    plan: "Pro",
    category: "Chat",
    url: "https://claude.ai",
    description:
      "ผู้ช่วย AI สำหรับอ่านเอกสารยาว วิเคราะห์ และเขียนอย่างเป็นระบบ",
    accent: "#d97745",
    embedRisk: "high",
  },
  {
    id: "consensus-pro",
    name: "Consensus",
    plan: "Pro",
    category: "Research",
    url: "https://consensus.app",
    description: "ค้นคว้าคำตอบจากงานวิจัยและบทความวิชาการ",
    accent: "#1f7a8c",
    embedRisk: "medium",
  },

  {
    id: "scispace",
    name: "SciSpace",
    plan: "Premium",
    category: "Research",
    url: "https://typeset.io",
    description: "อ่าน อธิบาย และจัดการบทความวิชาการ",
    accent: "#7c3aed",
    embedRisk: "medium",
  },
];
