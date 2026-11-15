"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useMyLinkStore } from "@/lib/store";
import { useLinks } from "@/hooks/useLinks";
import { useProfile } from "@/hooks/useProfile";
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
import { Loader2 } from "lucide-react";

const emptySubscribe = () => () => {};

export default function Home() {
  const { user, authLoading, initAuth } = useMyLinkStore();
  const { profile } = useProfile(user);
  const { blocks, isLoading } = useLinks(user?.uid);
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

        {/* 메인 콘텐츠 영역 */}
        <section className="flex-1 flex flex-col">
          {authLoading || isLoading ? (
            // 로딩 상태 스켈레톤
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
          ) : (
            <>
              {/* 로그인 상태일 때만 상단 링크 추가 다이얼로그 노출 */}
              {user && (
                <div className="mb-3">
                  <AddLinkDialog />
                </div>
              )}

              {sortedBlocks.length === 0 ? (
                <div className="py-12 px-4 text-center rounded-2xl border border-dashed border-border bg-white space-y-1">
                  <p className="font-semibold text-foreground text-sm">
                    등록된 링크가 아직 없어요
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user
                      ? "상단의 '새 링크 추가' 버튼을 눌러 링크를 등록해 보세요."
                      : "곧 새로운 링크가 등록될 예정이에요."}
                  </p>
                </div>
              ) : (
                sortedBlocks.map((block) => {
                  if (block.type === "header") {
                    return <SectionHeader key={block.id} title={block.title} />;
                  }
                  if (block.type === "link") {
                    return (
                      <LinkCard
                        key={block.id}
                        block={block}
                        readOnly={!user}
                        ownerUserId={user?.uid}
                      />
                    );
                  }
                  return null;
                })
              )}

              {/* 비로그인 방문자 안내 배너 */}
              {!user && (
                <div className="mt-5 p-4 rounded-2xl bg-white border border-border/80 flex items-center justify-between gap-3 shadow-xs">
                  <div className="text-left space-y-0.5 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">
                      나만의 링크 페이지 만들기
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      Google 계정으로 내 링크를 모아보세요
                    </p>
                  </div>
                  <Button
                    onClick={handleLogin}
                    disabled={isLoggingIn}
                    size="sm"
                    className="h-8 px-3 rounded-xl bg-primary text-primary-foreground font-medium text-xs flex items-center gap-1.5 shrink-0 shadow-none hover:bg-primary/90"
                  >
                    {isLoggingIn ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <>
                        <GoogleIcon className="size-3" />
                        <span>시작하기</span>
                      </>
                    )}
                  </Button>
                </div>
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
