"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useMyLinkStore } from "@/lib/store";
import {
  profileFormSchema,
  type ProfileFormValues,
} from "@/lib/validations/profile";
import { checkUsernameAvailability } from "@/lib/profile";
import { cn } from "cn";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProfileDialog({ open, onOpenChange }: EditProfileDialogProps) {
  const { user, profile, updateProfile } = useMyLinkStore();
  const [submitError, setSubmitError] = useState<string | null>(null);

  // username 중복 확인 관련 상태
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameCheckStatus, setUsernameCheckStatus] = useState<{
    checked: boolean;
    available: boolean;
    message: string;
    testedUsername?: string;
  }>({
    checked: false,
    available: false,
    message: "",
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    mode: "onBlur",
    defaultValues: {
      username: profile.username || "",
      name: profile.name || "",
      bio: profile.bio || "",
    },
  });

  const currentUsernameInput = useWatch({ control, name: "username" }) || "";
  const currentNameInput = useWatch({ control, name: "name" }) || "";
  const currentBioInput = useWatch({ control, name: "bio" }) || "";

  // 기존 프로필 정보와 비교하여 실제 변경된 사항이 있는지 확인
  const isUsernameChanged =
    currentUsernameInput.trim().toLowerCase() !==
    (profile.username || "").trim().toLowerCase();
  const isNameChanged =
    currentNameInput.trim() !== (profile.name || "").trim();
  const isBioChanged =
    (currentBioInput || "").trim() !== (profile.bio || "").trim();
  const hasChanges = isUsernameChanged || isNameChanged || isBioChanged;

  // 다이얼로그가 열릴 때 현재 프로필 데이터로 폼 초기화
  useEffect(() => {
    if (open) {
      const initialUsername = profile.username || "";
      reset({
        username: initialUsername,
        name: profile.name || "",
        bio: profile.bio || "",
      });
      setSubmitError(null);
      // 기존 본인 username과 같다면 이미 확인된 것으로 간주
      if (initialUsername) {
        setUsernameCheckStatus({
          checked: true,
          available: true,
          message: "현재 사용 중인 사용자 이름이에요.",
          testedUsername: initialUsername.toLowerCase(),
        });
      } else {
        setUsernameCheckStatus({
          checked: false,
          available: false,
          message: "",
        });
      }
    }
  }, [open, profile, reset]);

  // 사용자가 username 입력을 변경하면 중복 확인 상태 초기화
  useEffect(() => {
    const normalizedInput = currentUsernameInput.trim().toLowerCase();
    if (
      usernameCheckStatus.testedUsername &&
      normalizedInput !== usernameCheckStatus.testedUsername
    ) {
      setUsernameCheckStatus({
        checked: false,
        available: false,
        message: "",
      });
    }
  }, [currentUsernameInput, usernameCheckStatus.testedUsername]);

  // 중복 확인 버튼 클릭 핸들러
  const handleCheckUsername = async () => {
    const trimmed = currentUsernameInput.trim();
    if (!trimmed) {
      setError("username", {
        type: "manual",
        message: "사용자 이름을 입력해주세요.",
      });
      return;
    }

    try {
      setIsCheckingUsername(true);
      clearErrors("username");
      const result = await checkUsernameAvailability(
        trimmed,
        user?.uid,
        profile.username
      );

      setUsernameCheckStatus({
        checked: true,
        available: result.available,
        message: result.message,
        testedUsername: trimmed.toLowerCase(),
      });

      if (!result.available) {
        setError("username", {
          type: "manual",
          message: result.message,
        });
      }
    } catch {
      setUsernameCheckStatus({
        checked: true,
        available: false,
        message: "중복 확인 중 오류가 발생했습니다. 다시 시도해주세요.",
        testedUsername: trimmed.toLowerCase(),
      });
    } finally {
      setIsCheckingUsername(false);
    }
  };

  // 폼 제출
  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setSubmitError(null);

      // 변동된 사항이 전혀 없는 경우 Firestore 요청을 일절 수행하지 않고 닫기
      if (!hasChanges) {
        onOpenChange(false);
        return;
      }

      // username이 변경된 경우에만 중복 확인 여부 검증
      if (isUsernameChanged) {
        const normalized = data.username.trim().toLowerCase();
        const isAlreadyVerified =
          usernameCheckStatus.checked &&
          usernameCheckStatus.available &&
          usernameCheckStatus.testedUsername === normalized;

        if (!isAlreadyVerified) {
          // 즉시 중복 확인 실행
          const result = await checkUsernameAvailability(
            data.username,
            user?.uid,
            profile.username
          );

          if (!result.available) {
            setError("username", {
              type: "manual",
              message: result.message,
            });
            setUsernameCheckStatus({
              checked: true,
              available: false,
              message: result.message,
              testedUsername: normalized,
            });
            return;
          }
        }
      }

      await updateProfile({
        username: data.username.trim(),
        name: data.name.trim(),
        bio: data.bio?.trim() || "",
      });

      onOpenChange(false);
    } catch (err: unknown) {
      console.error("프로필 저장 에러:", err);
      const message =
        err instanceof Error
          ? err.message
          : "프로필을 저장하는 중 오류가 발생했습니다.";
      setSubmitError(message);
    }
  };

  const isCurrentUsernameVerified =
    usernameCheckStatus.checked &&
    usernameCheckStatus.available &&
    usernameCheckStatus.testedUsername ===
      currentUsernameInput.trim().toLowerCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full p-0 overflow-hidden rounded-2xl bg-white border border-border shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border text-left">
          <DialogTitle className="text-lg font-bold text-foreground tracking-tight">
            프로필 수정
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-0.5">
            마이페이지에 표시되는 기본 정보를 수정해요.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 px-6 py-5">
          {submitError && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{submitError}</span>
            </div>
          )}

          {/* 1. Username 필드 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="username"
                className="text-xs font-semibold text-foreground flex items-center gap-1"
              >
                <span>사용자 이름 (Username)</span>
                <span className="text-primary">*</span>
              </Label>
              <span className="text-[11px] text-muted-foreground">
                {currentUsernameInput.length}/20자
              </span>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                  @
                </span>
                <Input
                  id="username"
                  placeholder="username"
                  {...register("username")}
                  disabled={isSubmitting}
                  className={cn(
                    "h-10 pl-7 rounded-xl text-sm border-border bg-muted/20 focus-visible:bg-white transition-all",
                    errors.username && "border-destructive focus-visible:ring-destructive/20",
                    isCurrentUsernameVerified &&
                      !errors.username &&
                      "border-emerald-500 focus-visible:ring-emerald-500/20"
                  )}
                />
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleCheckUsername}
                disabled={
                  isSubmitting ||
                  isCheckingUsername ||
                  !currentUsernameInput.trim() ||
                  isCurrentUsernameVerified
                }
                className={cn(
                  "h-10 px-3.5 rounded-xl text-xs font-medium border-border shrink-0 cursor-pointer shadow-none transition-all",
                  isCurrentUsernameVerified
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "hover:bg-muted/70 active:bg-muted"
                )}
              >
                {isCheckingUsername ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : isCurrentUsernameVerified ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="size-3.5 text-emerald-600" />
                    <span>확인됨</span>
                  </span>
                ) : (
                  <span>중복 확인</span>
                )}
              </Button>
            </div>

            {/* 중복 확인 안내 및 에러 메시지 */}
            {errors.username ? (
              <p className="text-[11px] text-destructive flex items-center gap-1 mt-1 font-medium">
                <AlertCircle className="size-3 shrink-0" />
                <span>{errors.username.message}</span>
              </p>
            ) : usernameCheckStatus.checked ? (
              <p
                className={cn(
                  "text-[11px] flex items-center gap-1 mt-1 font-medium",
                  usernameCheckStatus.available
                    ? "text-emerald-600"
                    : "text-destructive"
                )}
              >
                {usernameCheckStatus.available ? (
                  <CheckCircle2 className="size-3 shrink-0" />
                ) : (
                  <AlertCircle className="size-3 shrink-0" />
                )}
                <span>{usernameCheckStatus.message}</span>
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                영문, 숫자, 밑줄(_), 하이픈(-), 마침표(.)만 사용할 수 있어요.
              </p>
            )}
          </div>

          {/* 2. 이름 필드 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="name"
                className="text-xs font-semibold text-foreground flex items-center gap-1"
              >
                <span>이름</span>
                <span className="text-primary">*</span>
              </Label>
              <span className="text-[11px] text-muted-foreground">
                {currentNameInput.length}/30자
              </span>
            </div>

            <Input
              id="name"
              placeholder="표시될 이름을 입력해주세요"
              maxLength={30}
              {...register("name")}
              disabled={isSubmitting}
              className={cn(
                "h-10 rounded-xl text-sm border-border bg-muted/20 focus-visible:bg-white transition-all",
                errors.name && "border-destructive focus-visible:ring-destructive/20"
              )}
            />
            {errors.name && (
              <p className="text-[11px] text-destructive flex items-center gap-1 mt-1 font-medium">
                <AlertCircle className="size-3 shrink-0" />
                <span>{errors.name.message}</span>
              </p>
            )}
          </div>

          {/* 3. 소개글 필드 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="bio"
                className="text-xs font-semibold text-foreground"
              >
                소개글
              </Label>
              <span
                className={cn(
                  "text-[11px] text-muted-foreground",
                  currentBioInput.length > 200 && "text-destructive font-medium"
                )}
              >
                {currentBioInput.length}/200자
              </span>
            </div>

            <Textarea
              id="bio"
              placeholder="나를 소개하는 글을 작성해보세요"
              rows={4}
              maxLength={200}
              {...register("bio")}
              disabled={isSubmitting}
              className={cn(
                "rounded-xl text-sm border-border bg-muted/20 focus-visible:bg-white transition-all leading-relaxed",
                errors.bio && "border-destructive focus-visible:ring-destructive/20"
              )}
            />
            {errors.bio ? (
              <p className="text-[11px] text-destructive flex items-center gap-1 mt-1 font-medium">
                <AlertCircle className="size-3 shrink-0" />
                <span>{errors.bio.message}</span>
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                프로필 상단에 노출되는 자기소개 글이에요.
              </p>
            )}
          </div>

          <DialogFooter className="pt-3 border-t border-border flex flex-row gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="h-10 px-4 rounded-xl text-xs font-medium border-border cursor-pointer shadow-none hover:bg-muted/70"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={
                !hasChanges ||
                isSubmitting ||
                isCheckingUsername ||
                (isUsernameChanged &&
                  usernameCheckStatus.checked &&
                  !usernameCheckStatus.available)
              }
              className={cn(
                "h-10 px-5 rounded-xl text-xs font-medium cursor-pointer shadow-xs transition-all flex items-center gap-1.5",
                hasChanges
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.99]"
                  : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>저장 중...</span>
                </>
              ) : (
                <span>저장하기</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
