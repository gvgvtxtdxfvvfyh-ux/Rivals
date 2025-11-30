import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Lock, Calendar, Star } from "lucide-react";
import { ACHIEVEMENT_DEFINITIONS } from "@shared/schema";

interface AchievementData {
  achievements: {
    name: string;
    unlockedAt: string;
  }[];
  stats: {
    total: number;
    unlocked: number;
  };
}

export default function Achievements() {
  const { data, isLoading } = useQuery<AchievementData>({
    queryKey: ["/api/achievements/all"],
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const unlockedAchievements = new Set(data?.achievements.map((a) => a.name) || []);
  const getUnlockDate = (name: string) => {
    const achievement = data?.achievements.find((a) => a.name === name);
    return achievement?.unlockedAt;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Trophy className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Achievements</h2>
            <p className="text-sm text-muted-foreground">
              Unlock milestones as you progress
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="px-4 py-2 text-base gap-2">
          <Star className="w-4 h-4 text-yellow-500" />
          {data?.stats.unlocked || 0} / {data?.stats.total || ACHIEVEMENT_DEFINITIONS.length}
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {ACHIEVEMENT_DEFINITIONS.map((achievement) => {
          const isUnlocked = unlockedAchievements.has(achievement.name);
          const unlockDate = getUnlockDate(achievement.name);

          return (
            <Card
              key={achievement.name}
              className={`transition-all ${
                isUnlocked
                  ? "bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20"
                  : "opacity-60 grayscale"
              }`}
              data-testid={`achievement-${achievement.name.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <CardContent className="p-4 text-center">
                <div
                  className={`relative w-16 h-16 mx-auto mb-3 rounded-xl flex items-center justify-center text-3xl ${
                    isUnlocked
                      ? "bg-primary/10"
                      : "bg-muted"
                  }`}
                >
                  {isUnlocked ? (
                    achievement.icon
                  ) : (
                    <Lock className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <h3
                  className={`font-semibold text-sm mb-1 ${
                    isUnlocked ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {achievement.name}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {achievement.description}
                </p>
                {isUnlocked && unlockDate && (
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {new Date(unlockDate).toLocaleDateString()}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
