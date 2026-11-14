import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-12 mb-8 text-center pb-8">
      <Link href="/" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
        마이링크로 나만의 프로필을 만들어보세요
      </Link>
    </footer>
  );
}
