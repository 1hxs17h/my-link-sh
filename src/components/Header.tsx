"use client";

import { useEffect, useRef, useState } from "react";
import { useMyLinkStore } from "@/lib/store";
import { useProfile } from "@/hooks/useProfile";
import { loginWithGoogle, logout } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PreviewModal } from "@/components/profile/PreviewModal";
import { EditProfileDialog } from "@/components/profile/EditProfileDialog";
import {
  Loader2,
  ChevronDown,
  Eye,
  Copy,
  Check,
  LogOut,
  UserPen,
} from "lucide-react";
import Link from "next/link";
import { cn } from "cn";

export function GoogleIcon({ className = "size-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

export function Header() {
  const { user, authLoading, initAuth } = useMyLinkStore();
  const { profile } = useProfile(user);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // 드롭다운 외부 클릭 및 Esc 키 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [dropdownOpen]);

  const handleLogin = async () => {
    try {
      setIsProcessing(true);
      await loginWithGoogle();
    } catch (error) {
      console.error("로그인 중 오류가 발생했습니다:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsProcessing(true);
      setDropdownOpen(false);
      await logout();
    } catch (error) {
      console.error("로그아웃 중 오류가 발생했습니다:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // 내 링크 복사
  const handleCopyLink = async () => {
    try {
      const shareUrl =
        typeof window !== "undefined" ? window.location.origin : "";
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      console.error("링크 복사 실패:", err);
    }
  };

  // 디스플레이 네임: 프로필 이름 또는 이메일 앞부분(아이디) 우선 사용
  const displayName =
    profile.name ||
    (user?.email ? user.email.split("@")[0] : user?.displayName || "홍길동");

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/90 backdrop-blur-md">
        <div className="max-w-md mx-auto px-5 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="font-bold text-lg tracking-tight text-foreground hover:opacity-85 transition-opacity"
          >
            MyLink
          </Link>

          <div className="flex items-center gap-2">
            {authLoading ? (
              <div className="h-8 w-20 bg-muted rounded-lg animate-pulse" />
            ) : user ? (
              /* 프로필 클릭 시 드롭다운 */
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="h-9 px-2 rounded-full flex items-center gap-1.5 hover:bg-muted/70 active:bg-muted transition-colors cursor-pointer select-none"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  <Avatar className="size-7 border border-border">
                    <AvatarImage
                      src={user.photoURL || undefined}
                      alt={displayName}
                    />
                    <AvatarFallback className="text-[11px] font-semibold text-muted-foreground bg-muted">
                      {displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-foreground max-w-[110px] truncate">
                    {displayName}님
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-3.5 text-muted-foreground transition-transform duration-200",
                      dropdownOpen && "rotate-180"
                    )}
                  />
                </button>

                {/* TDS 스타일 드롭다운 팝오버 */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-border bg-white p-1.5 shadow-[0_4px_24px_rgba(25,31,40,0.08)] z-50 animate-in fade-in-0 zoom-in-95 duration-150 origin-top-right">
                    {/* 계정 요약 정보 */}
                    <div className="px-3 py-2.5">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {displayName}님
                      </p>
                      {user.email && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {user.email}
                        </p>
                      )}
                    </div>

                    <div className="h-px bg-border my-1" />

                    {/* 액션 메뉴 목록 */}
                    <div className="space-y-0.5">
                      {/* 1. 프로필 수정 */}
                      <button
                        type="button"
                        onClick={() => {
                          setDropdownOpen(false);
                          setEditProfileOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 h-9 rounded-xl text-sm text-foreground hover:bg-muted/70 active:bg-muted transition-colors text-left cursor-pointer"
                      >
                        <UserPen className="size-4 text-muted-foreground" />
                        <span>프로필 수정</span>
                      </button>

                      {/* 2. 내 페이지 미리보기 */}
                      <button
                        type="button"
                        onClick={() => {
                          setDropdownOpen(false);
                          setPreviewOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 h-9 rounded-xl text-sm text-foreground hover:bg-muted/70 active:bg-muted transition-colors text-left cursor-pointer"
                      >
                        <Eye className="size-4 text-muted-foreground" />
                        <span>내 페이지 미리보기</span>
                      </button>

                      {/* 3. 내 링크 복사 */}
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="w-full flex items-center justify-between px-3 h-9 rounded-xl text-sm text-foreground hover:bg-muted/70 active:bg-muted transition-colors text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          {isCopied ? (
                            <Check className="size-4 text-primary" />
                          ) : (
                            <Copy className="size-4 text-muted-foreground" />
                          )}
                          <span
                            className={cn(
                              isCopied && "text-primary font-medium"
                            )}
                          >
                            {isCopied ? "링크 복사 완료" : "내 링크 복사"}
                          </span>
                        </div>
                      </button>
                    </div>

                    <div className="h-px bg-border my-1" />

                    {/* 3. 로그아웃 */}
                    <div>
                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isProcessing}
                        className="w-full flex items-center gap-2.5 px-3 h-9 rounded-xl text-sm text-destructive hover:bg-destructive/10 active:bg-destructive/15 transition-colors text-left cursor-pointer"
                      >
                        {isProcessing ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <LogOut className="size-4" />
                        )}
                        <span>로그아웃</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogin}
                disabled={isProcessing}
                className="h-8 rounded-xl px-3 text-xs font-medium border border-border flex items-center gap-1.5 hover:bg-muted/70 cursor-pointer shadow-none"
              >
                {isProcessing ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <>
                    <GoogleIcon className="size-3.5" />
                    <span>Google로 로그인</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* 내 페이지 미리보기 모달 */}
      <PreviewModal open={previewOpen} onOpenChange={setPreviewOpen} />

      {/* 프로필 수정 모달 */}
      <EditProfileDialog
        open={editProfileOpen}
        onOpenChange={setEditProfileOpen}
      />
    </>
  );
}
export default Header;
