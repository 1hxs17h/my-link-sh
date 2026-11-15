"use client";

import { notFound } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getUserByDisplayName } from "@/lib/profile";
import { getUserLinks, getCreatedAtMillis } from "@/lib/links";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "cn";
import { SocialLinksBar } from "@/components/profile/SocialLinksBar";
import { SectionHeader } from "@/components/profile/SectionHeader";
import { Footer } from "@/components/profile/Footer";
import { useMyLinkStore } from "@/lib/store";
import {
  ExternalLink,
  Share2,
  Check,
  Edit3,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface UserProfileViewProps {
  displayName: string;
}

export function UserProfileView({ displayName }: UserProfileViewProps) {
  const [copied, setCopied] = useState(false);
  const currentUser = useMyLinkStore((state) => state.user);

  // 1. displayName으로 유저 검색 (Firestore where 쿼리)
  const {
    data: userResult,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useQuery({
    queryKey: ["userProfileByDisplayName", displayName],
    queryFn: async () => {
      return getUserByDisplayName(displayName);
    },
    staleTime: 1000 * 60 * 5, // 5분 캐시
  });

  // 2. 유저의 링크 목록 조회 (users/{userId}/links)
  const {
    data: links = [],
    isLoading: isLinksLoading,
  } = useQuery({
    queryKey: ["userLinksByUserId", userResult?.userId],
    queryFn: async () => {
      if (!userResult?.userId) return [];
      return getUserLinks(userResult.userId);
    },
    enabled: !!userResult?.userId,
    staleTime: 1000 * 60 * 3,
  });

  // 유저 검색이 끝났는데 유저가 없는 경우 404 처리
  if (!isUserLoading && (userResult === null || isUserError)) {
    notFound();
  }

  // 로딩 상태 스켈레톤
  if (isUserLoading || !userResult) {
    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-md mx-auto px-5 py-8 flex flex-col min-h-screen animate-pulse">
          {/* 프로필 스켈레톤 */}
          <div className="flex flex-col items-center text-center space-y-3 mb-6">
            <div className="size-24 rounded-full bg-muted" />
            <div className="h-4 bg-muted rounded-full w-24" />
            <div className="h-6 bg-muted rounded-lg w-36" />
            <div className="h-4 bg-muted rounded-lg w-48" />
          </div>

          {/* 소셜 링크 스켈레톤 */}
          <div className="flex justify-center gap-3 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="size-11 rounded-full bg-muted" />
            ))}
          </div>

          {/* 링크 카드 스켈레톤 */}
          <div className="space-y-3 flex-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-full p-4 rounded-2xl bg-white border border-border shadow-xs flex items-center justify-between"
              >
                <div className="space-y-2 flex-1 pr-4">
                  <div className="h-4 bg-muted rounded w-2/5" />
                  <div className="h-3 bg-muted/60 rounded w-4/5" />
                </div>
                <div className="size-5 bg-muted/50 rounded-full shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  const { userId, profile } = userResult;
  const isOwner = currentUser?.uid === userId;

  // 활성 링크 목록 필터링 및 최신순 정렬
  const activeBlocks = [...links]
    .filter((b) => b.isActive)
    .sort((a, b) => {
      const timeA = getCreatedAtMillis(a.createdAt);
      const timeB = getCreatedAtMillis(b.createdAt);
      if (timeA !== 0 || timeB !== 0) return timeB - timeA;
      return a.order - b.order;
    });

  // 링크 공유/복사 핸들러
  const handleCopyLink = async () => {
    try {
      const shareUrl =
        typeof window !== "undefined" ? window.location.href : "";
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("링크 복사 실패:", e);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-5 py-8 flex flex-col min-h-screen">
        {/* 상단 액션 바 (본인 페이지일 경우 관리 버튼 + 공유 버튼) */}
        <div className="flex items-center justify-between mb-4">
          {isOwner ? (
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "h-8 px-2.5 rounded-xl text-xs font-medium border-border hover:bg-muted/70 text-primary gap-1.5 shadow-none"
              )}
            >
              <Edit3 className="size-3.5" />
              <span>내 링크 관리</span>
            </Link>
          ) : (
            <div />
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="h-8 px-2.5 rounded-xl text-xs font-medium border-border hover:bg-muted/70 gap-1.5 shadow-none ml-auto cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="size-3.5 text-primary" />
                <span className="text-primary font-medium">복사됨</span>
              </>
            ) : (
              <>
                <Share2 className="size-3.5 text-muted-foreground" />
                <span>공유</span>
              </>
            )}
          </Button>
        </div>

        {/* 프로필 정보 영역 */}
        <section className="flex flex-col items-center text-center space-y-3 mb-6">
          <Avatar className="size-24 border border-border shadow-sm">
            <AvatarImage src={profile.avatarUrl} alt={profile.name} />
            <AvatarFallback className="text-xl font-bold bg-muted text-foreground">
              {profile.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-1">
            {profile.username && (
              <div className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-blue-50 px-2.5 py-0.5 rounded-full">
                <span>@{profile.username}</span>
              </div>
            )}
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {profile.name}
            </h1>
            {profile.role && (
              <p className="text-sm font-medium text-muted-foreground">
                {profile.role}
              </p>
            )}
          </div>

          {profile.statusBadge && (
            <Badge
              variant="secondary"
              className="px-3 py-1 font-semibold rounded-full bg-blue-50 text-primary hover:bg-blue-50 border-none text-xs"
            >
              {profile.statusBadge}
            </Badge>
          )}

          {profile.bio && (
            <p className="text-sm text-foreground/85 whitespace-pre-wrap max-w-sm leading-relaxed px-2">
              {profile.bio}
            </p>
          )}
        </section>

        {/* 소셜 링크 영역 */}
        {profile.socials && Object.values(profile.socials).some(Boolean) && (
          <section className="mb-6">
            <SocialLinksBar socials={profile.socials} />
          </section>
        )}

        {/* 링크 목록 영역 (users/{userId}/links) */}
        <section className="flex-1 flex flex-col space-y-3">
          {isLinksLoading ? (
            <div className="space-y-3 py-2 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-full p-4 rounded-2xl bg-white border border-border shadow-xs flex items-center justify-between"
                >
                  <div className="space-y-2 flex-1 pr-4">
                    <div className="h-4 bg-muted rounded w-2/5" />
                    <div className="h-3 bg-muted/60 rounded w-4/5" />
                  </div>
                  <div className="size-5 bg-muted/50 rounded-full shrink-0" />
                </div>
              ))}
            </div>
          ) : activeBlocks.length === 0 ? (
            <div className="py-12 px-4 text-center rounded-2xl border border-dashed border-border bg-white space-y-1">
              <p className="font-semibold text-foreground text-sm">
                등록된 링크가 아직 없어요
              </p>
              <p className="text-xs text-muted-foreground">
                사용자가 아직 공개 링크를 등록하지 않았어요.
              </p>
            </div>
          ) : (
            activeBlocks.map((block) => {
              if (block.type === "header") {
                return <SectionHeader key={block.id} title={block.title} />;
              }

              if (block.type === "link" && block.url) {
                return (
                  <a
                    key={block.id}
                    href={block.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 rounded-2xl bg-white border border-border/80 shadow-xs hover:border-primary/40 hover:shadow-md transition-all duration-200 group cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 pr-2 flex-1 text-left">
                        <h2 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                          {block.title}
                        </h2>
                        {block.description && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {block.description}
                          </p>
                        )}
                      </div>
                      <ExternalLink className="size-4 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
                    </div>
                  </a>
                );
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
