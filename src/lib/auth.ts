import {
  signInWithPopup,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

/**
 * Google 팝업 소셜 로그인을 수행합니다.
 */
export async function loginWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: unknown) {
    const authError = error as { code?: string; message?: string };
    // 팝업 닫힘/취소는 예외를 던지지 않고 null 반환
    if (
      authError.code === "auth/popup-closed-by-user" ||
      authError.code === "auth/cancelled-popup-request"
    ) {
      return null;
    }
    console.error("Google 로그인 실패:", error);
    throw error;
  }
}

/**
 * 로그아웃을 수행합니다.
 */
export async function logout(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("로그아웃 실패:", error);
    throw error;
  }
}

/**
 * onAuthStateChanged를 통해 Firebase 인증 상태 변화를 감지합니다.
 */
export function onAuthListener(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
