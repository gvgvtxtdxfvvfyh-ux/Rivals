import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame, Trophy, BookOpen, FileText, Crown, Swords } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ProgressData {
  user: {
    id: string;
    name: string;
    userIcon: string;
    streak: number;
    physics: { lectures: number; dpps: number };
    chemistry: { lectures: number; dpps: number };
    math: { lectures: number; dpps: number };
  };
  rival: {
    id: string;
    name: string;
    userIcon: string;
    streak: number;
    physics: { lectures: number; dpps: number };
    chemistry: { lectures: number; dpps: number };
    math: { lectures: number; dpps: number };
  };
}

interface BattleInfo {
  endDate: string;
  hasEnded: boolean;
  daysRemaining: number;
  userTotal: number;
  rivalTotal: number;
  winner: "user" | "rival" | "tie";
}

export default function Dashboard() {
  const { data: progressData, isLoading } = useQuery<ProgressData>({
    queryKey: ["/api/progress/dashboard"],
    refetchInterval: 1000, // Refetch every second for live updates
  });

  const { data: battleInfo } = useQuery<BattleInfo>({
    queryKey: ["/api/battle/info"],
    refetchInterval: 1000, // Refetch every second for live updates
  });

  if (isLoading || !progressData) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const chartData = [
    {
      subject: "Physics",
      [`${progressData.user.userIcon} Lectures`]: progressData.user.physics.lectures,
      [`${progressData.rival.userIcon} Lectures`]: progressData.rival.physics.lectures,
      [`${progressData.user.userIcon} DPPs`]: progressData.user.physics.dpps,
      [`${progressData.rival.userIcon} DPPs`]: progressData.rival.physics.dpps,
    },
    {
      subject: "Chemistry",
      [`${progressData.user.userIcon} Lectures`]: progressData.user.chemistry.lectures,
      [`${progressData.rival.userIcon} Lectures`]: progressData.rival.chemistry.lectures,
      [`${progressData.user.userIcon} DPPs`]: progressData.user.chemistry.dpps,
      [`${progressData.rival.userIcon} DPPs`]: progressData.rival.chemistry.dpps,
    },
    {
      subject: "Math",
      [`${progressData.user.userIcon} Lectures`]: progressData.user.math.lectures,
      [`${progressData.rival.userIcon} Lectures`]: progressData.rival.math.lectures,
      [`${progressData.user.userIcon} DPPs`]: progressData.user.math.dpps,
      [`${progressData.rival.userIcon} DPPs`]: progressData.rival.math.dpps,
    },
  ];

  const userTotal = progressData.user.physics.lectures + progressData.user.physics.dpps +
    progressData.user.chemistry.lectures + progressData.user.chemistry.dpps +
    progressData.user.math.lectures + progressData.user.math.dpps;

  const rivalTotal = progressData.rival.physics.lectures + progressData.rival.physics.dpps +
    progressData.rival.chemistry.lectures + progressData.rival.chemistry.dpps +
    progressData.rival.math.lectures + progressData.rival.math.dpps;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Battle Dashboard</h1>
        <p className="text-muted-foreground">Track your progress against your rival</p>
      </div>

      {battleInfo && (
        <Card className={`border-2 ${battleInfo.hasEnded ? "border-destructive/50 bg-destructive/5" : "border-chart-3/50"}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-lg">{battleInfo.hasEnded ? "⚔️ Battle Ended" : "⚔️ Battle in Progress"}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Ends April 1, 2026
              </p>
            </div>
            <div className="text-right">
              {battleInfo.hasEnded ? (
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">Winner:</div>
                  {battleInfo.winner === "user" ? (
                    <div className="flex items-center gap-2 text-lg font-bold text-chart-1">
                      <Crown className="w-5 h-5" />
                      You Won!
                    </div>
                  ) : battleInfo.winner === "rival" ? (
                    <div className="text-lg font-bold text-chart-2">They Won</div>
                  ) : (
                    <div className="text-lg font-bold text-muted-foreground">It's a Tie!</div>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-chart-3">{battleInfo.daysRemaining}</div>
                  <div className="text-xs text-muted-foreground">days remaining</div>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="text-sm text-muted-foreground mb-1">Your Score</div>
                <div className="text-2xl font-bold">{battleInfo.userTotal}</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="text-sm text-muted-foreground mb-1">Rival's Score</div>
                <div className="text-2xl font-bold">{battleInfo.rivalTotal}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-card-border overflow-hidden relative bg-gradient-to-br from-card via-card to-card/80 shadow-xl">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-red-500 to-orange-600" />
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <CardTitle className="text-sm font-semibold tracking-tight">Your Streak</CardTitle>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center border border-orange-500/30">
              <Flame className="w-6 h-6 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-7xl font-bold tabular-nums bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent" data-testid="text-user-streak">
                {progressData.user.streak}
              </span>
              <span className="text-2xl text-muted-foreground font-medium">days</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-card-border/30 backdrop-blur">
              <span className="text-3xl">{progressData.user.userIcon}</span>
              <div>
                <span className="text-sm font-semibold text-foreground block">
                  {progressData.user.name}
                </span>
                <span className="text-xs text-muted-foreground">Active player</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 font-medium">
              💡 Complete 1+ task daily to maintain your streak
            </p>
          </CardContent>
        </Card>

        <Card className="border border-card-border overflow-hidden relative bg-gradient-to-br from-card via-card to-card/80 shadow-xl">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600" />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <CardTitle className="text-sm font-semibold tracking-tight">{progressData.rival.name}'s Streak</CardTitle>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-blue-500/30">
              <Trophy className="w-6 h-6 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-7xl font-bold tabular-nums bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent" data-testid="text-rival-streak">
                {progressData.rival.streak}
              </span>
              <span className="text-2xl text-muted-foreground font-medium">days</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-card-border/30 backdrop-blur">
              <span className="text-3xl">{progressData.rival.userIcon}</span>
              <div>
                <span className="text-sm font-semibold text-foreground block">
                  {progressData.rival.name}
                </span>
                <span className="text-xs text-muted-foreground">Rival</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 font-medium">
              {progressData.rival.streak > progressData.user.streak
                ? "⚡ They're leading! Time to catch up"
                : progressData.user.streak > progressData.rival.streak
                ? "🎯 You're ahead! Keep the momentum"
                : "🔥 Neck and neck - it's anyone's game!"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Progress Comparison</CardTitle>
          <p className="text-sm text-muted-foreground">
            Completed lectures and DPPs by subject
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis
                  dataKey="subject"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Legend wrapperStyle={{ paddingTop: "20px" }} />
                <Bar
                  dataKey={`${progressData.user.userIcon} Lectures`}
                  fill="hsl(var(--chart-1))"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey={`${progressData.rival.userIcon} Lectures`}
                  fill="hsl(var(--chart-2))"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey={`${progressData.user.userIcon} DPPs`}
                  fill="hsl(var(--chart-4))"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey={`${progressData.rival.userIcon} DPPs`}
                  fill="hsl(var(--chart-5))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-2xl">{progressData.user.userIcon}</span>
                <span className="font-semibold">{progressData.user.name}</span>
              </div>
              <div className="text-3xl font-bold tabular-nums" data-testid="text-user-total">
                {userTotal}
              </div>
              <p className="text-xs text-muted-foreground">total completed</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-2xl">{progressData.rival.userIcon}</span>
                <span className="font-semibold">{progressData.rival.name}</span>
              </div>
              <div className="text-3xl font-bold tabular-nums" data-testid="text-rival-total">
                {rivalTotal}
              </div>
              <p className="text-xs text-muted-foreground">total completed</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
