import type { Metadata } from "next";

import { AdminPortal } from "@/components/admin/AdminPortal";

export const metadata: Metadata = {
  title: "Admin Dashboard | LIB AI Hub",
  description: "สถิติการใช้งานแพลตฟอร์ม AI ของสำนักวิทยบริการ",
};

export default function AdminPage() {
  return <AdminPortal />;
}
