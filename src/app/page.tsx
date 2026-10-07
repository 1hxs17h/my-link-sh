"use client";

import React, { useState, useEffect } from "react";
import {
  Globe,
  Mail,
  ArrowUpRight,
  Heart,
  Share2,
  Check,
  Sparkles,
  MapPin,
  Code2,
  Layers,
  Terminal,
  Laptop,
} from "lucide-react";

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      {...props}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

// ==========================================
// 💡 프로필 설정 데이터 (여기서 손쉽게 정보를 수정할 수 있습니다)
// ==========================================
const PROFILE_DATA = {
  name: "한서희",
  englishName: "Seohee Han",
  role: "Frontend Developer",
  statusBadge: "✨ 협업 & 열린 기회 탐색 중",
  isAvailable: true,
  bio: "사용자 경험과 문제 해결에 몰입하는 프론트엔드 개발자입니다. 아이디어를 매끄러운 인터페이스와 살아 숨쉬는 인터랙션으로 구현하는 것을 즐깁니다.",
  location: "Seoul, Republic of Korea",
  email: "hanseohee03@naver.com",
  tags: [
    "Frontend",
    "React / Next.js",
    "TypeScript",
    "UI/UX Design",
    "Vibe Coding",
  ],
  stats: [
    { label: "Focus", value: "Frontend", sub: "React · Next" },
    { label: "Status", value: "Available", sub: "프로젝트/커피챗" },
    { label: "Location", value: "Seoul", sub: "한국" },
  ],
  links: [
    {
      id: "github",
      title: "GitHub Repository",
      description: "오픈소스 기여 및 개발 프로젝트 소스코드",
      url: "https://github.com/1hxs17h",
      icon: GithubIcon,
      badge: "GitHub",
      gradient: "from-zinc-800 to-zinc-950 dark:from-zinc-700 dark:to-zinc-900",
      highlight: true,
    },
    {
      id: "blog",
      title: "Tech Blog & 기록",
      description: "배운 지식과 문제 해결 과정을 기록하는 공간",
      url: "https://github.com/1hxs17h",
      icon: Globe,
      badge: "Blog",
      gradient: "from-blue-600 to-indigo-600",
      highlight: false,
    },
    {
      id: "projects",
      title: "Featured Projects",
      description: "직접 기획하고 만든 웹 애플리케이션 및 쇼케이스",
      url: "https://github.com/1hxs17h?tab=repositories",
      icon: Code2,
      badge: "Portfolio",
      gradient: "from-purple-600 to-pink-600",
      highlight: false,
    },
    {
      id: "email",
      title: "이메일로 커피챗 신청",
      description: "협업 제안, 기술 질문 언제든 편하게 연락주세요",
      url: "mailto:hanseohee03@naver.com",
      icon: Mail,
      badge: "Contact",
      gradient: "from-emerald-600 to-teal-600",
      highlight: false,
    },
  ],
  techStacks: [
    { name: "Next.js", color: "bg-black text-white dark:bg-white dark:text-black" },
    { name: "React 19", color: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20" },
    { name: "TypeScript", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20" },
    { name: "Tailwind CSS", color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20" },
    { name: "HTML / CSS", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20" },
    { name: "Git & GitHub", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20" },
    { name: "Figma", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20" },
  ],
};

export default function Home() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [likes, setLikes] = useState(28);
  const [isLiked, setIsLiked] = useState(false);
  const [isCopiedEmail, setIsCopiedEmail] = useState(false);

  // 토스트 자동 숨김 타이머
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 2800);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // 프로필 링크 공유 / 복사 핸들러
  const handleShare = async () => {
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(window.location.href);
        setToastMessage("✨ 프로필 링크가 클립보드에 복사되었습니다!");
      }
    } catch {
      setToastMessage("🔗 링크 복사를 지원하지 않는 환경입니다.");
    }
  };

  // 이메일 주소 복사 핸들러
  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE_DATA.email);
      setIsCopiedEmail(true);
      setToastMessage("📬 이메일 주소가 복사되었습니다!");
      setTimeout(() => setIsCopiedEmail(false), 2000);
    } catch {
      window.location.href = `mailto:${PROFILE_DATA.email}`;
    }
  };

  // 응원하기 (하트) 핸들러
  const handleLike = () => {
    if (!isLiked) {
      setLikes((prev) => prev + 1);
      setIsLiked(true);
      setToastMessage("💖 따뜻한 응원 감사합니다!");
    } else {
      setLikes((prev) => prev - 1);
      setIsLiked(false);
    }
  };

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center py-12 px-4 sm:px-6 selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      {/* 🌈 배경 오로라 앰비언트 그라데이션 효과 */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-blue-400/25 via-indigo-400/20 to-transparent blur-[120px] dark:from-blue-600/20 dark:via-indigo-600/15" />
        <div className="absolute top-1/3 -right-40 h-[550px] w-[550px] rounded-full bg-gradient-to-bl from-purple-400/25 via-pink-400/20 to-transparent blur-[130px] dark:from-purple-600/20 dark:via-pink-600/15" />
        <div className="absolute -bottom-40 left-1/3 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-emerald-400/20 via-teal-400/15 to-transparent blur-[120px] dark:from-emerald-600/15 dark:via-teal-600/10" />
      </div>

      {/* 🔔 플로팅 토스트 메시지 */}
      <div
        className={`fixed top-6 z-50 transition-all duration-300 ease-out transform ${
          toastMessage
            ? "translate-y-0 opacity-100 scale-100"
            : "-translate-y-8 opacity-0 pointer-events-none scale-95"
        }`}
      >
        <div className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-zinc-900/90 dark:bg-zinc-100/95 text-white dark:text-zinc-900 shadow-2xl backdrop-blur-md text-sm font-medium border border-white/10 dark:border-zinc-800/20">
          <Sparkles className="h-4 w-4 text-amber-400 dark:text-amber-600 shrink-0 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      </div>

      {/* 📱 메인 프로필 카드 */}
      <div className="relative w-full max-w-lg rounded-[32px] bg-white/75 dark:bg-zinc-900/75 backdrop-blur-2xl p-6 sm:p-9 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] border border-white/80 dark:border-zinc-800/80 transition-all">
        {/* 상단 인터랙션 바 (공유 버튼 & 응원하기) */}
        <div className="flex items-center justify-between pb-6 border-b border-zinc-100 dark:border-zinc-800/80">
          {/* 활동 상태 표시 */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/20 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>{PROFILE_DATA.statusBadge}</span>
          </div>

          {/* 우측 액션 버튼들 */}
          <div className="flex items-center gap-2">
            {/* 응원하기 하트 버튼 */}
            <button
              onClick={handleLike}
              type="button"
              className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border ${
                isLiked
                  ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/50 scale-105"
                  : "bg-zinc-100/80 dark:bg-zinc-800/70 text-zinc-600 dark:text-zinc-400 border-zinc-200/50 dark:border-zinc-700/50 hover:bg-rose-50/50 hover:text-rose-500 hover:border-rose-200"
              }`}
              title="프로필 응원하기"
            >
              <Heart
                className={`h-3.5 w-3.5 transition-transform group-hover:scale-125 ${
                  isLiked ? "fill-rose-500 text-rose-500" : ""
                }`}
              />
              <span>{likes}</span>
            </button>

            {/* 링크 공유 버튼 */}
            <button
              onClick={handleShare}
              type="button"
              className="p-2 rounded-full bg-zinc-100/80 dark:bg-zinc-800/70 text-zinc-600 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-700/50 hover:bg-zinc-200/80 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all duration-200 hover:scale-105 active:scale-95"
              title="프로필 링크 복사"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 👤 프로필 히어로 영역 */}
        <div className="pt-6 flex flex-col items-center text-center">
          {/* 아바타 이미지/모노그램 */}
          <div className="relative mb-5 group">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-blue-500 via-indigo-500 to-pink-500 opacity-80 blur-[6px] group-hover:opacity-100 group-hover:blur-[10px] transition-all duration-500" />
            <div className="relative flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-blue-500 text-3xl sm:text-4xl font-extrabold text-white shadow-xl ring-4 ring-white dark:ring-zinc-900">
              <span className="tracking-tight select-none">SH</span>
            </div>
            {/* 온라인 뱃지 */}
            <div
              className="absolute bottom-1 right-1 h-5 w-5 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-zinc-900 flex items-center justify-center"
              title="활동 중"
            >
              <div className="h-2 w-2 rounded-full bg-white opacity-90" />
            </div>
          </div>

          {/* 이름 & 서브네임 */}
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              {PROFILE_DATA.name}
            </h1>
            <span className="text-sm font-medium text-zinc-400 dark:text-zinc-500">
              ({PROFILE_DATA.englishName})
            </span>
          </div>

          {/* 역할 배지 */}
          <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 px-3.5 py-1 text-xs sm:text-sm font-semibold text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 shadow-xs">
            <Laptop className="h-3.5 w-3.5" />
            <span>{PROFILE_DATA.role}</span>
          </div>

          {/* 한 줄 소개글 */}
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-zinc-600 dark:text-zinc-300 break-keep max-w-md px-2">
            {PROFILE_DATA.bio}
          </p>

          {/* 위치 & 이메일 퀵 뱃지 */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100/70 dark:bg-zinc-800/60 border border-zinc-200/50 dark:border-zinc-700/40">
              <MapPin className="h-3.5 w-3.5 text-zinc-400" />
              <span>{PROFILE_DATA.location}</span>
            </div>
            <button
              onClick={handleCopyEmail}
              type="button"
              className="group flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100/70 dark:bg-zinc-800/60 border border-zinc-200/50 dark:border-zinc-700/40 hover:bg-zinc-200/70 dark:hover:bg-zinc-700/60 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
              title="이메일 주소 복사하기"
            >
              <Mail className="h-3.5 w-3.5 text-zinc-400 group-hover:text-indigo-500" />
              <span>{PROFILE_DATA.email}</span>
              {isCopiedEmail ? (
                <Check className="h-3 w-3 text-emerald-500" />
              ) : (
                <span className="text-[10px] text-zinc-400 underline decoration-dotted">복사</span>
              )}
            </button>
          </div>

          {/* 관심사 / 스킬 키워드 태그들 */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
            {PROFILE_DATA.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* 📊 하이라이트 미니 벤토 (Stats & Focus) */}
        <div className="mt-7 grid grid-cols-3 gap-2.5 sm:gap-3">
          {PROFILE_DATA.stats.map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-zinc-50/90 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/50 text-center transition-all hover:bg-zinc-100/80 dark:hover:bg-zinc-800"
            >
              <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                {item.label}
              </span>
              <span className="mt-0.5 text-sm sm:text-base font-bold text-zinc-800 dark:text-zinc-100">
                {item.value}
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                {item.sub}
              </span>
            </div>
          ))}
        </div>

        {/* 🔗 링크인바이오 카드 섹션 (Featured Links) */}
        <div className="mt-7 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              <span>Connect & Links</span>
            </h2>
            <span className="text-[11px] text-zinc-400">클릭하여 바로가기</span>
          </div>

          {PROFILE_DATA.links.map((link) => {
            const IconComponent = link.icon;
            return (
              <a
                key={link.id}
                href={link.url}
                target={link.url.startsWith("http") ? "_blank" : undefined}
                rel={link.url.startsWith("http") ? "noopener noreferrer" : undefined}
                className={`group relative flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.015] active:scale-[0.99] ${
                  link.highlight
                    ? "bg-gradient-to-r from-blue-50/70 to-indigo-50/70 dark:from-indigo-950/30 dark:to-blue-950/20 border-indigo-200/80 dark:border-indigo-800/50 shadow-sm hover:shadow-indigo-500/10 hover:border-indigo-400"
                    : "bg-zinc-50/80 dark:bg-zinc-800/50 hover:bg-white dark:hover:bg-zinc-800 border-zinc-200/70 dark:border-zinc-700/60 hover:border-zinc-300 dark:hover:border-zinc-600 shadow-xs hover:shadow-md"
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* 아이콘 */}
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr ${link.gradient} text-white shadow-md group-hover:scale-105 group-hover:rotate-2 transition-all duration-300`}
                  >
                    <IconComponent className="h-5 w-5" />
                  </div>

                  {/* 텍스트 정보 */}
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                        {link.title}
                      </span>
                      {link.badge && (
                        <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-200/70 dark:bg-zinc-700/70 text-zinc-700 dark:text-zinc-300">
                          {link.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                      {link.description}
                    </span>
                  </div>
                </div>

                {/* 우측 화살표 아이콘 */}
                <div className="ml-3 shrink-0 p-1.5 rounded-lg text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  <ArrowUpRight className="h-5 w-5 transform transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </a>
            );
          })}
        </div>

        {/* 🛠️ 기술 스택 섹션 */}
        <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5" />
              <span>Skills & Tech Stack</span>
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {PROFILE_DATA.techStacks.map((tech) => (
              <span
                key={tech.name}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-transform hover:scale-105 select-none ${tech.color}`}
              >
                {tech.name}
              </span>
            ))}
          </div>
        </div>

        {/* ☕ 하단 푸터 */}
        <footer className="mt-9 pt-5 border-t border-zinc-100 dark:border-zinc-800/60 flex flex-col items-center justify-center text-center">
          <p className="text-xs text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
            <span>Made with passion & Next.js</span>
            <span>·</span>
            <span>© 2026 {PROFILE_DATA.englishName}</span>
          </p>
        </footer>
      </div>
    </main>
  );
}
