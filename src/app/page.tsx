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
import { Lock, Loader2 } from "lucide-react";

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
            // 로그아웃 상태: 정제된 TDS 스타일의 로그인 안내 카드
            <div className="rounded-2xl border border-border bg-white p-8 text-center flex flex-col items-center">
              <div className="size-11 rounded-full bg-muted flex items-center justify-center mb-3.5 text-muted-foreground">
                <Lock className="size-5 text-foreground/75" />
              </div>

              <h2 className="text-base font-bold text-foreground mb-1.5 tracking-tight">
                로그인 후 링크를 관리할 수 있어요
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-[260px] mb-6">
                Google 계정으로 로그인하면 나만의 링크를 등록하고 언제든지 수정할 수 있어요.
              </p>

              <Button
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="w-full max-w-[260px] h-10 rounded-xl bg-primary text-primary-foreground font-medium text-xs flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.99] transition-all cursor-pointer shadow-xs"
              >
                {isLoggingIn ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    <GoogleIcon className="size-3.5" />
                    <span>Google로 계속하기</span>
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
                <div className="py-12 px-4 text-center rounded-2xl border border-dashed border-border bg-white space-y-1">
                  <p className="font-semibold text-foreground text-sm">
                    등록된 링크가 아직 없어요
                  </p>
                  <p className="text-xs text-muted-foreground">
                    상단의 &apos;새 링크 추가&apos; 버튼을 눌러 링크를 등록해 보세요.
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
