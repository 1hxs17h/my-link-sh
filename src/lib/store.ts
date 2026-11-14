import { create } from "zustand";
import { ProfileData, LinkBlock, AddBlockInput } from "@/types/mylink";
import { DUMMY_PROFILE } from "./dummy-data";
import {
  addUserLink,
  updateUserLink,
  deleteUserLink,
  getUserLinks,
  getCreatedAtMillis,
} from "./links";
import { onAuthListener } from "./auth";
import type { User } from "firebase/auth";

export interface MyLinkStoreState {
  user: User | null;
  authLoading: boolean;
  profile: ProfileData;
  blocks: LinkBlock[];
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setAuthLoading: (loading: boolean) => void;
  setProfile: (profile: ProfileData) => void;
  setBlocks: (blocks: LinkBlock[]) => void;
  fetchBlocks: (userId?: string) => Promise<void>;
  addBlock: (input: AddBlockInput) => Promise<LinkBlock>;
  updateBlock: (
    id: string,
    input: { title?: string; url?: string; description?: string; isActive?: boolean }
  ) => Promise<void>;
  deleteBlock: (id: string) => Promise<void>;
  initAuth: () => () => void;
}

let authUnsubscribe: (() => void) | null = null;

export const useMyLinkStore = create<MyLinkStoreState>((set, get) => ({
  user: null,
  authLoading: true,
  profile: DUMMY_PROFILE,
  blocks: [],
  isLoading: false,

  setUser: (user) => {
    set((state) => ({
      user,
      profile: user
        ? {
            ...state.profile,
            name:
              (user.email ? user.email.split("@")[0] : user.displayName) ||
              state.profile.name,
            avatarUrl: user.photoURL || state.profile.avatarUrl,
          }
        : DUMMY_PROFILE,
    }));
  },

  setAuthLoading: (authLoading) => set({ authLoading }),
  setProfile: (profile) => set({ profile }),

  setBlocks: (blocks) => {
    // createdAt 기준 최신순 (내림차순) 정렬 보장
    const sorted = [...blocks].sort((a, b) => {
      const timeA = getCreatedAtMillis(a.createdAt);
      const timeB = getCreatedAtMillis(b.createdAt);
      if (timeA !== 0 || timeB !== 0) {
        return timeB - timeA;
      }
      return a.order - b.order;
    });
    set({ blocks: sorted, isLoading: false });
  },

  fetchBlocks: async (userIdOverride?: string) => {
    const targetUid = userIdOverride ?? get().user?.uid;
    if (!targetUid) {
      set({ blocks: [], isLoading: false });
      return;
    }

    try {
      set({ isLoading: true });
      const links = await getUserLinks(targetUid);
      get().setBlocks(links);
    } catch (error) {
      console.error(`Firestore 링크 로드 에러 (users/${targetUid}/links):`, error);
      set({ isLoading: false });
    }
  },

  addBlock: async (input) => {
    const targetUid = get().user?.uid;
    if (!targetUid) {
      throw new Error("로그인이 필요합니다.");
    }

    const currentBlocks = get().blocks;
    const maxOrder =
      currentBlocks.length > 0
        ? Math.max(...currentBlocks.map((b) => b.order))
        : 0;

    // 1. Firestore 'users/{targetUid}/links' 에 추가
    const newBlock = await addUserLink(targetUid, {
      ...input,
      order: typeof input.order === "number" ? input.order : maxOrder + 1,
    });

    // 2. 추가 완료 후 최신 목록으로 즉시 갱신 (createdAt 기준 최신순)
    try {
      const refreshedLinks = await getUserLinks(targetUid);
      get().setBlocks(refreshedLinks);
    } catch {
      // 네트워크 일시 문제 등으로 re-fetch 실패 시 낙관적 업데이트로 목록 갱신
      set((state) => {
        const filtered = state.blocks.filter((b) => b.id !== newBlock.id);
        const updated = [newBlock, ...filtered].sort((a, b) => {
          const timeA = getCreatedAtMillis(a.createdAt);
          const timeB = getCreatedAtMillis(b.createdAt);
          if (timeA !== 0 || timeB !== 0) {
            return timeB - timeA;
          }
          return a.order - b.order;
        });
        return { blocks: updated };
      });
    }

    return newBlock;
  },

  updateBlock: async (id, input) => {
    const targetUid = get().user?.uid;
    if (!targetUid) {
      throw new Error("로그인이 필요합니다.");
    }

    // 1. Firestore 'users/{targetUid}/links/{id}' 문서 수정
    await updateUserLink(targetUid, id, input);

    // 2. 스토어 상태 즉시 반영 (낙관적 업데이트)
    set((state) => ({
      blocks: state.blocks.map((block) => {
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
          updatedAt: new Date(),
        };
      }),
    }));

    // 3. 최신 Firestore 데이터와 동기화
    try {
      const refreshedLinks = await getUserLinks(targetUid);
      get().setBlocks(refreshedLinks);
    } catch (e) {
      console.warn("수정 후 재조회 실패, 로컬 상태 유지:", e);
    }
  },

  deleteBlock: async (id) => {
    const targetUid = get().user?.uid;
    if (!targetUid) {
      throw new Error("로그인이 필요합니다.");
    }

    // 1. Firestore 'users/{targetUid}/links/{id}' 문서 삭제
    await deleteUserLink(targetUid, id);

    // 2. 스토어 상태 즉시 반영
    set((state) => ({
      blocks: state.blocks.filter((block) => block.id !== id),
    }));

    // 3. 최신 Firestore 데이터와 동기화
    try {
      const refreshedLinks = await getUserLinks(targetUid);
      get().setBlocks(refreshedLinks);
    } catch (e) {
      console.warn("삭제 후 재조회 실패, 로컬 상태 유지:", e);
    }
  },

  initAuth: () => {
    if (authUnsubscribe) return authUnsubscribe;

    set({ authLoading: true });
    authUnsubscribe = onAuthListener(async (user) => {
      get().setUser(user);
      set({ authLoading: false });

      if (user) {
        // 로그인 상태: users/{user.uid}/links 에서 불러오기
        await get().fetchBlocks(user.uid);
      } else {
        // 로그아웃 상태: blocks 비우기
        set({ blocks: [], isLoading: false });
      }
    });

    return authUnsubscribe;
  },
}));
