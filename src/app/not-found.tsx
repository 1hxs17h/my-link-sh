import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";
import { UserX, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-[calc(100vh-56px)] flex items-center justify-center px-5 py-16 bg-background">
      <div className="w-full max-w-sm mx-auto text-center flex flex-col items-center">
        {/* 아이콘 */}
        <div className="size-16 rounded-2xl bg-muted flex items-center justify-center mb-5 text-muted-foreground shadow-xs">
          <UserX className="size-8 text-foreground/70" />
        </div>

        {/* 뱃지 */}
        <span className="text-[11px] font-bold text-primary bg-blue-50 px-2.5 py-0.5 rounded-full mb-3 tracking-wide">
          404 NOT FOUND
        </span>

        {/* 안내 문구 */}
        <h1 className="text-xl font-bold text-foreground tracking-tight mb-2">
          사용자를 찾을 수 없어요
        </h1>
        <p className="text-xs text-muted-foreground leading-relaxed max-w-[280px] mb-8">
          입력하신 사용자 이름에 해당하는 링크 페이지가 존재하지 않거나 주소가 변경되었어요.
        </p>

        {/* 이동 버튼들 */}
        <div className="w-full space-y-2.5">
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "default" }),
              "w-full h-11 rounded-xl bg-primary text-primary-foreground font-medium text-xs flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.99] transition-all cursor-pointer shadow-xs"
            )}
          >
            <Home className="size-4" />
            <span>홈으로 돌아가기</span>
          </Link>

          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "w-full h-10 rounded-xl border-border text-foreground font-medium text-xs flex items-center justify-center gap-2 hover:bg-muted/70 active:scale-[0.99] transition-all cursor-pointer shadow-none"
            )}
          >
            <ArrowLeft className="size-3.5 text-muted-foreground" />
            <span>내 MyLink 페이지 만들기</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
