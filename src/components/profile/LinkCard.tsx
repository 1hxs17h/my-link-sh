"use client";

import { useState } from "react";
import { LinkBlock } from "@/types/mylink";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMyLinkStore } from "@/lib/store";
import { linkFormSchema, type LinkFormValues } from "@/lib/validations/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DeleteLinkModal } from "./DeleteLinkModal";
import { formatDateTime } from "@/lib/links";
import { Pencil, Trash2, Loader2, ExternalLink, Check, X } from "lucide-react";
import { cn } from "cn";

export function LinkCard({ block }: { block: LinkBlock }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const updateBlock = useMyLinkStore((state) => state.updateBlock);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LinkFormValues>({
    resolver: zodResolver(linkFormSchema),
    mode: "onBlur",
    defaultValues: {
      title: block.title,
      url: block.url || "",
      description: block.description || "",
    },
  });

  const titleValue = useWatch({ control, name: "title" }) || "";
  const descValue = useWatch({ control, name: "description" }) || "";

  const updatedAtFormatted = formatDateTime(block.updatedAt);

  if (block.type !== "link" || !block.isActive || !block.url) return null;

  // 인라인 수정 취소 핸들러
  const handleCancel = () => {
    reset({
      title: block.title,
      url: block.url || "",
      description: block.description || "",
    });
    setSubmitError(null);
    setIsEditing(false);
  };

  // 인라인 수정 제출 핸들러
  const onSubmit = async (data: LinkFormValues) => {
    try {
      setSubmitError(null);
      let formattedUrl = data.url.trim();
      if (!/^https?:\/\//i.test(formattedUrl) && !/^mailto:/i.test(formattedUrl)) {
        formattedUrl = `https://${formattedUrl}`;
      }

      await updateBlock(block.id, {
        title: data.title.trim(),
        url: formattedUrl,
        description: data.description?.trim() || undefined,
      });

      setIsEditing(false);
    } catch (error) {
      console.error("링크 수정 중 오류가 발생했습니다:", error);
      setSubmitError("링크 수정 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <>
      <Card
        className={cn(
          "w-full mb-3 rounded-2xl border border-border/80 bg-white shadow-xs transition-all duration-200",
          isEditing ? "p-4 sm:p-5 ring-2 ring-primary/20 border-primary/50" : "p-4 hover:border-primary/40 hover:shadow-md"
        )}
      >
        {isEditing ? (
          /* 인라인 수정 모드 */
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Pencil className="h-3.5 w-3.5 text-primary" />
                링크 정보 수정
              </span>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="text-muted-foreground hover:text-foreground text-xs p-1 rounded-md transition-colors"
                title="수정 취소"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3.5">
              {/* 제목 필드 */}
              <div className="space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`edit-title-${block.id}`} className="text-xs font-semibold text-foreground">
                    링크 제목 <span className="text-destructive">*</span>
                  </Label>
                  <span
                    className={cn(
                      "text-[11px] tabular-nums",
                      titleValue.length > 30 ? "text-destructive font-semibold" : "text-muted-foreground"
                    )}
                  >
                    {titleValue.length}/30자
                  </span>
                </div>
                <Input
                  id={`edit-title-${block.id}`}
                  placeholder="예: 최신 프로젝트, 기술 블로그"
                  {...register("title")}
                  aria-invalid={!!errors.title}
                  className={cn(
                    "h-10 rounded-xl bg-secondary/50 border-border focus:bg-background transition-colors text-sm",
                    errors.title && "border-destructive focus-visible:ring-destructive/30 bg-destructive/5"
                  )}
                  autoFocus
                />
                {errors.title && (
                  <p className="text-xs font-medium text-destructive animate-in fade-in-50 mt-1">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* URL 필드 */}
              <div className="space-y-1.5 text-left">
                <Label htmlFor={`edit-url-${block.id}`} className="text-xs font-semibold text-foreground">
                  연결할 주소 (URL) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={`edit-url-${block.id}`}
                  placeholder="https://example.com"
                  {...register("url")}
                  aria-invalid={!!errors.url}
                  className={cn(
                    "h-10 rounded-xl bg-secondary/50 border-border focus:bg-background transition-colors text-sm",
                    errors.url && "border-destructive focus-visible:ring-destructive/30 bg-destructive/5"
                  )}
                />
                {errors.url && (
                  <p className="text-xs font-medium text-destructive animate-in fade-in-50 mt-1">
                    {errors.url.message}
                  </p>
                )}
              </div>

              {/* 부가 설명 필드 */}
              <div className="space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`edit-desc-${block.id}`} className="text-xs font-semibold text-foreground">
                    부가 설명 <span className="text-muted-foreground font-normal">(선택)</span>
                  </Label>
                  <span
                    className={cn(
                      "text-[11px] tabular-nums",
                      descValue.length > 80 ? "text-destructive font-semibold" : "text-muted-foreground"
                    )}
                  >
                    {descValue.length}/80자
                  </span>
                </div>
                <Input
                  id={`edit-desc-${block.id}`}
                  placeholder="링크에 대한 간단한 소개를 남겨보세요"
                  {...register("description")}
                  aria-invalid={!!errors.description}
                  className={cn(
                    "h-10 rounded-xl bg-secondary/50 border-border focus:bg-background transition-colors text-sm",
                    errors.description && "border-destructive focus-visible:ring-destructive/30 bg-destructive/5"
                  )}
                />
                {errors.description && (
                  <p className="text-xs font-medium text-destructive animate-in fade-in-50 mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* 저장 에러 메시지 */}
              {submitError && (
                <div className="p-2.5 text-xs font-medium text-destructive bg-destructive/10 rounded-xl animate-in fade-in-50">
                  {submitError}
                </div>
              )}
            </div>

            {/* 인라인 액션 버튼 */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="h-9 px-3.5 rounded-xl font-medium text-xs"
              >
                취소
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="h-9 px-4 rounded-xl font-semibold text-xs bg-primary hover:bg-primary/90 text-primary-foreground min-w-[76px]"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    저장 중...
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" />
                    수정 완료
                  </span>
                )}
              </Button>
            </div>
          </form>
        ) : (
          /* 일반 링크 카드 모드 (수정/삭제 버튼 항상 표시) */
          <div className="flex items-center justify-between gap-3">
            {/* 링크 클릭 영역 */}
            <a
              href={block.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-between min-w-0 group/link pr-1 cursor-pointer"
            >
              <div className="flex flex-col space-y-1 overflow-hidden pr-2">
                <span className="font-semibold text-foreground text-sm sm:text-base truncate group-hover/link:text-primary transition-colors">
                  {block.title}
                </span>
                {block.description && (
                  <span className="text-xs sm:text-sm text-muted-foreground truncate">
                    {block.description}
                  </span>
                )}
                {updatedAtFormatted && (
                  <span className="text-[11px] text-muted-foreground/60 font-normal">
                    수정됨 {updatedAtFormatted}
                  </span>
                )}
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground/50 group-hover/link:text-primary shrink-0 transition-colors" />
            </a>

            {/* 항상 표시되는 수정/삭제 버튼 */}
            <div className="flex items-center gap-1.5 shrink-0 pl-1 border-l border-border/60">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="h-8 px-2.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                title="링크 수정"
              >
                <Pencil className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                수정
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsDeleteModalOpen(true)}
                className="h-8 px-2.5 rounded-lg text-xs font-medium text-destructive/80 hover:text-destructive hover:bg-destructive/10 transition-colors"
                title="링크 삭제"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                삭제
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* 삭제 확인 모달 */}
      <DeleteLinkModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        link={block}
      />
    </>
  );
}
