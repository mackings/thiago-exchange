import { Geist_Mono, Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import { AdminScope } from "@/components/admin/AdminScope";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-admin-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-admin-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-admin-mono",
  subsets: ["latin"],
});

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${plusJakartaSans.variable} ${spaceGrotesk.variable} ${geistMono.variable}`}>
      <AdminScope>{children}</AdminScope>
    </div>
  );
}
