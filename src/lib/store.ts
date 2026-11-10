import { create } from 'zustand';
import { ProfileData, LinkBlock, AddBlockInput } from '@/types/mylink';
import { DUMMY_PROFILE, DUMMY_BLOCKS } from './dummy-data';

export interface MyLinkStoreState {
  profile: ProfileData;
  blocks: LinkBlock[];
  setProfile: (profile: ProfileData) => void;
  setBlocks: (blocks: LinkBlock[]) => void;
  addBlock: (input: AddBlockInput) => void;
}

export const useMyLinkStore = create<MyLinkStoreState>((set) => ({
  profile: DUMMY_PROFILE,
  blocks: DUMMY_BLOCKS,
  setProfile: (profile) => set({ profile }),
  setBlocks: (blocks) => set({ blocks }),
  addBlock: (input) =>
    set((state) => {
      const maxOrder =
        state.blocks.length > 0
          ? Math.max(...state.blocks.map((b) => b.order))
          : 0;
      const newBlock: LinkBlock = {
        id: `link-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: input.type || 'link',
        title: input.title,
        url: input.url,
        description: input.description,
        isActive: input.isActive ?? true,
        order: maxOrder + 1,
      };
      return { blocks: [...state.blocks, newBlock] };
    }),
}));
