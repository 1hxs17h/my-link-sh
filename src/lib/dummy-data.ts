import { LinkBlock, ProfileData } from "@/types/mylink";

// ==========================================
// Phase 1: 프로필 더미 데이터
// ==========================================
export const DUMMY_PROFILE: ProfileData = {
  username: "seohee",
  name: "한서희",
  role: "프론트엔드 개발자",
  statusBadge: "새로운 기회를 찾고 있어요",
  bio: "사용자 경험과 문제 해결에 몰입하는 프론트엔드 개발자예요.\n복잡한 아이디어를 직관적이고 매끄러운 웹 인터페이스로 구현하는 일을 가장 좋아해요.",
  avatarUrl: "https://github.com/1hxs17h.png", // 본인 GitHub 프로필 이미지
  socials: {
    github: "https://github.com/1hxs17h",
    instagram: "https://instagram.com/서희_instagram_아이디", // 임시
    email: "hanseohee03@naver.com",
  },
};

// ==========================================
// Phase 1: 링크 및 헤더 블록 더미 데이터
// ==========================================
export const DUMMY_BLOCKS: LinkBlock[] = [
  {
    id: "header-1",
    type: "header",
    title: "🌟 주요 프로젝트",
    isActive: true,
    order: 1,
  },
  {
    id: "link-1",
    type: "link",
    title: "GitHub 코드 저장소",
    url: "https://github.com/1hxs17h",
    description: "오픈소스 기여와 개발 프로젝트를 둘러볼 수 있어요",
    isActive: true,
    order: 2,
  },
  {
    id: "link-2",
    type: "link",
    title: "프론트엔드 포트폴리오 웹사이트",
    url: "https://github.com/1hxs17h?tab=repositories",
    description: "직접 디자인하고 개발한 작업물 모음집이에요",
    isActive: true,
    order: 3,
  },
  {
    id: "header-2",
    type: "header",
    title: "✍️ 기록 및 소통",
    isActive: true,
    order: 4,
  },
  {
    id: "link-3",
    type: "link",
    title: "기술 블로그",
    url: "https://velog.io/@1hxs17h", // 임시 URL
    description: "배운 지식과 트러블슈팅 과정을 꾸준히 기록해요",
    isActive: true,
    order: 5,
  },
  {
    id: "link-4",
    type: "link",
    title: "이메일로 협업 / 커피챗 문의하기",
    url: "mailto:hanseohee03@naver.com",
    description: "프론트엔드 개발 관련 협업이나 커피챗은 언제든 환영해요!",
    isActive: true,
    order: 6,
  },
  {
    id: "link-5",
    type: "link",
    title: "비공개 링크 예시",
    url: "https://example.com/hidden",
    description: "이 링크는 isActive가 false라서 화면에 보이지 않아야 해요.",
    isActive: false,
    order: 7,
  },
];
