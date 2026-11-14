"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useMyLinkStore } from "@/lib/store";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { SocialLinksBar } from "@/components/profile/SocialLinksBar";
import { SectionHeader } from "@/components/profile/SectionHeader";
import { LinkCard } from "@/components/profile/LinkCard";
import { AddLinkDialog } from "@/components/profile/AddLinkDialog";
import { Footer } from "@/components/profile/Footer";
import { getAnonymousLinks, getCreatedAtMillis } from "@/lib/links";

const emptySubscribe = () => () => {};

export default function Home() {
  const { profile, blocks, setBlocks } = useMyLinkStore();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("mylink-storage");
    }

    let isSubscribed = true;

    // 페이지 로드 시 Firestore 'users/anonymous/links'에서 최신순으로 링크 불러오기
    const loadLinks = async () => {
      try {
        setLoading(true);
        const links = await getAnonymousLinks();
        if (isSubscribed) {
          setBlocks(links);
        }
      } catch (error) {
        console.error("Firestore 링크 로드 실패:", error);
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    loadLinks();

    return () => {
      isSubscribed = false;
    };
  }, [setBlocks]);

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
      <div className="max-w-md mx-auto px-5 py-12 flex flex-col min-h-screen">
        {/* 프로필 섹션 */}
        <section className="mb-6">
          <ProfileHeader profile={profile} />
        </section>

        {/* 소셜 링크 섹션 */}
        <section className="mb-10">
          <SocialLinksBar socials={profile.socials} />
        </section>

        {/* 메인 링크 및 섹션 블록 */}
        <section className="flex-1 flex flex-col">
          {/* 상단 링크 추가 다이얼로그 버튼 */}
          <div className="mb-2">
            <AddLinkDialog />
          </div>

          {loading ? (
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
            <div className="py-12 text-center text-muted-foreground text-sm">
              등록된 링크가 아직 없어요.
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
        </section>

        {/* 푸터 */}
        <Footer />
      </div>
    </main>
  );
}
