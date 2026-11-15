"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "firebase/auth";
import { ProfileData, UpdateProfileInput } from "@/types/mylink";
import { DUMMY_PROFILE } from "@/lib/dummy-data";
import { getUserProfile, updateUserProfile } from "@/lib/profile";
import { useMyLinkStore } from "@/lib/store";

export const profileQueryKeys = {
  all: ["profile"] as const,
  user: (userId?: string) => ["profile", userId] as const,
};

/**
 * 사용자 프로필 정보 조회 쿼리 훅
 * - 10분 동안 fresh 상태 유지 (staleTime)
 * - 불필요한 자동 재요청을 차단하여 Firestore Read 비용 최소화
 */
export function useProfile(user: User | null) {
  const userId = user?.uid;

  const query = useQuery({
    queryKey: profileQueryKeys.user(userId),
    queryFn: async (): Promise<ProfileData> => {
      if (!userId || !user) return DUMMY_PROFILE;

      const saved = await getUserProfile(userId);
      const emailUsername = user.email
        ? user.email.split("@")[0].replace(/[^a-zA-Z0-9._-]/g, "")
        : "";

      const currentStoreProfile = useMyLinkStore.getState().profile;

      const mergedProfile: ProfileData = {
        ...DUMMY_PROFILE,
        ...currentStoreProfile,
        username: saved?.username || currentStoreProfile.username || emailUsername || "user",
        name: saved?.name || currentStoreProfile.name || (user.email ? user.email.split("@")[0] : user.displayName) || DUMMY_PROFILE.name,
        avatarUrl: user.photoURL || currentStoreProfile.avatarUrl || DUMMY_PROFILE.avatarUrl,
        bio: saved?.bio !== undefined ? saved.bio : (currentStoreProfile.bio || DUMMY_PROFILE.bio),
      };

      // Zustand 스토어와도 동기화
      useMyLinkStore.getState().setProfile(mergedProfile);
      return mergedProfile;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 10,
    placeholderData: () => useMyLinkStore.getState().profile,
  });

  return {
    profile: query.data ?? useMyLinkStore.getState().profile,
    isLoading: query.isLoading && !!userId,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * 프로필 수정 뮤테이션 훅 (낙관적 업데이트 적용)
 * - 저장 버튼 클릭 즉시 화면에 변경 사항 반영
 * - 네트워크 또는 Firestore 오류 발생 시 이전 데이터로 즉시 자동 롤백
 * - 추가적인 Firestore Read 없이 캐시를 최신 상태로 유지하여 리소스 절약
 */
export function useUpdateProfile(userId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateProfileInput) => {
      if (!userId) {
        throw new Error("로그인이 필요합니다.");
      }

      const currentProfile =
        queryClient.getQueryData<ProfileData>(profileQueryKeys.user(userId)) ??
        useMyLinkStore.getState().profile;

      return updateUserProfile(userId, input, {
        username: currentProfile.username,
        name: currentProfile.name,
        bio: currentProfile.bio,
      });
    },
    onMutate: async (newInput: UpdateProfileInput) => {
      // 1. 진행 중인 프로필 쿼리가 있다면 취소 (경쟁 상태 방지)
      await queryClient.cancelQueries({ queryKey: profileQueryKeys.user(userId) });

      // 2. 롤백을 위해 이전 프로필 상태 백업
      const previousProfile =
        queryClient.getQueryData<ProfileData>(profileQueryKeys.user(userId)) ??
        useMyLinkStore.getState().profile;

      // 3. 낙관적 업데이트: 즉시 캐시 및 스토어에 새 프로필 데이터 적용
      const optimisticProfile: ProfileData = {
        ...previousProfile,
        username: newInput.username.trim().toLowerCase(),
        name: newInput.name !== undefined ? newInput.name.trim() : previousProfile.name,
        bio: newInput.bio.trim(),
      };

      queryClient.setQueryData(profileQueryKeys.user(userId), optimisticProfile);
      useMyLinkStore.getState().setProfile(optimisticProfile);

      return { previousProfile };
    },
    onError: (_err, _vars, context) => {
      // 4. 오류 발생 시 이전 프로필로 자동 롤백
      if (context?.previousProfile) {
        queryClient.setQueryData(profileQueryKeys.user(userId), context.previousProfile);
        useMyLinkStore.getState().setProfile(context.previousProfile);
      }
    },
    // onSuccess 시 추가 재조회(invalidate)를 수행하지 않음 -> Firestore Read 비용 절약
  });
}
