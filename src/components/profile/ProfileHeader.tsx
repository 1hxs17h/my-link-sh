import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ProfileData } from "@/types/mylink";

export function ProfileHeader({ profile }: { profile: ProfileData }) {
  return (
    <div className="flex flex-col items-center text-center space-y-4">
      <Avatar className="h-24 w-24 border border-border shadow-sm">
        <AvatarImage src={profile.avatarUrl} alt={profile.name} />
        <AvatarFallback>{profile.name.slice(0, 2)}</AvatarFallback>
      </Avatar>
      
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{profile.name}</h1>
        <p className="text-muted-foreground font-medium">{profile.role}</p>
      </div>

      <Badge variant="secondary" className="px-3 py-1 font-semibold rounded-full bg-blue-50 text-primary hover:bg-blue-50">
        {profile.statusBadge}
      </Badge>

      <p className="text-foreground whitespace-pre-wrap max-w-sm text-sm">
        {profile.bio}
      </p>
    </div>
  );
}
