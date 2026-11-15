"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { LinkBlock } from "@/types/mylink";
import { useMyLinkStore } from "@/lib/store";
import { useDeleteLink } from "@/hooks/useLinks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteLinkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  link: LinkBlock;
}

export function DeleteLinkModal({
  open,
  onOpenChange,
  link,
}: DeleteLinkModalProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const user = useMyLinkStore((state) => state.user);
  const { mutateAsync: deleteLink, isPending: isDeleting } = useDeleteLink(user?.uid);

  const handleDelete = async () => {
    try {
      setErrorMessage(null);
      await deleteLink(link.id);
      onOpenChange(false);
    } catch (error) {
      console.error("링크 삭제 실패:", error);
      setErrorMessage("삭제 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (isDeleting) return;
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setErrorMessage(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl p-6">
        <DialogHeader className="gap-2 text-left">
          <div className="w-10 h-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center mb-1">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <DialogTitle className="text-lg font-bold text-foreground">
            정말 삭제하시겠습니까?
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            선택한 링크가 프로필 및 데이터베이스에서 완전히 삭제됩니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2 text-left">
          {/* 링크 이름 표시 */}
          <div className="p-3.5 rounded-xl bg-secondary/60 border border-border/80 space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              삭제할 링크
            </span>
            <div className="text-sm font-semibold text-foreground break-all line-clamp-2">
              {link.title}
            </div>
            {link.url && (
              <div className="text-xs text-muted-foreground/80 truncate">
                {link.url}
              </div>
            )}
          </div>

          {/* 경고: 빨간색 문구 */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-destructive">
            <span>이 작업은 되돌릴 수 없습니다.</span>
          </div>

          {/* 에러 메시지 */}
          {errorMessage && (
            <div className="p-3 text-xs font-medium text-destructive bg-destructive/10 rounded-xl animate-in fade-in-50">
              {errorMessage}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => handleOpenChange(false)}
            disabled={isDeleting}
            className="h-11 rounded-xl font-medium"
          >
            취소
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="h-11 rounded-xl font-semibold min-w-[96px]"
          >
            {isDeleting ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-4 w-4 animate-spin" />
                삭제 중...
              </span>
            ) : (
              "삭제하기"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
