import "./globals.css";
import AuthGate from "@/components/AuthGate";

export const metadata = {
  title: "MedCheck — 복약 관리 알리미",
  description: "돌봄제공자를 위한 복약 체크·기록 서비스",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <AuthGate>{children}</AuthGate>
      </body>
    </html>
  );
}
