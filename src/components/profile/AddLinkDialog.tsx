"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMyLinkStore } from "@/lib/store";
import { useAddLink } from "@/hooks/useLinks";
import { linkFormSchema, type LinkFormValues } from "@/lib/validations/link";
import { cn } from "cn";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AddLinkDialog() {
  const [open, setOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const user = useMyLinkStore((state) => state.user);
  const { mutateAsync: addLink, isPending: isAdding } = useAddLink(user?.uid);

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
      title: "",
      url: "",
      description: "",
    },
  });

  const titleValue = useWatch({ control, name: "title" }) || "";
  const descValue = useWatch({ control, name: "description" }) || "";

  const onSubmit = async (data: LinkFormValues) => {
    try {
      setSubmitError(null);
      let formattedUrl = data.url.trim();
      if (!/^https?:\/\//i.test(formattedUrl) && !/^mailto:/i.test(formattedUrl)) {
        formattedUrl = `https://${formattedUrl}`;
      }

      await addLink({
        type: "link",
        title: data.title.trim(),
        url: formattedUrl,
        description: data.description?.trim() || undefined,
        isActive: true,
      });

      reset();
      setOpen(false);
    } catch (error) {
      console.error("링크 추가 중 오류가 발생했습니다:", error);
      setSubmitError("링크를 저장하는 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  const isBusy = isSubmitting || isAdding;

  const handleOpenChange = (nextOpen: boolean) => {
    if (isBusy) return;
    setOpen(nextOpen);
    if (!nextOpen) {
      reset();
      setSubmitError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <button
            type="button"
            className="w-full p-4 rounded-2xl bg-white border border-border/80 shadow-xs hover:shadow-md hover:border-primary/50 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between text-left group cursor-pointer"
          />
        }
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center group-hover:scale-105 group-hover:bg-primary group-hover:text-white transition-all duration-200">
            <Plus className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
              새 링크 추가하기
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              새로운 소식이나 프로젝트를 등록해보세요
            </div>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground group-hover:bg-blue-50 group-hover:text-primary transition-colors">
          추가
        </span>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md rounded-2xl p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <DialogHeader className="gap-1.5 text-left">
            <DialogTitle className="text-lg font-bold text-foreground">
              새로운 링크 추가하기
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              프로필에 보여줄 링크 제목과 연결할 주소를 입력해주세요.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-1">
            {/* 링크 제목 필드 */}
            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <Label htmlFor="link-title" className="text-xs font-semibold text-foreground">
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
                id="link-title"
                placeholder="예: 최신 프로젝트, 기술 블로그"
                {...register("title")}
                aria-invalid={!!errors.title}
                className={cn(
                  "h-11 rounded-xl bg-secondary/50 border-border focus:bg-background transition-colors",
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

            {/* 연결할 주소 필드 */}
            <div className="space-y-1.5 text-left">
              <Label htmlFor="link-url" className="text-xs font-semibold text-foreground">
                연결할 주소 (URL) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="link-url"
                placeholder="https://example.com"
                {...register("url")}
                aria-invalid={!!errors.url}
                className={cn(
                  "h-11 rounded-xl bg-secondary/50 border-border focus:bg-background transition-colors",
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
                <Label htmlFor="link-desc" className="text-xs font-semibold text-foreground">
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
                id="link-desc"
                placeholder="링크에 대한 간단한 소개를 남겨보세요"
                {...register("description")}
                aria-invalid={!!errors.description}
                className={cn(
                  "h-11 rounded-xl bg-secondary/50 border-border focus:bg-background transition-colors",
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
              <div className="p-3 text-xs font-medium text-destructive bg-destructive/10 rounded-xl animate-in fade-in-50">
                {submitError}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleOpenChange(false)}
              disabled={isBusy}
              className="h-11 rounded-xl font-medium"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={isBusy}
              className="h-11 rounded-xl font-semibold bg-primary hover:bg-primary/90 text-primary-foreground min-w-[88px]"
            >
              {isBusy ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  추가 중...
                </span>
              ) : (
                "추가하기"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
