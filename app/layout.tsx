import type { Metadata } from "next";
import { Anuphan } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

const anuphan = Anuphan({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-anuphun",
});

export const metadata: Metadata = {
  title: "LIB AI Hub",
  description: "Central workspace for AI platforms.",
  icons: {
    icon: "/logotab.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body className={anuphan.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
