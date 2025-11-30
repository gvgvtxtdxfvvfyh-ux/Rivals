import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Lock } from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  earned_at?: string;
}

interface AchievementsData {
  user: {
    id: string;
    name: string;
    userIcon: string;
  };
  rival: {
    id: string;
    name: string;
    userIcon: string;
  };
  userAchievements: Achievement[];
  rivalAchievements: Achievement[];
}

const categories = [
  { key: "starter", label: "Starter", color: "bg-green-500/10 text-green-700 dark:text-green-400" },
  { key: "milestone", label: "Milestones", color: "bg-blue-500/10 text-blue-700 dark:text-blue-400" },
  { key: "subject", label: "Subjects", color: "bg-purple-500/10 text-purple-700 dark:text-purple-400" },
  { key: "streak", label: "Streaks", color: "bg-orange-500/10 text-orange-700 dark:text-orange-400" },
  { key: "perfect", label: "Perfect", color: "bg-pink-500/10 text-pink-700 dark:text-pink-400" },
  { key: "competitive", label: "Competitive", color: "bg-red-500/10 text-red-700 dark:text-red-400" },
  { key: "special", label: "Special", color: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400" },
];

export default function AchievementsPage() {
  const { data, isLoading } = useQuery<AchievementsData>({
    queryKey: ["/api/achievements/compare"],
    refetchInterval: 1000,
  });

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  const userEarned = new Set(data.userAchievements.filter((a) => a.earned_at).map((a) => a.id));
  const rivalEarned = new Set(data.rivalAchievements.filter((a) => a.earned_at).map((a) => a.id));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Achievements</h1>
        <p className="text-muted-foreground">Unlock achievements and compare with your rival</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{data.user.userIcon}</span>
              <div>
                <CardTitle>{data.user.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{userEarned.size} achievements earned</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{data.rival.userIcon}</span>
              <div>
                <CardTitle>{data.rival.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{rivalEarned.size} achievements earned</p>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      <div className="space-y-6">
        {categories.map((cat) => {
          const categoryAchievements = data.userAchievements.filter((a) => a.category === cat.key);
          if (categoryAchievements.length === 0) return null;

          return (
            <div key={cat.key} className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Badge variant="secondary">{cat.label}</Badge>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryAchievements.map((achievement) => {
                  const userHas = userEarned.has(achievement.id);
                  const rivalHas = rivalEarned.has(achievement.id);

                  return (
                    <Card
                      key={achievement.id}
                      className={`transition-all ${userHas || rivalHas ? "" : "opacity-50"}`}
                    >
                      <CardContent className="pt-6">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="text-3xl">{achievement.icon}</div>
                            <div className="flex gap-1">
                              {userHas && (
                                <Badge variant="outline" className="bg-chart-1/10 text-chart-1 border-chart-1/30">
                                  {data.user.userIcon}
                                </Badge>
                              )}
                              {rivalHas && (
                                <Badge variant="outline" className="bg-chart-2/10 text-chart-2 border-chart-2/30">
                                  {data.rival.userIcon}
                                </Badge>
                              )}
                              {!userHas && !rivalHas && <Lock className="w-4 h-4 text-muted-foreground" />}
                            </div>
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm">{achievement.name}</h3>
                            <p className="text-xs text-muted-foreground">{achievement.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
