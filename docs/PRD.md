# [PRD] 마이링크 (MyLink) 제품 요구사항 정의서

> **문서 버전:** v1.2.0 (사용자 시나리오 추가 및 단계별 개발 범위 반영)  
> **최종 수정일:** 2026-10-07  
> **상태:** 확정 (Approved)  
> **시연 목표:** 1단계(Phase 1) - LocalStorage 기반 프로필 페이지 우선 완성  

---

## 1. 제품 개요 (Product Overview)

### 1.1 서비스 소개
**마이링크(MyLink)**는 개인 크리에이터, 프리랜서, 일반 사용자가 자신의 다양한 소셜 미디어, 포트폴리오, 주요 링크를 하나의 모바일 최적화된 웹페이지에 모아 연결할 수 있는 **멀티링크 & 바이오 프로필(Link-in-Bio) 서비스**입니다.

### 1.2 시연 배경 및 개발 전략 (Phased Demo Approach)
- 본 프로젝트는 단계별(Phased) 시연 시나리오를 바탕으로 점진적으로 기능을 확장합니다.
- **[현재 단계 - Phase 1]**: 복잡한 관리자 대시보드나 통계 기능은 배제하고, **Zustand + LocalStorage 기반으로 브라우저에 저장된 데이터를 불러와 렌더링하는 '프로필 페이지' 자체를 완벽하게 구현**하는 데 집중합니다.
- **[후속 단계 - Phase 2 & 3]**: 실시간 편집 대시보드(Live Preview, DnD) 및 통계/분석 기능은 향후 시연 단계로 순차 확장합니다.

---

## 2. 타겟 사용자 & 핵심 가치

### 2.1 타겟 사용자 (Target Audience)
1. **개인 크리에이터 / 인플루언서**: 인스타그램, 유튜브, 블로그 등 여러 채널을 하나의 프로필 페이지로 모아두려는 사용자
2. **개발자 / 디자이너 / 프리랜서**: 포트폴리오, 깃허브, 이력서, 커피챗 링크를 깔끔하게 공유하려는 1인 전문가
3. **일반 사용자**: 자신을 표현하는 바이오와 소셜 링크를 감각적으로 모아두고 싶은 사용자

### 2.2 Phase 1 핵심 가치 제안
- **모바일 퍼스트 UX**: 모바일 화면에 가장 최적화된 유려한 단일 프로필 뷰 제공
- **토스 디자인 시스템(TDS) 감성**: 신뢰감 있는 Toss Blue, 정갈한 카드 쉐도우, 친절한 "해요체" 어조
- **Zustand + LocalStorage 영속성**: 브라우저 로컬 저장소와 동기화되어 새로고침 시에도 사용자 프로필과 링크 데이터 유지

---

## 3. 사용자 시나리오 (User Scenarios)

### 3.1 [Phase 1 시연 핵심] 방문자(Visitor)의 프로필 탐색 시나리오
> **페르소나: 김방문 (크리에이터의 SNS 프로필 링크를 타고 유입된 팔로워/방문자)**

1. **서비스 진입**: 인스타그램 프로필 바이오에 등록된 마이링크 단일 URL을 탭하여 접속합니다.
2. **프로필 탐색**:
   - 상단 원형 아바타, 이름("한서희"), 직무/상태 뱃지("새로운 기회를 찾고 있어요"), 그리고 친절한 자기소개(Bio)를 한눈에 확인합니다.
   - 모바일에 최적화된 여백과 토스 디자인 시스템(TDS) 특유의 깔끔한 카드 UI에 높은 신뢰감을 느낍니다.
3. **소셜 채널 바로가기**:
   - 프로필 바로 아래 가로로 정렬된 소셜 아이콘 바에서 [GitHub] 또는 [Instagram] 아이콘을 탭하여 해당 외부 프로필로 새 창 이동합니다.
4. **목적 링크 탐색 & 클릭**:
   - "주요 프로젝트", "소통 및 커피챗" 등 직관적인 섹션 구분 헤더를 통해 원하는 콘텐츠를 빠르게 스캔합니다.
   - 대표 포트폴리오 링크 카드를 탭하여 상세 페이지로 이동합니다.
5. **재방문 일관성**:
   - 새로고침을 하거나 재접속해도 깜빡임 없이 빠른 로딩 속도로 동일한 프로필 화면을 제공받습니다.

---

### 3.2 [Phase 1 시연 핵심] 크리에이터(시연자)의 데이터 영속성 검증 시나리오
> **페르소나: 한서희 (마이링크 서비스 시연자 / 크리에이터)**

1. **최초 접속 & 초기 데이터 주입**:
   - 사용자가 브라우저에서 마이링크 페이지를 열면, Zustand 스토어와 LocalStorage가 연동되어 초기 기본 Mock 프로필 데이터(프로필 정보, 소셜 링크, 링크 카드, 섹션 헤더)가 즉시 로드됩니다.
2. **로컬스토리지(LocalStorage) 보존 확인**:
   - 시연자는 브라우저 개발자 도구(F12 > Application > Local Storage > `mylink-storage`)를 열어 데이터가 안전하게 직렬화(JSON)되어 로컬에 저장되어 있음을 보여줍니다.
   - 페이지를 새로고침(F5)해도 서버 백엔드 통신 없이 브라우저 로컬스토리지에서 즉시 복원되어 깜빡임 없이 화면이 유지되는 클라이언트 영속성을 입증합니다.

---

### 3.3 [Phase 2 & 3 로드맵] 크리에이터의 관리 및 성과 분석 시나리오 (향후 확장)
> **페르소나: 박크리에이터 (향후 대시보드와 통계를 활용할 사용자)**

1. **링크 편집 & 실시간 모바일 목업 확인 (Phase 2)**:
   - 관리자 대시보드 좌측에서 새 유튜브 영상 링크를 추가하고 제목을 입력하면, 우측 모바일 목업 화면에 0.1초 이내로 새 링크 카드가 렌더링되는 실시간 라이브 프리뷰를 경험합니다.
   - 드래그 앤 드롭으로 최신 콘텐츠 카드를 맨 위로 손쉽게 재배치합니다.
2. **성과 분석 및 채널 최적화 (Phase 3)**:
   - 통계 탭을 열어 지난 7일간의 총 방문자 수(1,200회)와 링크별 클릭 수(450회) 추이 그래프를 확인합니다.
   - 유입 경로 분석에서 '인스타그램(65%)'이 압도적인 것을 확인하고 차기 마케팅 포인트를 수립합니다.

---

## 4. 기술 스택 (Tech Stack)

| 구분 | 사용 기술 | 비고 |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) | React 19 호환 및 빠른 렌더링 |
| **Language** | TypeScript 5 | 엄격한 인터페이스 및 타입 안정성 |
| **State Management** | **Zustand** (with `persist` middleware) | 경량 전역 상태 관리 및 LocalStorage 자동 동기화 |
| **Styling** | Tailwind CSS v4, **shadcn/ui** | 모든 커스텀 CSS는 Tailwind CSS 유틸리티 클래스로 통일하며, 토스 디자인 시스템(TDS) 컬러 토큰과 shadcn/ui 컴포넌트 생태계 결합 |
| **Iconography** | Lucide React | 소셜 및 내비게이션 아이콘 |

---

## 5. 상세 기능 요구사항 (Scope Definition)

### 🎯 [현재 시연 범위] Phase 1 : 프로필 페이지 (Profile Page Only)

방문자가 직접 확인하는 모바일 중심의 단일 웹페이지 화면입니다. 모든 데이터는 **백엔드 API 통신을 모사한 Mock JSON 데이터(`public/mock/profile.json`)**를 기반으로 Zustand 스토어 및 LocalStorage에 초기 세팅되어 로드되며, 새로고침 시에도 영속성이 유지됩니다.

1. **프로필 헤더 블록 (Profile Header)**
   - **아바타 이미지**: 원형 아바타 (기본 이미지 제공 또는 URL 연동)
   - **이름 / 닉네임**: 크리에이터명 (예: 한서희)
   - **직무 / 상태 뱃지**: 친절한 상태 태그 (예: "새로운 기회를 찾고 있어요")
   - **자기소개 (Bio)**: 사용자를 소개하는 2~3줄 텍스트
2. **소셜 미디어 아이콘 바 (Social Links Bar)**
   - 인스타그램, 유튜브, GitHub, 이메일, 웹사이트 등 등록된 소셜 링크만 가로 정렬
   - 각 아이콘 클릭 시 새 창(새 탭)으로 해당 SNS 프로필 이동
   - 호버 및 탭 시 부드러운 스케일/컬러 전환 인터랙션
3. **섹션 구분 헤더 (Section Headers)**
   - 링크들을 주제별로 묶어주는 텍스트 구분선 (예: "주요 프로젝트", "소통 및 채널", "추천 콘텐츠")
4. **URL 링크 카드 버튼 (Link Card Buttons)**
   - 터치 및 클릭에 최적화된 풀 위드(Full-width) 카드 버튼
   - 링크 타이틀, 부가 설명(선택), 우측 화살표(`ChevronRight`) 아이콘
   - 클릭 시 지정된 URL로 새 창 이동
5. **페이지 하단 푸터 (Footer)**
   - "마이링크로 나만의 프로필을 만들어보세요" 브랜딩 카피 및 링크

---

### ⏳ [향후 확장 범위 - 현재 구현 제외] Phase 2 & 3

다음 단계 시연을 위해 마일스톤으로 분리된 기능 목록입니다.

#### Phase 2 : 관리자 대시보드 & 실시간 에디터 *(추후 구현)*
- 좌측 편집 폼 + 우측 스마트폰 모바일 목업 실시간 라이브 프리뷰(Split View)
- 링크 추가, 수정, 삭제, 노출 ON/OFF 토글
- 드래그 앤 드롭(DnD)을 통한 링크 순서 변경
- 테마 프리셋 선택 (다크, 파스텔, 선셋 등)

#### Phase 3 : 통계 및 성과 분석 (Analytics) *(추후 구현)*
- 총 방문자 수(Views) 및 링크별 클릭 수(Clicks) 실시간 집계
- 최근 7일 추이 그래프 차트
- 유입 경로(Referrer) 및 디바이스(모바일/데스크톱) 비율 분석

---

## 6. Phase 1 데이터 모델 명세 (TypeScript)

Phase 1 구현에 직접 사용되는 데이터 구조입니다. Zustand의 `persist` 미들웨어와 결합하여 LocalStorage 키(`mylink-storage`)에 저장됩니다.

```typescript
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
  name: string;
  role: string;
  statusBadge: string;
  bio: string;
  avatarUrl: string;
  socials: SocialLinks;
}

// Phase 1 통합 스토어 상태
export interface MyLinkStoreState {
  profile: ProfileData;
  blocks: LinkBlock[];
  // 향후 확장을 고려한 액션 인터페이스 (Phase 1에서는 읽기 및 초기값 세팅 중심)
  setProfile?: (profile: ProfileData) => void;
  setBlocks?: (blocks: LinkBlock[]) => void;
}
```

---

## 7. UI / UX 및 디자인 시스템 가이드라인

- **디자인 시스템 기반**: **shadcn/ui** (Base UI, Tailwind v4 기반)
  - 향후 모든 UI 컴포넌트는 기본적으로 shadcn/ui 기반으로 구성
  - 기존의 토스 디자인 시스템(TDS) 컬러 토큰과 감성을 혼합하여 사용
  - **CSS 통일**: 별도의 CSS 파일이나 CSS-in-JS를 사용하지 않고, 모든 스타일링은 Tailwind CSS 유틸리티 클래스로 통일
- **레이아웃**: 모바일 중심 뷰 (최대 너비 `max-w-md`, 화면 중앙 정렬, 상하 패딩 여유)
- **컬러 팔레트**:
  - Primary Point: Toss Blue (`#3182F6`)
  - Background: Clean White / Subtle Grey (`#F9FAFB`)
  - Card Surface: White (`#FFFFFF`) / shadcn `Card` 컴포넌트 활용 (subtle border `#E5E8EB`)
  - Typography: Grey-900 (`#191F28`, 제목), Grey-700 (`#4E5968`, 본문), Grey-500 (`#8B95A1`, 캡션)
- **인터랙션**: 카드 호버 시 미세한 상승 효과(`translate-y-[-2px]`) 및 부드러운 트랜지션

---

## 8. 단계별 로드맵 및 시연 마일스톤

- **✅ Step 1 (현재 목표): LocalStorage 기반 프로필 페이지 완성**
  - Zustand 스토어 생성 (`useMyLinkStore`) + LocalStorage `persist` 연동
  - 초기 Mock 데이터(`public/mock/profile.json` 및 `src/lib/dummy-data.ts`) 구성 및 연동
  - TDS 모바일 프로필 페이지 컴포넌트 렌더링
  - 새로고침 시 로컬스토리지 영속성 검증
- **🔜 Step 2 (다음 시연): 관리자 대시보드 & 실시간 라이브 프리뷰**
  - 대시보드 레이아웃 구축, 링크 편집 및 순서 변경(DnD)
- **🔜 Step 3 (추후 시연): 디자인 테마 시스템 및 통계(Analytics)**
  - 테마 변경 및 방문자/클릭 추적 대시보드 추가
