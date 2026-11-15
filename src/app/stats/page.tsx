"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useMyLinkStore } from "@/lib/store";
import { useLinks } from "@/hooks/useLinks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";
import { ArrowLeft, MousePointerClick, Link2, TrendingUp, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "cn";

const emptySubscribe = () => () => {};

const chartConfig: ChartConfig = {
  clickCount: {
    label: "클릭수",
    color: "hsl(221.2 83.2% 53.3%)",
  },
};

export default function StatsPage() {
  const router = useRouter();
  const { user, authLoading, initAuth } = useMyLinkStore();
  const { blocks, isLoading } = useLinks(user?.uid);
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // 비로그인 시 메인으로 리다이렉트
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/");
    }
  }, [authLoading, user, router]);

  if (!mounted) {
    return <div className="min-h-screen bg-background" />;
  }

  // 로딩 상태 (인증 확인 중 또는 링크 로딩 중)
  if (authLoading || !user) {
    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-lg mx-auto px-5 py-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        </div>
      </main>
    );
  }

  // 활성 링크만 필터
  const activeLinks = blocks.filter(
    (b) => b.type === "link" && b.isActive && b.url
  );

  // 총 클릭 수
  const totalClicks = activeLinks.reduce(
    (sum, link) => sum + (link.clickCount ?? 0),
    0
  );

  // 전체 링크 수
  const totalLinks = activeLinks.length;

  // 클릭 수가 가장 높은 링크
  const topLink = activeLinks.length > 0
    ? activeLinks.reduce((top, link) =>
        (link.clickCount ?? 0) > (top.clickCount ?? 0) ? link : top
      , activeLinks[0])
    : null;

  // 차트 데이터 (클릭수 상위순)
  const chartData = [...activeLinks]
    .sort((a, b) => (b.clickCount ?? 0) - (a.clickCount ?? 0))
    .slice(0, 10) // 최대 10개
    .map((link) => ({
      name:
        link.title.length > 12
          ? link.title.slice(0, 12) + "…"
          : link.title,
      clickCount: link.clickCount ?? 0,
      fullTitle: link.title,
    }));

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-5 py-8 flex flex-col gap-6">
        {/* 상단 네비게이션 */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="h-8 w-8 rounded-xl flex items-center justify-center hover:bg-muted/70 transition-colors"
          >
            <ArrowLeft className="size-4 text-muted-foreground" />
          </Link>
          <h1 className="text-lg font-bold tracking-tight text-foreground">
            링크 통계
          </h1>
        </div>

        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 rounded-2xl bg-muted/50 border border-border"
              />
            ))}
          </div>
        ) : (
          <>
            {/* 요약 카드 3개 */}
            <div className="grid grid-cols-3 gap-3">
              {/* 총 클릭 수 */}
              <Card className="rounded-2xl border-border/80 shadow-xs py-0">
                <CardContent className="px-4 py-4 flex flex-col items-center text-center gap-1.5">
                  <div className="size-9 rounded-full bg-blue-50 flex items-center justify-center">
                    <MousePointerClick className="size-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-foreground tabular-nums">
                    {totalClicks.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-medium">
                    총 클릭수
                  </p>
                </CardContent>
              </Card>

              {/* 링크 수 */}
              <Card className="rounded-2xl border-border/80 shadow-xs py-0">
                <CardContent className="px-4 py-4 flex flex-col items-center text-center gap-1.5">
                  <div className="size-9 rounded-full bg-emerald-50 flex items-center justify-center">
                    <Link2 className="size-4 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-bold text-foreground tabular-nums">
                    {totalLinks}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-medium">
                    링크 수
                  </p>
                </CardContent>
              </Card>

              {/* 평균 클릭 */}
              <Card className="rounded-2xl border-border/80 shadow-xs py-0">
                <CardContent className="px-4 py-4 flex flex-col items-center text-center gap-1.5">
                  <div className="size-9 rounded-full bg-amber-50 flex items-center justify-center">
                    <TrendingUp className="size-4 text-amber-600" />
                  </div>
                  <p className="text-2xl font-bold text-foreground tabular-nums">
                    {totalLinks > 0
                      ? Math.round(totalClicks / totalLinks)
                      : 0}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-medium">
                    평균 클릭
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* 인기 링크 TOP */}
            {topLink && (topLink.clickCount ?? 0) > 0 && (
              <Card className="rounded-2xl border-border/80 shadow-xs">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs font-medium text-muted-foreground">
                    🏆 가장 인기 있는 링크
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm font-bold text-foreground truncate">
                    {topLink.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {(topLink.clickCount ?? 0).toLocaleString()}회 클릭
                  </p>
                </CardContent>
              </Card>
            )}

            {/* 바 차트: 링크별 클릭 수 */}
            {chartData.length > 0 ? (
              <Card className="rounded-2xl border-border/80 shadow-xs">
                <CardHeader>
                  <CardTitle className="text-sm font-bold">
                    링크별 클릭 수
                  </CardTitle>
                  <CardDescription className="text-xs">
                    상위 {chartData.length}개 링크
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={chartConfig}
                    className="h-[280px] w-full"
                  >
                    <BarChart
                      data={chartData}
                      layout="vertical"
                      margin={{ left: 0, right: 16, top: 0, bottom: 0 }}
                    >
                      <CartesianGrid horizontal={false} />
                      <YAxis
                        dataKey="name"
                        type="category"
                        tickLine={false}
                        axisLine={false}
                        width={100}
                        tick={{ fontSize: 11 }}
                      />
                      <XAxis
                        type="number"
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            labelKey="fullTitle"
                            nameKey="clickCount"
                          />
                        }
                      />
                      <Bar
                        dataKey="clickCount"
                        fill="var(--color-clickCount)"
                        radius={[0, 6, 6, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            ) : (
              <Card className="rounded-2xl border-border/80 shadow-xs">
                <CardContent className="py-12 text-center">
                  <p className="text-sm font-semibold text-foreground">
                    아직 클릭 데이터가 없어요
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    링크가 클릭되면 통계가 여기에 표시됩니다.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* 링크별 상세 목록 */}
            {activeLinks.length > 0 && (
              <Card className="rounded-2xl border-border/80 shadow-xs">
                <CardHeader>
                  <CardTitle className="text-sm font-bold">
                    전체 링크 클릭 현황
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="divide-y divide-border/60">
                    {[...activeLinks]
                      .sort(
                        (a, b) =>
                          (b.clickCount ?? 0) - (a.clickCount ?? 0)
                      )
                      .map((link, index) => (
                        <div
                          key={link.id}
                          className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <span
                              className={cn(
                                "text-xs font-bold tabular-nums w-5 text-center shrink-0",
                                index < 3
                                  ? "text-primary"
                                  : "text-muted-foreground"
                              )}
                            >
                              {index + 1}
                            </span>
                            <span className="text-sm font-medium text-foreground truncate">
                              {link.title}
                            </span>
                          </div>
                          <span className="text-sm font-bold text-foreground tabular-nums shrink-0 ml-3">
                            {(link.clickCount ?? 0).toLocaleString()}
                            <span className="text-xs font-normal text-muted-foreground ml-0.5">
                              회
                            </span>
                          </span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </main>
  );
}
