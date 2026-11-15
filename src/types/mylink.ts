// 블록 타입 (일반 링크 또는 섹션 헤더)
export type BlockType = 'link' | 'header';

// 링크/헤더 블록 항목
export interface LinkBlock {
  id: string;
  type: BlockType;
  title: string;
  url?: string;        // type === 'link' 일 때 필수
  description?: string;// 부가 설명 문구 (선택)
  isActive: boolean;   // 노출 여부 (Phase 1에서는 true인 것만 렌더링)
  order: number;       // 표시 순서
  createdAt?: unknown;     // 생성일시 (Firestore Timestamp 또는 Date 등)
  updatedAt?: unknown;     // 수정일시 (Firestore Timestamp 또는 Date 등)
}

// 새 블록 추가 입력 형태
export interface AddBlockInput {
  type?: BlockType;
  title: string;
  url?: string;
  description?: string;
  isActive?: boolean;
  order?: number;
  createdAt?: unknown;
}

// 소셜 미디어 링크 모음
export interface SocialLinks {
  instagram?: string;
  youtube?: string;
  github?: string;
  twitter?: string;
  email?: string;
  website?: string;
}

// 프로필 데이터
export interface ProfileData {
  username?: string;
  name: string;
  role: string;
  statusBadge: string;
  bio: string;
  avatarUrl: string;
  socials: SocialLinks;
}

// 프로필 수정 폼 입력 형태
export interface UpdateProfileInput {
  username: string;
  name: string;
  bio: string;
}
