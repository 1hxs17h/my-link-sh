export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-black text-zinc-800 dark:text-zinc-200">
      <div className="w-full max-w-sm rounded-3xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md p-8 shadow-xl shadow-zinc-200/50 dark:shadow-none border border-zinc-200/60 dark:border-zinc-800 text-center flex flex-col items-center">
        {/* 프로필 아바타 */}
        <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-3xl font-bold text-white shadow-md">
          <span>홍</span>
          <span
            className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white dark:border-zinc-900 bg-emerald-500"
            title="현재 활동 중"
          />
        </div>

        {/* 이름 */}
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          홍길동
        </h1>

        {/* 서브 타이틀 / 배지 */}
        <span className="mt-2 inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-950/50 dark:text-blue-300 dark:ring-blue-700/30">
          대학생 · Vibe Coding
        </span>

        {/* 구분선 */}
        <div className="my-6 h-px w-16 bg-zinc-200 dark:bg-zinc-800" />

        {/* 소개글 */}
        <p className="text-base leading-relaxed text-zinc-600 dark:text-zinc-300 break-keep">
          안녕하세요! 바이브 코딩을 배우고 있는 대학생입니다.
        </p>
      </div>
    </main>
  );
}
