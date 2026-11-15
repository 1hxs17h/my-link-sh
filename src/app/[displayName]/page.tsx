import type { Metadata } from "next";
import { UserProfileView } from "./UserProfileView";

interface PageProps {
  params: Promise<{ displayName: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { displayName } = await params;
  let decodedName = displayName;
  try {
    decodedName = decodeURIComponent(displayName);
  } catch {
    // 디코딩 실패 시 원본 사용
  }
  const cleanName = decodedName.startsWith("@")
    ? decodedName.slice(1)
    : decodedName;

  return {
    title: `${cleanName}님의 링크 | MyLink`,
    description: `${cleanName}님의 프로필 및 링크 모음 페이지입니다.`,
  };
}

export default async function UserDynamicPage({ params }: PageProps) {
  const { displayName } = await params;

  return <UserProfileView displayName={displayName} />;
}
