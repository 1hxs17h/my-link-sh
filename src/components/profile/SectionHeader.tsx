export function SectionHeader({ title }: { title: string }) {
  return (
    <h2 className="text-lg font-bold text-foreground mt-8 mb-3 tracking-tight px-1">
      {title}
    </h2>
  );
}
