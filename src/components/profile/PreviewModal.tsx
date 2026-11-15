"use client";

import { useMyLinkStore } from "@/lib/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SocialLinksBar } from "./SocialLinksBar";
import { ExternalLink, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { getCreatedAtMillis } from "@/lib/links";

interface PreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PreviewModal({ open, onOpenChange }: PreviewModalProps) {
  const { profile, blocks } = useMyLinkStore();
  const [copied, setCopied] = useState(false);

  const activeBlocks = [...blocks]
    .filter((b) => b.isActive)
    .sort((a, b) => {
      const timeA = getCreatedAtMillis(a.createdAt);
      const timeB = getCreatedAtMillis(b.createdAt);
      if (timeA !== 0 || timeB !== 0) return timeB - timeA;
      return a.order - b.order;
    });

  const handleCopy = async () => {
    try {
      const url = typeof window !== "undefined" ? window.location.origin : "";
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("링크 복사 실패:", e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full p-0 overflow-hidden rounded-2xl bg-white border border-border">
        <DialogHeader className="px-5 py-4 border-b border-border flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-base font-bold text-foreground">
              내 페이지 미리보기
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              방문자에게 표시되는 화면이에요
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="h-8 text-xs px-2.5 rounded-lg flex items-center gap-1.5 cursor-pointer mr-6 shadow-none border-border"
          >
            {copied ? (
              <>
                <Check className="size-3.5 text-primary" />
                <span className="text-primary font-medium">복사됨</span>
              </>
            ) : (
              <>
                <Copy className="size-3.5 text-muted-foreground" />
                <span>링크 복사</span>
              </>
            )}
          </Button>
        </DialogHeader>

        {/* 방문자 뷰 영역 */}
        <div className="max-h-[75vh] overflow-y-auto px-5 py-8 bg-background">
          <div className="max-w-sm mx-auto flex flex-col items-center text-center">
            {/* 프로필 정보 */}
            <Avatar className="h-20 w-20 border border-border shadow-xs mb-3">
              <AvatarImage src={profile.avatarUrl} alt={profile.name} />
              <AvatarFallback className="text-base font-semibold">
                {profile.name.slice(0, 2)}
              </AvatarFallback>
            </Avatar>

            {profile.username && (
              <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-blue-50 px-2 py-0.5 rounded-full mb-1">
                <span>@{profile.username}</span>
              </div>
            )}
            <h3 className="text-xl font-bold text-foreground tracking-tight">
              {profile.name}
            </h3>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              {profile.role}
            </p>

            {profile.statusBadge && (
              <Badge
                variant="secondary"
                className="mt-2.5 px-3 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-primary border-none"
              >
                {profile.statusBadge}
              </Badge>
            )}

            {profile.bio && (
              <p className="text-xs text-foreground/80 mt-2.5 max-w-[280px] whitespace-pre-wrap leading-relaxed">
                {profile.bio}
              </p>
            )}

            {/* 소셜 링크 */}
            <div className="w-full my-6">
              <SocialLinksBar socials={profile.socials} />
            </div>

            {/* 방문자 링크 카드 목록 (실제 LinkCard 스타일과 통일) */}
            <div className="w-full space-y-3 text-left">
              {activeBlocks.length === 0 ? (
                <div className="py-10 text-center text-xs text-muted-foreground bg-white rounded-2xl border border-dashed border-border">
                  등록된 링크가 아직 없어요.
                </div>
              ) : (
                activeBlocks.map((block) => (
                  <a
                    key={block.id}
                    href={block.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 rounded-2xl bg-white border border-border/80 shadow-xs hover:border-primary/40 hover:shadow-md transition-all duration-200 group cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 pr-2 flex-1">
                        <h4 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                          {block.title}
                        </h4>
                        {block.description && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {block.description}
                          </p>
                        )}
                      </div>
                      <ExternalLink className="size-4 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
