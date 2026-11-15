"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LinkBlock, AddBlockInput } from "@/types/mylink";
import { DUMMY_BLOCKS } from "@/lib/dummy-data";
import { getUserByDisplayName } from "@/lib/profile";
import {
  getUserLinks,
  addUserLink,
  updateUserLink,
  deleteUserLink,
  getCreatedAtMillis,
  incrementLinkClickCount,
} from "@/lib/links";
import { useMyLinkStore } from "@/lib/store";

export const linksQueryKeys = {
  all: ["links"] as const,
  user: (userId?: string) => ["links", userId] as const,
};

/**
 * 사용자별 링크 목록 조회 쿼리 훅
 * - 로그인 상태: 본인의 Firestore 링크 목록 조회
 * - 비로그인 상태: 대표 사용자(기본값: "seohee")의 Firestore 링크 목록 조회 -> anonymous 링크 -> DUMMY_BLOCKS fallback
 * - 5분 동안 fresh 상태 유지 (staleTime)
 * - 창 포커스 복귀 시 불필요한 자동 재요청 없음 (리소스 절약)
 */
export function useLinks(userId?: string, defaultUsername: string = "seohee") {
  const query = useQuery({
    queryKey: linksQueryKeys.user(userId || `public-${defaultUsername}`),
    queryFn: async (): Promise<LinkBlock[]> => {
      // 1. 로그인 사용자인 경우 본인의 links 조회
      if (userId) {
        const links = await getUserLinks(userId);
        useMyLinkStore.getState().setBlocks(links);
        return links;
      }

      // 2. 비로그인 방문자인 경우: 대표 사용자 계정의 저장된 링크 조회 시도
      try {
        const publicUser = await getUserByDisplayName(defaultUsername);
        if (publicUser?.userId) {
          const publicLinks = await getUserLinks(publicUser.userId);
          if (publicLinks && publicLinks.length > 0) {
            useMyLinkStore.getState().setBlocks(publicLinks);
            return publicLinks;
          }
        }
      } catch (err) {
        console.warn("대표 사용자 링크 조회 실패:", err);
      }

      // 3. anonymous 컬렉션 링크 확인
      try {
        const anonLinks = await getUserLinks("anonymous");
        if (anonLinks && anonLinks.length > 0) {
          useMyLinkStore.getState().setBlocks(anonLinks);
          return anonLinks;
        }
      } catch (err) {
        console.warn("anonymous 링크 조회 실패:", err);
      }

      // 4. 저장된 데이터가 없는 경우 DUMMY_BLOCKS 반환
      return DUMMY_BLOCKS;
    },
    staleTime: 1000 * 60 * 5,
  });

  return {
    blocks: query.data ?? (userId ? [] : DUMMY_BLOCKS),
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * 새 링크 추가 뮤테이션 훅
 * - 추가 성공 후 Firestore 컬렉션 재조회(Read) 없이 캐시 메모리 직접 갱신으로 읽기 쿼터 절약
 */
export function useAddLink(userId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      input: Omit<AddBlockInput, "createdAt"> & { order?: number }
    ) => {
      if (!userId) {
        throw new Error("로그인이 필요합니다.");
      }
      return addUserLink(userId, input);
    },
    onSuccess: (newBlock) => {
      // 1. 캐시 메모리에 새 블록을 추가하고 createdAt 최신순으로 정렬 (0 Firestore Reads)
      queryClient.setQueryData<LinkBlock[]>(
        linksQueryKeys.user(userId),
        (old = []) => {
          const filtered = old.filter((b) => b.id !== newBlock.id);
          const updated = [newBlock, ...filtered].sort((a, b) => {
            const timeA = getCreatedAtMillis(a.createdAt);
            const timeB = getCreatedAtMillis(b.createdAt);
            if (timeA !== 0 || timeB !== 0) return timeB - timeA;
            return a.order - b.order;
          });
          useMyLinkStore.getState().setBlocks(updated);
          return updated;
        }
      );
    },
  });
}

/**
 * 링크 수정 뮤테이션 훅 (낙관적 업데이트 적용)
 * - 변경 즉시 캐시 반영 및 오류 시 자동 롤백
 * - 추가 Firestore Read 없이 캐시만 최신화
 */
export function useUpdateLink(userId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: {
        title?: string;
        url?: string;
        description?: string;
        isActive?: boolean;
        order?: number;
      };
    }) => {
      if (!userId) {
        throw new Error("로그인이 필요합니다.");
      }
      await updateUserLink(userId, id, input);
    },
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: linksQueryKeys.user(userId) });

      const previousLinks =
        queryClient.getQueryData<LinkBlock[]>(linksQueryKeys.user(userId)) ?? [];

      const updatedLinks = previousLinks.map((block) => {
        if (block.id !== id) return block;
        return {
          ...block,
          title: input.title !== undefined ? input.title.trim() : block.title,
          url: input.url !== undefined ? input.url.trim() : block.url,
          description:
            input.description !== undefined
              ? input.description.trim() || undefined
              : block.description,
          isActive: input.isActive !== undefined ? input.isActive : block.isActive,
          order: input.order !== undefined ? input.order : block.order,
          updatedAt: new Date(),
        };
      });

      queryClient.setQueryData(linksQueryKeys.user(userId), updatedLinks);
      useMyLinkStore.getState().setBlocks(updatedLinks);

      return { previousLinks };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousLinks) {
        queryClient.setQueryData(linksQueryKeys.user(userId), context.previousLinks);
        useMyLinkStore.getState().setBlocks(context.previousLinks);
      }
    },
  });
}

/**
 * 링크 삭제 뮤테이션 훅 (낙관적 업데이트 적용)
 * - 삭제 버튼 클릭 시 즉시 화면에서 제거 및 오류 시 자동 롤백
 * - 추가 Firestore Read 없이 캐시만 최신화
 */
export function useDeleteLink(userId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!userId) {
        throw new Error("로그인이 필요합니다.");
      }
      await deleteUserLink(userId, id);
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: linksQueryKeys.user(userId) });

      const previousLinks =
        queryClient.getQueryData<LinkBlock[]>(linksQueryKeys.user(userId)) ?? [];

      const updatedLinks = previousLinks.filter((block) => block.id !== id);

      queryClient.setQueryData(linksQueryKeys.user(userId), updatedLinks);
      useMyLinkStore.getState().setBlocks(updatedLinks);

      return { previousLinks };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousLinks) {
        queryClient.setQueryData(linksQueryKeys.user(userId), context.previousLinks);
        useMyLinkStore.getState().setBlocks(context.previousLinks);
      }
    },
  });
}

/**
 * 링크 클릭 카운트 증가 뮤테이션 훅
 * - 클릭 즉시 캐시의 clickCount를 낙관적으로 +1 반영
 * - Firestore increment()로 서버에도 원자적으로 저장
 */
export function useIncrementClickCount(userId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (linkId: string) => {
      if (!userId) return;
      await incrementLinkClickCount(userId, linkId);
    },
    onMutate: async (linkId: string) => {
      // 캐시에서 해당 링크의 clickCount를 즉시 +1 (낙관적 업데이트)
      queryClient.setQueryData<LinkBlock[]>(
        linksQueryKeys.user(userId),
        (old = []) =>
          old.map((block) =>
            block.id === linkId
              ? { ...block, clickCount: (block.clickCount ?? 0) + 1 }
              : block
          )
      );
      useMyLinkStore.getState().setBlocks(
        queryClient.getQueryData<LinkBlock[]>(linksQueryKeys.user(userId)) ?? []
      );
    },
  });
}
