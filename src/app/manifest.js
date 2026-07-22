export default function manifest() {
  return {
    id: "/",
    name: "MedCheck — 복약 관리 알리미",
    short_name: "MedCheck",
    description: "돌봄제공자를 위한 복약 체크·기록 서비스",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#0d9488",
    lang: "ko",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
