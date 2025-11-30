import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Trophy, TrendingUp } from "lucide-react";

interface SubjectProgress {
  lectures: { completed: number; total: number };
  dpps: { completed: number; total: number };
  percentage: number;
}

interface ProgressData {
  user: {
    name: string;
    userIcon: string;
    physics: SubjectProgress;
    chemistry: SubjectProgress;
    math: SubjectProgress;
    overall: number;
  };
  rival: {
    name: string;
    userIcon: string;
    physics: SubjectProgress;
    chemistry: SubjectProgress;
    math: SubjectProgress;
    overall: number;
  };
}

const CircularProgress = ({ percentage, size = 200 }: { percentage: number; size?: number }) => {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth="12"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--chart-1))"
          strokeWidth="12"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-4xl font-bold tabular-nums">{Math.round(percentage)}%</span>
      </div>
    </div>
  );
};

export default function ProgressPage() {
  const { data: progressData, isLoading } = useQuery<ProgressData>({
    queryKey: ["/api/progress/detailed"],
  });

  if (isLoading || !progressData) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  const subjects = [
    { key: "physics", label: "Physics", data: progressData.user.physics },
    { key: "chemistry", label: "Chemistry", data: progressData.user.chemistry },
    { key: "math", label: "Mathematics", data: progressData.user.math },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Progress Overview</h1>
        <p className="text-muted-foreground">Detailed breakdown of your battle progress</p>
      </div>

      <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-card/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Overall Progress</CardTitle>
              <p className="text-sm text-muted-foreground">Combined completion across all subjects</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{progressData.user.userIcon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{progressData.user.name}</span>
                    <span className="text-2xl font-bold tabular-nums">
                      {Math.round(progressData.user.overall)}%
                    </span>
                  </div>
                  <Progress value={progressData.user.overall} className="h-3" />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{progressData.rival.userIcon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{progressData.rival.name}</span>
                    <span className="text-2xl font-bold tabular-nums">
                      {Math.round(progressData.rival.overall)}%
                    </span>
                  </div>
                  <Progress value={progressData.rival.overall} className="h-3" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {subjects.map((subject, idx) => (
          <Card key={subject.key} className="overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full bg-chart-${idx + 1}`}
                  style={{
                    backgroundColor:
                      idx === 0
                        ? "hsl(var(--chart-1))"
                        : idx === 1
                        ? "hsl(var(--chart-2))"
                        : "hsl(var(--chart-3))",
                  }}
                />
                {subject.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <CircularProgress percentage={subject.data.percentage} size={180} />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                  <span className="text-sm font-medium">Lectures</span>
                  <span className="text-sm font-bold tabular-nums">
                    {subject.data.lectures.completed}/{subject.data.lectures.total}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                  <span className="text-sm font-medium">DPPs</span>
                  <span className="text-sm font-bold tabular-nums">
                    {subject.data.dpps.completed}/{subject.data.dpps.total}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-primary/10 rounded-md border border-primary/20">
                  <span className="text-sm font-semibold">Total Items</span>
                  <span className="text-sm font-bold tabular-nums">
                    {subject.data.lectures.completed + subject.data.dpps.completed}/
                    {subject.data.lectures.total + subject.data.dpps.total}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Comparison Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {subjects.map((subject, idx) => {
              const rivalData =
                subject.key === "physics"
                  ? progressData.rival.physics
                  : subject.key === "chemistry"
                  ? progressData.rival.chemistry
                  : progressData.rival.math;

              const userAhead = subject.data.percentage > rivalData.percentage;
              const difference = Math.abs(subject.data.percentage - rivalData.percentage);

              return (
                <div key={subject.key} className="p-4 border border-card-border rounded-lg space-y-2">
                  <h3 className="font-semibold text-sm">{subject.label}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">You</span>
                    <span className="text-lg font-bold tabular-nums">
                      {Math.round(subject.data.percentage)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{progressData.rival.name}</span>
                    <span className="text-lg font-bold tabular-nums">
                      {Math.round(rivalData.percentage)}%
                    </span>
                  </div>
                  {difference > 0 && (
                    <p
                      className={`text-xs ${
                        userAhead ? "text-chart-1" : "text-destructive"
                      }`}
                    >
                      {userAhead
                        ? `You're ahead by ${difference.toFixed(1)}%`
                        : `Behind by ${difference.toFixed(1)}%`}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
