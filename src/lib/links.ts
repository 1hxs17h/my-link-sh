import {
  collection,
  getDocs,
  query,
  orderBy,
  Timestamp,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  deleteField,
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { LinkBlock, BlockType, AddBlockInput } from "@/types/mylink";

/**
 * 다양한 형태(Firestore Timestamp, Date, 문자열, 숫자 등)의 createdAt 값을
 * 밀리초(ms) 단위의 타임스탬프 숫자로 통일하여 반환합니다.
 */
export function getCreatedAtMillis(createdAt: unknown): number {
  if (!createdAt) return 0;

  // Firestore Timestamp 객체 (toMillis 메서드 지원)
  if (typeof (createdAt as { toMillis?: () => number }).toMillis === "function") {
    return (createdAt as { toMillis: () => number }).toMillis();
  }

  // Firestore Timestamp 객체 (toDate 메서드 지원)
  if (typeof (createdAt as { toDate?: () => Date }).toDate === "function") {
    return (createdAt as { toDate: () => Date }).toDate().getTime();
  }

  // JS Date 객체
  if (createdAt instanceof Date) {
    return createdAt.getTime();
  }

  // 밀리초 숫자
  if (typeof createdAt === "number") {
    return createdAt;
  }

  // ISO 문자열 등 날짜 문자열
  if (typeof createdAt === "string") {
    const parsed = new Date(createdAt).getTime();
    return isNaN(parsed) ? 0 : parsed;
  }

  // { seconds: number, nanoseconds?: number } 형태의 일반 객체
  if (
    typeof createdAt === "object" &&
    createdAt !== null &&
    "seconds" in createdAt &&
    typeof (createdAt as { seconds: unknown }).seconds === "number"
  ) {
    return (createdAt as { seconds: number }).seconds * 1000;
  }

  return 0;
}

/**
 * Firestore 문서 스냅샷 배열을 LinkBlock 배열로 변환하고 createdAt 최신순(내림차순)으로 정렬합니다.
 */
function mapAndSortSnapshotDocs(docs: QueryDocumentSnapshot<DocumentData>[]): LinkBlock[] {
  const links: LinkBlock[] = docs.map((doc, index) => {
    const data = doc.data();
    return {
      id: doc.id,
      type: (data.type as BlockType) || "link",
      title: data.title || "",
      url: data.url || "",
      description: data.description || undefined,
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      order: typeof data.order === "number" ? data.order : index,
      createdAt: data.createdAt,
    };
  });

  // createdAt 최신순 (내림차순) 정렬
  links.sort(
    (a, b) => getCreatedAtMillis(b.createdAt) - getCreatedAtMillis(a.createdAt)
  );

  return links;
}

/**
 * Firestore 경로 `users/anonymous/links`에서 createdAt 기준 최신순(내림차순)으로 링크 목록을 불러옵니다.
 */
export async function getAnonymousLinks(): Promise<LinkBlock[]> {
  const linksRef = collection(db, "users", "anonymous", "links");

  try {
    // 1차 시도: createdAt 기준 최신순(내림차순) 정렬 쿼리
    const q = query(linksRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    let links = mapAndSortSnapshotDocs(querySnapshot.docs);

    // orderBy("createdAt")는 createdAt 필드가 없는 문서를 결과에서 누락시킬 수 있으므로
    // 전체 컬렉션 문서와 개수가 다르면 전체 컬렉션을 읽어와 정렬
    const allSnapshot = await getDocs(linksRef);
    if (allSnapshot.docs.length > links.length) {
      links = mapAndSortSnapshotDocs(allSnapshot.docs);
    }

    return links;
  } catch (error) {
    console.warn("orderBy('createdAt') 쿼리 실패, 전체 컬렉션 폴백으로 조회합니다:", error);
    try {
      const fallbackSnapshot = await getDocs(linksRef);
      return mapAndSortSnapshotDocs(fallbackSnapshot.docs);
    } catch (fallbackError) {
      console.error("Firestore 링크 불러오기 최종 실패 (users/anonymous/links):", fallbackError);
      throw fallbackError;
    }
  }
}

/**
 * 새 링크를 Firestore 경로 `users/anonymous/links` 컬렉션에 추가하여 저장합니다.
 */
export async function addAnonymousLink(
  input: Omit<AddBlockInput, "createdAt"> & { order?: number }
): Promise<LinkBlock> {
  try {
    const linksRef = collection(db, "users", "anonymous", "links");

    const newLinkData: {
      type: BlockType;
      title: string;
      url: string;
      description?: string;
      isActive: boolean;
      order: number;
      createdAt: ReturnType<typeof serverTimestamp>;
    } = {
      type: input.type || "link",
      title: input.title.trim(),
      url: input.url || "",
      isActive: input.isActive ?? true,
      order: typeof input.order === "number" ? input.order : 0,
      createdAt: serverTimestamp(),
    };

    if (input.description && input.description.trim()) {
      newLinkData.description = input.description.trim();
    }

    const docRef = await addDoc(linksRef, newLinkData);

    return {
      id: docRef.id,
      type: newLinkData.type,
      title: newLinkData.title,
      url: newLinkData.url,
      description: newLinkData.description,
      isActive: newLinkData.isActive,
      order: newLinkData.order,
      createdAt: Timestamp.now(),
    };
  } catch (error) {
    console.error("Firestore 링크 저장 실패 (users/anonymous/links):", error);
    throw error;
  }
}

/**
 * Firestore 경로 `users/anonymous/links/{id}` 문서를 수정합니다.
 */
export async function updateAnonymousLink(
  id: string,
  input: {
    title?: string;
    url?: string;
    description?: string;
    isActive?: boolean;
    order?: number;
  }
): Promise<void> {
  try {
    const linkDocRef = doc(db, "users", "anonymous", "links", id);
    const updateData: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    };

    if (input.title !== undefined) {
      updateData.title = input.title.trim();
    }
    if (input.url !== undefined) {
      updateData.url = input.url.trim();
    }
    if (input.description !== undefined) {
      const trimmedDesc = input.description.trim();
      updateData.description = trimmedDesc ? trimmedDesc : deleteField();
    }
    if (input.isActive !== undefined) {
      updateData.isActive = input.isActive;
    }
    if (input.order !== undefined) {
      updateData.order = input.order;
    }

    await updateDoc(linkDocRef, updateData);
  } catch (error) {
    console.error(`Firestore 링크 수정 실패 (users/anonymous/links/${id}):`, error);
    throw error;
  }
}

/**
 * Firestore 경로 `users/anonymous/links/{id}` 문서를 삭제합니다.
 */
export async function deleteAnonymousLink(id: string): Promise<void> {
  try {
    const linkDocRef = doc(db, "users", "anonymous", "links", id);
    await deleteDoc(linkDocRef);
  } catch (error) {
    console.error(`Firestore 링크 삭제 실패 (users/anonymous/links/${id}):`, error);
    throw error;
  }
}
