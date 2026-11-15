import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UpdateProfileInput, ProfileData } from "@/types/mylink";
import { USERNAME_REGEX } from "./validations/profile";

export interface UsernameCheckResult {
  available: boolean;
  message: string;
}

/**
 * 사용자 이름(username)의 사용 가능 여부 및 중복을 확인합니다.
 */
export async function checkUsernameAvailability(
  rawUsername: string,
  currentUserId?: string,
  currentUsername?: string
): Promise<UsernameCheckResult> {
  const username = rawUsername.trim();

  if (!username) {
    return {
      available: false,
      message: "사용자 이름을 입력해주세요.",
    };
  }

  if (username.length < 2) {
    return {
      available: false,
      message: "사용자 이름은 2자 이상 입력해주세요.",
    };
  }

  if (username.length > 20) {
    return {
      available: false,
      message: "사용자 이름은 최대 20자까지 가능해요.",
    };
  }

  if (!USERNAME_REGEX.test(username)) {
    return {
      available: false,
      message: "영문, 숫자, 밑줄(_), 하이픈(-), 마침표(.)만 사용할 수 있어요.",
    };
  }

  const normalized = username.toLowerCase();
  const currentNormalized = currentUsername?.trim().toLowerCase();

  // 본인의 현재 사용자 이름인 경우 사용 가능으로 처리
  if (currentNormalized && normalized === currentNormalized) {
    return {
      available: true,
      message: "현재 사용 중인 사용자 이름이에요.",
    };
  }

  try {
    // 1. usernames/{normalized} 매핑 문서 확인 (O(1) 단일 읽기)
    const usernameRef = doc(db, "usernames", normalized);
    const usernameDoc = await getDoc(usernameRef);

    if (usernameDoc.exists()) {
      const data = usernameDoc.data();
      if (data?.uid && data.uid !== currentUserId) {
        return {
          available: false,
          message: "이미 사용 중인 사용자 이름이에요.",
        };
      }
    }

    // 2. users 컬렉션에서 username 중복 보조 검사
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", normalized));
      const querySnapshot = await getDocs(q);

      for (const userDoc of querySnapshot.docs) {
        if (userDoc.id !== currentUserId) {
          return {
            available: false,
            message: "이미 사용 중인 사용자 이름이에요.",
          };
        }
      }
    } catch (queryErr) {
      // 인덱스 미생성 또는 권한 제약 시 usernames 매핑 문서 결과로 대체
      console.warn("users 컬렉션 username 쿼리 생략:", queryErr);
    }

    return {
      available: true,
      message: "사용 가능한 사용자 이름이에요.",
    };
  } catch (error) {
    console.error("username 중복 확인 중 오류:", error);
    throw new Error("중복 확인에 실패했습니다. 다시 시도해주세요.");
  }
}

/**
 * Firestore에서 사용자의 프로필 정보를 불러옵니다.
 * 경로: users/{userId} (profile 필드) 및 서브컬렉션 users/{userId}/profile/info
 */
export async function getUserProfile(
  userId: string
): Promise<(Partial<ProfileData> & { username?: string }) | null> {
  if (!userId) return null;

  try {
    // 1. users/{userId} 메인 문서 조회
    const userDocRef = doc(db, "users", userId);
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      const profile = (data.profile || {}) as Record<string, unknown>;

      const username =
        typeof profile.username === "string"
          ? profile.username
          : typeof data.username === "string"
          ? data.username
          : undefined;

      const name =
        typeof profile.name === "string"
          ? profile.name
          : typeof data.name === "string"
          ? data.name
          : undefined;

      const bio =
        typeof profile.bio === "string"
          ? profile.bio
          : typeof data.bio === "string"
          ? data.bio
          : undefined;

      return {
        username,
        name,
        bio,
      };
    }

    // 2. 혹시 서브컬렉션 users/{userId}/profile/info 에 저장되어 있을 경우 대비
    try {
      const subDocRef = doc(db, "users", userId, "profile", "info");
      const subSnap = await getDoc(subDocRef);
      if (subSnap.exists()) {
        const subData = subSnap.data();
        return {
          username: typeof subData.username === "string" ? subData.username : undefined,
          name: typeof subData.name === "string" ? subData.name : undefined,
          bio: typeof subData.bio === "string" ? subData.bio : undefined,
        };
      }
    } catch {
      // 서브컬렉션 조회 무시
    }

    return null;
  } catch (error) {
    console.error(`프로필 불러오기 실패 (users/${userId}):`, error);
    return null;
  }
}

/**
 * 사용자의 프로필(Username, 이름, 소개글)을 Firestore users/{userId}/profile에 저장/업데이트합니다.
 * 기존 데이터와 비교하여 변경 사항이 없는 경우 Firestore 업데이트를 수행하지 않습니다.
 * 반환값: 실제로 업데이트가 수행되었는지 여부 (boolean)
 */
export async function updateUserProfile(
  userId: string,
  input: UpdateProfileInput,
  currentProfile?: { username?: string; name?: string; bio?: string }
): Promise<boolean> {
  if (!userId) {
    throw new Error("사용자 식별자(userId)가 필요합니다.");
  }

  const normalizedUsername = input.username.trim().toLowerCase();
  const trimmedName = (input.name !== undefined ? input.name : currentProfile?.name || "").trim();
  const trimmedBio = input.bio.trim();

  const prevUsername = currentProfile?.username?.trim().toLowerCase() || "";
  const prevName = currentProfile?.name?.trim() || "";
  const prevBio = currentProfile?.bio?.trim() || "";

  const isUsernameChanged = normalizedUsername !== prevUsername;
  const isNameChanged = trimmedName !== prevName;
  const isBioChanged = trimmedBio !== prevBio;

  // 변동 사항이 전혀 없는 경우 Firestore 쓰기 작업을 일절 수행하지 않고 조기 종료
  if (!isUsernameChanged && !isNameChanged && !isBioChanged) {
    return false;
  }

  // 1. username이 변경된 경우에만 중복 여부 최종 재검증
  if (isUsernameChanged) {
    const check = await checkUsernameAvailability(
      normalizedUsername,
      userId,
      prevUsername
    );
    if (!check.available) {
      throw new Error(check.message);
    }
  }

  const profilePayload = {
    username: normalizedUsername,
    name: trimmedName,
    bio: trimmedBio,
    updatedAt: serverTimestamp(),
  };

  try {
    // 2. users/{userId} 문서에 profile 객체 및 최상위 필드로 저장
    const userDocRef = doc(db, "users", userId);
    await setDoc(
      userDocRef,
      {
        profile: profilePayload,
        username: normalizedUsername,
        name: trimmedName,
        bio: trimmedBio,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    // 3. 서브컬렉션 users/{userId}/profile/info 에도 동일하게 저장하여 완벽 호환
    try {
      const subDocRef = doc(db, "users", userId, "profile", "info");
      await setDoc(subDocRef, profilePayload, { merge: true });
    } catch (subErr) {
      console.warn("users/{userId}/profile 서브컬렉션 저장 경고:", subErr);
    }

    // 4. username이 실제로 변경된 경우에만 usernames 컬렉션 갱신
    if (isUsernameChanged) {
      // 이전 username이 있었다면 기존 username 문서 삭제
      if (prevUsername) {
        try {
          await deleteDoc(doc(db, "usernames", prevUsername));
        } catch (delErr) {
          console.warn("이전 username 매핑 삭제 실패:", delErr);
        }
      }

      // 새 username 문서 등록
      try {
        await setDoc(doc(db, "usernames", normalizedUsername), {
          uid: userId,
          updatedAt: serverTimestamp(),
        });
      } catch (unameErr) {
        console.warn("usernames 매핑 문서 등록 실패:", unameErr);
      }
    }

    return true;
  } catch (error) {
    console.error(`프로필 업데이트 실패 (users/${userId}):`, error);
    throw error;
  }
}

/**
 * displayName 또는 username으로 users 컬렉션에서 사용자를 검색합니다.
 * Firestore where 쿼리를 순차적으로 실행하여 해당하는 사용자의 userId와 ProfileData를 반환합니다.
 */
export async function getUserByDisplayName(
  rawDisplayName: string
): Promise<{ userId: string; profile: ProfileData } | null> {
  if (!rawDisplayName) return null;

  let target = "";
  try {
    target = decodeURIComponent(rawDisplayName).trim();
  } catch {
    target = rawDisplayName.trim();
  }

  // '@' 접두사가 포함된 경우 제거
  const normalized = (target.startsWith("@") ? target.slice(1) : target).trim();
  if (!normalized) return null;

  const lowerNormalized = normalized.toLowerCase();
  const usersRef = collection(db, "users");

  try {
    // 1. users 컬렉션에서 username 필드로 where 쿼리 검색
    let userSnapDoc: { id: string; data: () => Record<string, unknown> } | null = null;

    const qUsername = query(usersRef, where("username", "==", lowerNormalized));
    const snapUsername = await getDocs(qUsername);
    if (!snapUsername.empty) {
      const found = snapUsername.docs[0];
      userSnapDoc = { id: found.id, data: () => found.data() as Record<string, unknown> };
    }

    // 2. 일치하지 않으면 profile.username 필드로 where 쿼리 검색
    if (!userSnapDoc) {
      try {
        const qProfileUsername = query(
          usersRef,
          where("profile.username", "==", lowerNormalized)
        );
        const snapProfileUsername = await getDocs(qProfileUsername);
        if (!snapProfileUsername.empty) {
          const found = snapProfileUsername.docs[0];
          userSnapDoc = { id: found.id, data: () => found.data() as Record<string, unknown> };
        }
      } catch (err) {
        // 복합 인덱스 이슈 대비
        console.warn("profile.username 쿼리 생략:", err);
      }
    }

    // 3. 일치하지 않으면 displayName 필드로 where 쿼리 검색
    if (!userSnapDoc) {
      const qDisplayName = query(usersRef, where("displayName", "==", normalized));
      const snapDisplayName = await getDocs(qDisplayName);
      if (!snapDisplayName.empty) {
        const found = snapDisplayName.docs[0];
        userSnapDoc = { id: found.id, data: () => found.data() as Record<string, unknown> };
      }
    }

    // 4. 일치하지 않으면 name 필드로 where 쿼리 검색
    if (!userSnapDoc) {
      const qName = query(usersRef, where("name", "==", normalized));
      const snapName = await getDocs(qName);
      if (!snapName.empty) {
        const found = snapName.docs[0];
        userSnapDoc = { id: found.id, data: () => found.data() as Record<string, unknown> };
      }
    }

    // 5. 일치하지 않으면 usernames/{normalized} 매핑 문서 단일 읽기로 uid 확인
    if (!userSnapDoc) {
      const usernameMapRef = doc(db, "usernames", lowerNormalized);
      const usernameMapSnap = await getDoc(usernameMapRef);
      if (usernameMapSnap.exists()) {
        const mapData = usernameMapSnap.data();
        if (mapData?.uid) {
          const userDocRef = doc(db, "users", mapData.uid);
          const userDirectSnap = await getDoc(userDocRef);
          if (userDirectSnap.exists()) {
            userSnapDoc = {
              id: userDirectSnap.id,
              data: () => userDirectSnap.data() as Record<string, unknown>,
            };
          }
        }
      }
    }

    if (!userSnapDoc) {
      return null;
    }

    const data = userSnapDoc.data();
    const profileObj = (data.profile || {}) as Record<string, unknown>;

    const username =
      (typeof profileObj.username === "string" && profileObj.username) ||
      (typeof data.username === "string" && data.username) ||
      lowerNormalized;

    const name =
      (typeof profileObj.name === "string" && profileObj.name) ||
      (typeof data.name === "string" && data.name) ||
      (typeof data.displayName === "string" && data.displayName) ||
      normalized;

    const role =
      (typeof profileObj.role === "string" && profileObj.role) ||
      (typeof data.role === "string" && data.role) ||
      "";

    const statusBadge =
      (typeof profileObj.statusBadge === "string" && profileObj.statusBadge) ||
      (typeof data.statusBadge === "string" && data.statusBadge) ||
      "";

    const bio =
      (typeof profileObj.bio === "string" && profileObj.bio) ||
      (typeof data.bio === "string" && data.bio) ||
      "";

    const avatarUrl =
      (typeof profileObj.avatarUrl === "string" && profileObj.avatarUrl) ||
      (typeof data.avatarUrl === "string" && data.avatarUrl) ||
      (typeof data.photoURL === "string" && data.photoURL) ||
      "";

    const socials =
      ((profileObj.socials || data.socials || {}) as ProfileData["socials"]) || {};

    const profile: ProfileData = {
      username,
      name,
      role,
      statusBadge,
      bio,
      avatarUrl,
      socials,
    };

    return {
      userId: userSnapDoc.id,
      profile,
    };
  } catch (error) {
    console.error(`사용자 검색 실패 (displayName: ${rawDisplayName}):`, error);
    throw error;
  }
}
