import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Flame,
  Trophy,
  BookOpen,
  FileText,
  Atom,
  FlaskConical,
  Calculator,
  Crown,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface DashboardData {
  user: {
    id: string;
    name: string;
    userIcon: string;
    profileImageUrl: string | null;
    totalCompletions: number;
    lectureCompletions: number;
    dppCompletions: number;
    physics: number;
    chemistry: number;
    mathematics: number;
    streak: number;
    achievements: number;
  };
  rival: {
    id: string;
    name: string;
    userIcon: string;
    profileImageUrl: string | null;
    totalCompletions: number;
    lectureCompletions: number;
    dppCompletions: number;
    physics: number;
    chemistry: number;
    mathematics: number;
    streak: number;
    achievements: number;
  } | null;
  totalLectures: number;
  totalDpps: number;
}

const COLORS = {
  physics: "hsl(217, 91%, 60%)",
  chemistry: "hsl(142, 76%, 36%)",
  mathematics: "hsl(271, 91%, 65%)",
};

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: typeof Trophy;
  trend?: "up" | "down" | "neutral";
  color?: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold" style={{ color }}>
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div
            className="p-3 rounded-xl"
            style={{
              backgroundColor: color ? `${color}15` : "hsl(var(--muted))",
            }}
          >
            <Icon
              className="w-6 h-6"
              style={{ color: color || "hsl(var(--muted-foreground))" }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RivalComparison({
  userData,
  rivalData,
  label,
  maxValue,
}: {
  userData: number;
  rivalData: number;
  label: string;
  maxValue: number;
}) {
  const userPercentage = maxValue > 0 ? (userData / maxValue) * 100 : 0;
  const rivalPercentage = maxValue > 0 ? (rivalData / maxValue) * 100 : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">
          {userData} vs {rivalData}
        </span>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-green-600 dark:text-green-400 w-8">You</span>
          <Progress value={userPercentage} className="flex-1 h-2" />
          <span className="text-xs font-medium w-8">{userData}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-orange-600 dark:text-orange-400 w-8">Rival</span>
          <Progress value={rivalPercentage} className="flex-1 h-2 [&>div]:bg-orange-500" />
          <span className="text-xs font-medium w-8">{rivalData}</span>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["/api/progress/dashboard"],
    refetchInterval: 2000,
  });

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-48 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
            <p className="text-muted-foreground">
              Start completing lectures and DPPs to see your progress here.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pieData = [
    { name: "Physics", value: data.user.physics, color: COLORS.physics },
    { name: "Chemistry", value: data.user.chemistry, color: COLORS.chemistry },
    { name: "Mathematics", value: data.user.mathematics, color: COLORS.mathematics },
  ];

  const isLeading = data.rival
    ? data.user.totalCompletions > data.rival.totalCompletions
    : true;

  const totalItems = data.totalLectures + data.totalDpps;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Completions"
          value={data.user.totalCompletions}
          subtitle={`of ${totalItems} items`}
          icon={Trophy}
          color="hsl(217, 91%, 60%)"
        />
        <StatCard
          title="Lectures Done"
          value={data.user.lectureCompletions}
          subtitle={`of ${data.totalLectures} lectures`}
          icon={BookOpen}
          color="hsl(142, 76%, 36%)"
        />
        <StatCard
          title="DPPs Done"
          value={data.user.dppCompletions}
          subtitle={`of ${data.totalDpps} DPPs`}
          icon={FileText}
          color="hsl(27, 96%, 61%)"
        />
        <StatCard
          title="Current Streak"
          value={data.user.streak}
          subtitle="days"
          icon={Flame}
          color="hsl(25, 95%, 53%)"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Subject Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center p-3 rounded-lg bg-blue-500/10">
                <Atom className="w-5 h-5 mx-auto text-blue-500 mb-1" />
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {data.user.physics}
                </p>
                <p className="text-xs text-muted-foreground">Physics</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-green-500/10">
                <FlaskConical className="w-5 h-5 mx-auto text-green-500 mb-1" />
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  {data.user.chemistry}
                </p>
                <p className="text-xs text-muted-foreground">Chemistry</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-purple-500/10">
                <Calculator className="w-5 h-5 mx-auto text-purple-500 mb-1" />
                <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {data.user.mathematics}
                </p>
                <p className="text-xs text-muted-foreground">Math</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {data.rival ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Rival Comparison
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 border-2 border-green-500">
                    <AvatarImage
                      src={data.user.profileImageUrl || undefined}
                      alt={data.user.name}
                    />
                    <AvatarFallback className="bg-green-500/10 text-green-600">
                      {data.user.userIcon || data.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{data.user.name}</p>
                    <p className="text-sm text-green-600 dark:text-green-400">You</p>
                  </div>
                </div>
                {isLeading && (
                  <Crown className="w-6 h-6 text-yellow-500" />
                )}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-medium">{data.rival.name}</p>
                    <p className="text-sm text-orange-600 dark:text-orange-400">Rival</p>
                  </div>
                  <Avatar className="w-12 h-12 border-2 border-orange-500">
                    <AvatarImage
                      src={data.rival.profileImageUrl || undefined}
                      alt={data.rival.name}
                    />
                    <AvatarFallback className="bg-orange-500/10 text-orange-600">
                      {data.rival.userIcon || data.rival.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                {!isLeading && (
                  <Crown className="w-6 h-6 text-yellow-500" />
                )}
              </div>

              <div className="space-y-4">
                <RivalComparison
                  userData={data.user.totalCompletions}
                  rivalData={data.rival.totalCompletions}
                  label="Total Completions"
                  maxValue={totalItems}
                />
                <RivalComparison
                  userData={data.user.physics}
                  rivalData={data.rival.physics}
                  label="Physics"
                  maxValue={Math.max(data.user.physics, data.rival.physics, 50)}
                />
                <RivalComparison
                  userData={data.user.chemistry}
                  rivalData={data.rival.chemistry}
                  label="Chemistry"
                  maxValue={Math.max(data.user.chemistry, data.rival.chemistry, 50)}
                />
                <RivalComparison
                  userData={data.user.mathematics}
                  rivalData={data.rival.mathematics}
                  label="Mathematics"
                  maxValue={Math.max(data.user.mathematics, data.rival.mathematics, 50)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-orange-500 mb-1">
                    <Flame className="w-4 h-4" />
                    <span className="text-lg font-bold">{data.user.streak}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Your Streak</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-orange-500 mb-1">
                    <Flame className="w-4 h-4" />
                    <span className="text-lg font-bold">{data.rival.streak}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Rival Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-full py-12">
              <Users className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Rival Yet</h3>
              <p className="text-muted-foreground text-center">
                Share your rival code with a friend to start competing!
              </p>
              <Badge variant="secondary" className="mt-4 font-mono">
                {user?.rivalCode}
              </Badge>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
