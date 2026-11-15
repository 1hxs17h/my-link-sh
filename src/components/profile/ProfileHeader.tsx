"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProfileData } from "@/types/mylink";
import { useMyLinkStore } from "@/lib/store";
import { EditProfileDialog } from "./EditProfileDialog";
import { UserPen } from "lucide-react";

export function ProfileHeader({ profile }: { profile: ProfileData }) {
  const { user } = useMyLinkStore();
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="relative">
          <Avatar className="h-24 w-24 border border-border shadow-sm">
            <AvatarImage src={profile.avatarUrl} alt={profile.name} />
            <AvatarFallback>{profile.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          {user && (
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              aria-label="프로필 수정"
              className="absolute bottom-0 right-0 size-7 rounded-full bg-white border border-border shadow-xs flex items-center justify-center text-muted-foreground hover:text-foreground hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <UserPen className="size-3.5" />
            </button>
          )}
        </div>

        <div className="space-y-1.5">
          {profile.username && (
            <div className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-blue-50 px-2.5 py-0.5 rounded-full">
              <span>@{profile.username}</span>
            </div>
          )}
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {profile.name}
          </h1>
          <p className="text-muted-foreground font-medium text-sm">
            {profile.role}
          </p>
        </div>

        {profile.statusBadge && (
          <Badge
            variant="secondary"
            className="px-3 py-1 font-semibold rounded-full bg-blue-50 text-primary hover:bg-blue-50"
          >
            {profile.statusBadge}
          </Badge>
        )}

        <p className="text-foreground whitespace-pre-wrap max-w-sm text-sm leading-relaxed">
          {profile.bio}
        </p>

        {user && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditOpen(true)}
            className="h-8 px-3.5 rounded-full text-xs font-medium border-border hover:bg-muted/70 flex items-center gap-1.5 shadow-none cursor-pointer mt-1"
          >
            <UserPen className="size-3.5 text-muted-foreground" />
            <span>프로필 수정</span>
          </Button>
        )}
      </div>

      <EditProfileDialog open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
}
