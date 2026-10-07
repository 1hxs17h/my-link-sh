"use client";

import React, { useState, useEffect } from "react";
import {
  Globe,
  Mail,
  ChevronRight,
  Heart,
  Share2,
  Check,
  Sparkles,
  MapPin,
  Code2,
  Layers,
  Terminal,
} from "lucide-react";

// ==========================================
// 🐱 GitHub SVG Component
// ==========================================
function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
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
// 💡 토스 디자인 시스템(TDS) 프로필 데이터
// 보이스앤톤: 친절하고 유능한 "해요체" 적용
// ==========================================
const PROFILE_DATA = {
  name: "한서희",
  englishName: "Seohee Han",
  role: "프론트엔드 개발자",
  statusBadge: "새로운 기회를 찾고 있어요",
  bio: "사용자 경험과 문제 해결에 몰입하는 프론트엔드 개발자예요. 복잡한 아이디어를 직관적이고 매끄러운 웹 인터페이스로 구현하는 일을 가장 좋아해요.",
  location: "서울시 강남구",
  email: "hanseohee03@naver.com",
  stats: [
    { label: "주요 스택", value: "프론트엔드", sub: "React · Next.js" },
    { label: "현재 상태", value: "열린 기회", sub: "커피챗 환영해요" },
    { label: "작업 성향", value: "사용자 중심", sub: "직관적인 UI" },
  ],
  links: [
    {
      id: "github",
      title: "GitHub 코드 저장소",
      description: "오픈소스 기여와 개발 프로젝트를 둘러볼 수 있어요",
      url: "https://github.com/1hxs17h",
      icon: GithubIcon,
      isBrand: true,
    },
    {
      id: "blog",
      title: "기술 블로그 & 기록",
      description: "배운 지식과 문제 해결 과정을 꾸준히 기록해요",
      url: "https://github.com/1hxs17h",
      icon: Globe,
      isBrand: false,
    },
    {
      id: "projects",
      title: "주요 프로젝트 모음",
      description: "직접 개발한 웹 애플리케이션과 작업물이에요",
      url: "https://github.com/1hxs17h?tab=repositories",
      icon: Code2,
      isBrand: true,
    },
    {
      id: "email",
      title: "이메일로 문의하기",
      description: "협업 제안이나 기술 질문 언제든 편하게 보내주세요",
      url: "mailto:hanseohee03@naver.com",
      icon: Mail,
      isBrand: false,
    },
  ],
  techChips: [
    "Next.js 16",
    "React 19",
    "TypeScript",
    "Tailwind CSS",
    "Git & GitHub",
    "Figma",
  ],
};

export default function Home() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [likes, setLikes] = useState(54);
  const [isLiked, setIsLiked] = useState(false);
  const [isCopiedEmail, setIsCopiedEmail] = useState(false);

  // TDS 표준 토스트 타이머
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 2400);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // 프로필 링크 복사
  const handleShare = async () => {
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(window.location.href);
        setToastMessage("프로필 링크를 복사했어요");
      }
    } catch {
      setToastMessage("링크 복사를 지원하지 않는 환경이에요");
    }
  };

  // 이메일 주소 복사
  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE_DATA.email);
      setIsCopiedEmail(true);
      setToastMessage("이메일 주소를 복사했어요");
      setTimeout(() => setIsCopiedEmail(false), 2000);
    } catch {
      window.location.href = `mailto:${PROFILE_DATA.email}`;
    }
  };

  // 응원하기 (하트)
  const handleLike = () => {
    if (!isLiked) {
      setLikes((prev) => prev + 1);
      setIsLiked(true);
      setToastMessage("따뜻한 응원 감사해요!");
    } else {
      setLikes((prev) => prev - 1);
      setIsLiked(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#F2F4F6] text-[#191F28] flex flex-col items-center justify-start pb-28">
      {/* 🔔 TDS Toast (grey-900 표면 + 흰 텍스트 + green-500 체크) */}
      <div
        className={`fixed top-6 z-50 transition-all duration-200 transform ${
          toastMessage
            ? "translate-y-0 opacity-100 scale-100"
            : "-translate-y-6 opacity-0 pointer-events-none scale-95"
        }`}
      >
        <div className="flex items-center gap-2 px-5 py-3.5 rounded-[14px] bg-[#191F28] text-white text-[15px] font-medium shadow-[0_8px_24px_rgba(25,31,40,0.16)]">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#10B981] text-white shrink-0">
            <Check className="h-3 w-3 stroke-[3]" />
          </div>
          <span>{toastMessage}</span>
        </div>
      </div>

      {/* 📱 모바일 셸 컨테이너 (최대 440px 단일 컬럼) */}
      <div className="w-full max-w-[440px] px-4 pt-4 sm:pt-6 space-y-3.5">
        {/* 1. 상단 내비게이션 바 (TopBar) */}
        <header className="flex h-14 items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <span className="text-[17px] font-bold text-[#191F28] tracking-tight">
              내 프로필
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {/* 응원하기 버튼 */}
            <button
              onClick={handleLike}
              type="button"
              className={`flex h-10 items-center gap-1 px-3 rounded-full text-[14px] font-semibold transition-colors cursor-pointer ${
                isLiked
                  ? "bg-[#FEE2E2] text-[#EF4444]"
                  : "bg-white text-[#4E5968] hover:bg-[#E5E8EB]"
              }`}
              title="응원하기"
            >
              <Heart
                className={`h-4 w-4 ${
                  isLiked ? "fill-[#EF4444] text-[#EF4444]" : "text-[#4E5968]"
                }`}
              />
              <span className="tabular-nums">{likes}</span>
            </button>

            {/* 링크 공유 버튼 */}
            <button
              onClick={handleShare}
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#4E5968] hover:bg-[#E5E8EB] transition-colors cursor-pointer"
              title="프로필 링크 복사하기"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* 2. 메인 프로필 히어로 카드 (TDS White Card, radius-3xl 24px) */}
        <section className="rounded-[24px] bg-white p-6 border border-[#E5E8EB] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          {/* 아바타 & 기본 정보 */}
          <div className="flex items-center gap-4">
            {/* 프로필 이미지 / 모노그램 */}
            <div className="relative flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-full bg-[#E8F3FF] text-[#3182F6] text-xl font-bold border border-[#E5E8EB]">
              <span>SH</span>
            </div>

            {/* 이름 및 직무 */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h1 className="text-[22px] font-bold text-[#191F28] tracking-tight">
                  {PROFILE_DATA.name}
                </h1>
                <span className="text-[14px] text-[#8B95A1] font-normal">
                  {PROFILE_DATA.englishName}
                </span>
              </div>
              <p className="text-[15px] font-medium text-[#4E5968] mt-0.5">
                {PROFILE_DATA.role}
              </p>
            </div>
          </div>

          {/* 상태 뱃지 (Full Pill, blue-50 + blue-500) */}
          <div className="mt-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F3FF] px-3 py-1 text-[13px] font-semibold text-[#3182F6]">
              <span className="h-2 w-2 rounded-full bg-[#3182F6] animate-pulse" />
              <span>{PROFILE_DATA.statusBadge}</span>
            </span>
          </div>

          {/* 해요체 자기소개 (body-2 15px, 1.5 line-height) */}
          <p className="mt-4 text-[15px] leading-[1.5] text-[#4E5968] break-keep">
            {PROFILE_DATA.bio}
          </p>

          {/* 위치 & 이메일 칩 */}
          <div className="mt-5 pt-4 border-t border-[#F2F4F6] flex flex-wrap gap-2 text-[13px]">
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#F2F4F6] text-[#4E5968] font-medium">
              <MapPin className="h-3.5 w-3.5 text-[#8B95A1]" />
              <span>{PROFILE_DATA.location}</span>
            </div>

            <button
              onClick={handleCopyEmail}
              type="button"
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#F2F4F6] text-[#4E5968] font-medium hover:bg-[#E5E8EB] transition-colors cursor-pointer"
            >
              <Mail className="h-3.5 w-3.5 text-[#8B95A1]" />
              <span>{PROFILE_DATA.email}</span>
              {isCopiedEmail ? (
                <Check className="h-3.5 w-3.5 text-[#3182F6] ml-0.5" />
              ) : (
                <span className="text-[12px] text-[#8B95A1] ml-0.5">복사</span>
              )}
            </button>
          </div>
        </section>

        {/* 3. 자산 요약 형태의 서머리 카드 (Toss Asset Card 스타일) */}
        <section className="rounded-[24px] bg-white p-5 border border-[#E5E8EB] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="grid grid-cols-3 divide-x divide-[#F2F4F6] text-center">
            {PROFILE_DATA.stats.map((item) => (
              <div key={item.label} className="px-2 first:pl-0 last:pr-0">
                <span className="text-[12px] font-medium text-[#8B95A1]">
                  {item.label}
                </span>
                <p className="text-[15px] font-bold text-[#191F28] mt-0.5 tracking-tight">
                  {item.value}
                </p>
                <p className="text-[11px] text-[#6B7684] mt-0.5">
                  {item.sub}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. 링크 모음 (TDS ListRow 표준 패턴) */}
        <section className="rounded-[24px] bg-white border border-[#E5E8EB] shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">
          <div className="px-5 pt-4 pb-2">
            <h2 className="text-[13px] font-bold text-[#8B95A1] tracking-tight">
              연결 &amp; 바로가기
            </h2>
          </div>

          <div className="divide-y divide-[#F2F4F6]">
            {PROFILE_DATA.links.map((link) => {
              const IconComponent = link.icon;
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target={link.url.startsWith("http") ? "_blank" : undefined}
                  rel={link.url.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="flex items-center justify-between px-5 py-4 hover:bg-[#F9FAFB] active:bg-[#F2F4F6] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* 44px 아이콘 컨테이너 (radius 14px) */}
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] ${
                        link.isBrand
                          ? "bg-[#E8F3FF] text-[#3182F6]"
                          : "bg-[#F2F4F6] text-[#4E5968]"
                      }`}
                    >
                      <IconComponent className="h-5 w-5" />
                    </div>

                    {/* 제목 및 부제목 */}
                    <div className="flex flex-col min-w-0">
                      <span className="text-[16px] font-semibold text-[#191F28] truncate">
                        {link.title}
                      </span>
                      <span className="text-[13px] text-[#6B7684] truncate mt-0.5">
                        {link.description}
                      </span>
                    </div>
                  </div>

                  {/* 우측 Chevron Arrow */}
                  <div className="shrink-0 pl-2 text-[#B0B8C1] group-hover:text-[#4E5968] group-hover:translate-x-0.5 transition-all">
                    <ChevronRight className="h-5 w-5" />
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        {/* 5. 기술 스택 칩 모음 (TDS Chip full pill) */}
        <section className="rounded-[24px] bg-white p-5 border border-[#E5E8EB] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <h2 className="text-[13px] font-bold text-[#8B95A1] tracking-tight mb-3">
            함께 쓰는 기술들
          </h2>
          <div className="flex flex-wrap gap-2">
            {PROFILE_DATA.techChips.map((tech) => (
              <span
                key={tech}
                className="h-[34px] inline-flex items-center rounded-full bg-[#F2F4F6] px-3.5 text-[13px] font-semibold text-[#4E5968] select-none"
              >
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* 푸터 카피 */}
        <footer className="pt-2 pb-6 text-center">
          <p className="text-[12px] text-[#8B95A1]">
            토스 디자인 시스템(TDS) 가이드라인을 기반으로 만들었어요
          </p>
        </footer>
      </div>

      {/* 6. 하단 단일 고정 액션 (TDS BottomCTA) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex flex-col items-center">
        {/* 상단 24px 보호 그라디언트 */}
        <div className="h-6 w-full bg-gradient-to-t from-[#F2F4F6] to-transparent pointer-events-none" />
        <div className="w-full max-w-[440px] px-4 pb-5 pt-1 bg-[#F2F4F6]">
          <a
            href="mailto:hanseohee03@naver.com"
            className="flex h-14 w-full items-center justify-center rounded-[16px] bg-[#3182F6] text-white text-[17px] font-bold shadow-[0_4px_16px_rgba(49,130,246,0.25)] hover:bg-[#2B72D8] active:scale-[0.98] transition-all cursor-pointer"
          >
            이메일로 커피챗 제안하기
          </a>
        </div>
      </div>
    </main>
  );
}
