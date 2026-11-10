"use client";

import { useEffect, useState } from "react";
import { useMyLinkStore } from "@/lib/store";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { SocialLinksBar } from "@/components/profile/SocialLinksBar";
import { SectionHeader } from "@/components/profile/SectionHeader";
import { LinkCard } from "@/components/profile/LinkCard";
import { AddLinkDialog } from "@/components/profile/AddLinkDialog";
import { Footer } from "@/components/profile/Footer";

export default function Home() {
  const { profile, blocks } = useMyLinkStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("mylink-storage");
    }
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-background" />; // Hydration error 방지
  }

  // blocks 정렬 (isActive가 true인 것만, order 순으로 정렬)
  const sortedBlocks = [...blocks]
    .filter((b) => b.isActive)
    .sort((a, b) => a.order - b.order);

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

          {sortedBlocks.map((block) => {
            if (block.type === "header") {
              return <SectionHeader key={block.id} title={block.title} />;
            }
            if (block.type === "link") {
              return <LinkCard key={block.id} block={block} />;
            }
            return null;
          })}
        </section>

        {/* 푸터 */}
        <Footer />
      </div>
    </main>
  );
}
