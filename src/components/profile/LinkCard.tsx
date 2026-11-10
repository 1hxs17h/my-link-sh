import { LinkBlock } from "@/types/mylink";
import { Card } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

export function LinkCard({ block }: { block: LinkBlock }) {
  if (block.type !== "link" || !block.isActive || !block.url) return null;

  return (
    <a href={block.url} target="_blank" rel="noopener noreferrer" className="block w-full">
      <Card className="w-full flex items-center justify-between p-4 mb-3 hover:-translate-y-0.5 transition-transform hover:shadow-md cursor-pointer border-border">
        <div className="flex flex-col space-y-1 overflow-hidden pr-4">
          <span className="font-semibold text-foreground text-base truncate">
            {block.title}
          </span>
          {block.description && (
            <span className="text-sm text-muted-foreground truncate">
              {block.description}
            </span>
          )}
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
      </Card>
    </a>
  );
}
