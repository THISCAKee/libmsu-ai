import type { ReactNode } from "react";
import { Bai_Jamjuree } from "next/font/google";
import "./admin.css";

const baiJamjuree = Bai_Jamjuree({
  subsets: ["thai", "latin"],
  weight: ["500", "600", "700"],
  variable: "--font-admin-display",
});

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className={baiJamjuree.variable}>{children}</div>;
}
