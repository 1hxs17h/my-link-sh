import { SocialLinks } from "@/types/mylink";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";
import { Code, Camera, Video, MessageCircle, Mail, Globe } from "lucide-react";

export function SocialLinksBar({ socials }: { socials: SocialLinks }) {
  const links = [
    { key: "github", icon: Code, url: socials.github },
    { key: "instagram", icon: Camera, url: socials.instagram },
    { key: "youtube", icon: Video, url: socials.youtube },
    { key: "twitter", icon: MessageCircle, url: socials.twitter },
    { key: "email", icon: Mail, url: socials.email },
    { key: "website", icon: Globe, url: socials.website },
  ].filter((link) => link.url);

  if (links.length === 0) return null;

  return (
    <div className="flex justify-center flex-wrap gap-3">
      {links.map(({ key, icon: Icon, url }) => (
        <a 
          key={key}
          href={url} 
          target="_blank" 
          rel="noopener noreferrer" 
          aria-label={key}
          className={cn(
            buttonVariants({ variant: "outline", size: "icon" }), 
            "rounded-full h-12 w-12 hover:-translate-y-0.5 transition-transform shadow-sm"
          )}
        >
          <Icon className="h-5 w-5 text-secondary-foreground" />
        </a>
      ))}
    </div>
  );
}
