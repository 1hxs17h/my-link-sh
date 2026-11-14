import { create } from 'zustand';
import { ProfileData, LinkBlock, AddBlockInput } from '@/types/mylink';
import { DUMMY_PROFILE } from './dummy-data';
import {
  addAnonymousLink,
  updateAnonymousLink,
  deleteAnonymousLink,
  getAnonymousLinks,
  getCreatedAtMillis,
} from './links';

export interface MyLinkStoreState {
  profile: ProfileData;
  blocks: LinkBlock[];
  isLoading: boolean;
  setProfile: (profile: ProfileData) => void;
  setBlocks: (blocks: LinkBlock[]) => void;
  fetchBlocks: () => Promise<void>;
  addBlock: (input: AddBlockInput) => Promise<LinkBlock>;
  updateBlock: (
    id: string,
    input: { title?: string; url?: string; description?: string; isActive?: boolean }
  ) => Promise<void>;
  deleteBlock: (id: string) => Promise<void>;
}

export const useMyLinkStore = create<MyLinkStoreState>((set, get) => ({
  profile: DUMMY_PROFILE,
  blocks: [],
  isLoading: true,
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
  fetchBlocks: async () => {
    try {
      set({ isLoading: true });
      const links = await getAnonymousLinks();
      get().setBlocks(links);
    } catch (error) {
      console.error("Firestore 링크 로드 에러:", error);
      set({ isLoading: false });
    }
  },
  addBlock: async (input) => {
    const currentBlocks = get().blocks;
    const maxOrder =
      currentBlocks.length > 0
        ? Math.max(...currentBlocks.map((b) => b.order))
        : 0;

    // 1. Firestore 'users/anonymous/links' 에 추가
    const newBlock = await addAnonymousLink({
      ...input,
      order: typeof input.order === "number" ? input.order : maxOrder + 1,
    });

    // 2. 추가 완료 후 최신 목록으로 즉시 갱신 (createdAt 기준 최신순)
    try {
      const refreshedLinks = await getAnonymousLinks();
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
    // 1. Firestore 'users/anonymous/links/{id}' 문서 수정
    await updateAnonymousLink(id, input);

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
      const refreshedLinks = await getAnonymousLinks();
      get().setBlocks(refreshedLinks);
    } catch (e) {
      console.warn("수정 후 재조회 실패, 로컬 상태 유지:", e);
    }
  },
  deleteBlock: async (id) => {
    // 1. Firestore 'users/anonymous/links/{id}' 문서 삭제
    await deleteAnonymousLink(id);

    // 2. 스토어 상태 즉시 반영
    set((state) => ({
      blocks: state.blocks.filter((block) => block.id !== id),
    }));

    // 3. 최신 Firestore 데이터와 동기화
    try {
      const refreshedLinks = await getAnonymousLinks();
      get().setBlocks(refreshedLinks);
    } catch (e) {
      console.warn("삭제 후 재조회 실패, 로컬 상태 유지:", e);
    }
  },
}));
