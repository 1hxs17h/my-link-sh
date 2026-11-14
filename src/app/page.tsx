"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useMyLinkStore } from "@/lib/store";
import { loginWithGoogle } from "@/lib/auth";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { SocialLinksBar } from "@/components/profile/SocialLinksBar";
import { SectionHeader } from "@/components/profile/SectionHeader";
import { LinkCard } from "@/components/profile/LinkCard";
import { AddLinkDialog } from "@/components/profile/AddLinkDialog";
import { Footer } from "@/components/profile/Footer";
import { GoogleIcon } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { getCreatedAtMillis } from "@/lib/links";
import { Lock, Loader2, Sparkles, ShieldCheck, Zap } from "lucide-react";

const emptySubscribe = () => () => {};

export default function Home() {
  const { profile, blocks, isLoading, user, authLoading, initAuth } =
    useMyLinkStore();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("mylink-storage");
    }
    // onAuthStateChanged 기반 인증 상태 감지 초기화
    initAuth();
  }, [initAuth]);

  const handleLogin = async () => {
    try {
      setIsLoggingIn(true);
      await loginWithGoogle();
    } catch (error) {
      console.error("로그인 실패:", error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (!mounted) {
    return <div className="min-h-screen bg-background" />; // Hydration error 방지
  }

  // blocks 정렬 (isActive가 true인 것만, createdAt 최신순(내림차순) 정렬)
  const sortedBlocks = [...blocks]
    .filter((b) => b.isActive)
    .sort((a, b) => {
      const timeA = getCreatedAtMillis(a.createdAt);
      const timeB = getCreatedAtMillis(b.createdAt);
      if (timeA !== 0 || timeB !== 0) {
        return timeB - timeA; // 최신순 (내림차순)
      }
      return a.order - b.order;
    });

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-5 py-8 flex flex-col min-h-screen">
        {/* 프로필 섹션 */}
        <section className="mb-6">
          <ProfileHeader profile={profile} />
        </section>

        {/* 소셜 링크 섹션 */}
        <section className="mb-8">
          <SocialLinksBar socials={profile.socials} />
        </section>

        {/* 메인 콘텐츠 영역: 로그인 상태에 따른 화면 구성 */}
        <section className="flex-1 flex flex-col">
          {authLoading ? (
            // 인증 상태 감지 중 스켈레톤
            <div className="space-y-3 py-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-full p-4 rounded-2xl bg-white border border-border/70 shadow-xs animate-pulse flex items-center justify-between"
                >
                  <div className="flex-1 space-y-2 pr-4">
                    <div className="h-4 bg-muted rounded w-2/5" />
                    <div className="h-3 bg-muted/60 rounded w-4/5" />
                  </div>
                  <div className="w-5 h-5 bg-muted/50 rounded-full shrink-0" />
                </div>
              ))}
            </div>
          ) : !user ? (
            // 로그아웃 상태: 로그인 후 사용할 수 있도록 안내하는 설명 화면
            <div className="rounded-2xl border border-border/70 bg-white p-6 shadow-xs text-center space-y-5 animate-in fade-in duration-300">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-2xs">
                <Lock className="w-7 h-7 stroke-[1.8]" />
              </div>

              <div className="space-y-1.5">
                <h2 className="text-base font-bold text-foreground tracking-tight">
                  로그인 후 나만의 링크를 관리해보세요
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Google 계정으로 로그인하시면 나만의 개인 링크를
                  <br />
                  자유롭게 등록하고 실시간으로 관리할 수 있어요.
                </p>
              </div>

              {/* 기능 안내 카드 */}
              <div className="bg-slate-50/80 rounded-xl p-3.5 text-left space-y-2.5 border border-slate-100">
                <div className="flex items-center gap-2.5 text-xs text-slate-700">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="font-medium">나만의 링크 모음 프로필 생성</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-700">
                  <Zap className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="font-medium">실시간 링크 추가 · 수정 · 삭제</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-700">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="font-medium">Google 계정 기반의 안전한 개인화 보관</span>
                </div>
              </div>

              <Button
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 shadow-xs hover:bg-primary/90 active:scale-[0.99] transition-all cursor-pointer"
              >
                {isLoggingIn ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <div className="bg-white rounded-full p-1 flex items-center justify-center">
                      <GoogleIcon className="size-3.5" />
                    </div>
                    <span>Google로 로그인하고 시작하기</span>
                  </>
                )}
              </Button>
            </div>
          ) : (
            // 로그인 상태: 개인화된 링크 목록 및 링크 추가 기능
            <>
              {/* 상단 링크 추가 다이얼로그 버튼 */}
              <div className="mb-3">
                <AddLinkDialog />
              </div>

              {isLoading ? (
                <div className="space-y-3 py-1">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-full p-4 rounded-2xl bg-white border border-border/70 shadow-xs animate-pulse flex items-center justify-between"
                    >
                      <div className="flex-1 space-y-2 pr-4">
                        <div className="h-4 bg-muted rounded w-2/5" />
                        <div className="h-3 bg-muted/60 rounded w-4/5" />
                      </div>
                      <div className="w-5 h-5 bg-muted/50 rounded-full shrink-0" />
                    </div>
                  ))}
                </div>
              ) : sortedBlocks.length === 0 ? (
                <div className="py-12 px-4 text-center rounded-2xl border border-dashed border-border/80 bg-white/60 space-y-2">
                  <div className="text-3xl mb-1">🔗</div>
                  <p className="font-semibold text-foreground text-sm">
                    등록된 링크가 아직 없어요
                  </p>
                  <p className="text-xs text-muted-foreground">
                    상단의 &apos;새 링크 추가&apos; 버튼을 눌러 첫 번째 링크를 등록해보세요!
                  </p>
                </div>
              ) : (
                sortedBlocks.map((block) => {
                  if (block.type === "header") {
                    return <SectionHeader key={block.id} title={block.title} />;
                  }
                  if (block.type === "link") {
                    return <LinkCard key={block.id} block={block} />;
                  }
                  return null;
                })
              )}
            </>
          )}
        </section>

        {/* 푸터 */}
        <Footer />
      </div>
    </main>
  );
}
