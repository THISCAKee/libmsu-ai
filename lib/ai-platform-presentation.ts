import type { Language } from "../components/LanguageProvider.tsx";
import type { AiPlatform } from "../data/platforms.ts";

export type AiPlatformPresentation =
  | { interactive: false; actionLabel: string }
  | { interactive: true; href: string; actionLabel: string };

const ACTION_COPY = {
  th: {
    open: "เปิดใช้งาน",
    maintenance: "อยู่ระหว่างการปรับปรุง",
  },
  en: {
    open: "Open platform",
    maintenance: "Under maintenance",
  },
} as const;

export function getAiPlatformPresentation(
  platform: AiPlatform,
  language: Language,
): AiPlatformPresentation {
  if (platform.maintenance) {
    return {
      interactive: false,
      actionLabel: ACTION_COPY[language].maintenance,
    };
  }

  return {
    interactive: true,
    href: platform.url,
    actionLabel: ACTION_COPY[language].open,
  };
}
