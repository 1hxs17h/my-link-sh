"use client";

import { useEffect, useState } from "react";
import { useMyLinkStore } from "@/lib/store";
import { loginWithGoogle, logout } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Link from "next/link";

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
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

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
      await logout();
    } catch (error) {
      console.error("로그아웃 중 오류가 발생했습니다:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // 디스플레이 네임: 이메일 앞부분(아이디) 우선 사용
  const displayName = user?.email
    ? user.email.split("@")[0]
    : user?.displayName || "홍길동";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/90 backdrop-blur-md">
      <div className="max-w-md mx-auto px-5 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="font-bold text-base tracking-tight text-foreground flex items-center gap-1.5 hover:opacity-85 transition-opacity"
        >
          <span className="text-primary font-black text-lg">🔗</span>
          <span>MyLink</span>
        </Link>

        <div className="flex items-center gap-2.5">
          {authLoading ? (
            <div className="h-8 w-24 bg-muted/60 rounded-lg animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground/90">
                {displayName}님
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={isProcessing}
                className="h-7 rounded-lg px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {isProcessing ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  "로그아웃"
                )}
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogin}
              disabled={isProcessing}
              className="h-8 rounded-lg px-3 text-xs font-medium flex items-center gap-1.5 shadow-2xs hover:bg-muted/80 cursor-pointer"
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
  );
}
export default Header;
