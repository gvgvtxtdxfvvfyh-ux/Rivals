import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Atom,
  FlaskConical,
  Calculator,
  Plus,
  BookOpen,
  FileText,
  Check,
  X,
  Users,
  Loader2,
} from "lucide-react";
import { CHAPTERS_DATA, type Subject } from "@shared/schema";

interface BattleData {
  chapters: {
    subject: Subject;
    chapter: string;
    lectures: {
      id: string;
      lectureNumber: string;
      lectureName: string;
      completedByUser: boolean;
      completedByRival: boolean;
    }[];
    dpps: {
      id: string;
      dppNumber: string;
      dppName: string;
      completedByUser: boolean;
      completedByRival: boolean;
    }[];
  }[];
  rival: {
    id: string;
    name: string;
    userIcon: string;
    profileImageUrl: string | null;
  } | null;
}

const subjectIcons: Record<Subject, typeof Atom> = {
  Physics: Atom,
  Chemistry: FlaskConical,
  Mathematics: Calculator,
};

const subjectColors: Record<Subject, string> = {
  Physics: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  Chemistry: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  Mathematics: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
};

function CompletionStatus({ user, rival }: { user: boolean; rival: boolean }) {
  if (user && rival) {
    return (
      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
        <Check className="w-3 h-3 mr-1" />
        Both
      </Badge>
    );
  }
  if (user) {
    return (
      <Badge variant="secondary" className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
        <Check className="w-3 h-3 mr-1" />
        You
      </Badge>
    );
  }
  if (rival) {
    return (
      <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20">
        <Users className="w-3 h-3 mr-1" />
        Rival
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="bg-muted text-muted-foreground">
      <X className="w-3 h-3 mr-1" />
      None
    </Badge>
  );
}

function AddItemDialog({ subject, chapter, type }: { subject: string; chapter: string; type: "lecture" | "dpp" }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [number, setNumber] = useState("");
  const [name, setName] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const endpoint = type === "lecture" ? "/api/pw/lectures" : "/api/pw/dpps";
      return apiRequest("POST", endpoint, {
        subject,
        chapter,
        [`${type}Number`]: number,
        [`${type}Name`]: name,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pw/all"] });
      toast({
        title: `${type === "lecture" ? "Lecture" : "DPP"} added`,
        description: `Successfully added ${name}`,
      });
      setOpen(false);
      setNumber("");
      setName("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          Add {type === "lecture" ? "Lecture" : "DPP"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New {type === "lecture" ? "Lecture" : "DPP"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{type === "lecture" ? "Lecture" : "DPP"} Number</label>
            <Input
              placeholder={type === "lecture" ? "e.g., L1" : "e.g., DPP1"}
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              data-testid={`input-${type}-number`}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{type === "lecture" ? "Lecture" : "DPP"} Name</label>
            <Input
              placeholder={`Enter ${type} name`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid={`input-${type}-name`}
            />
          </div>
          <Button
            onClick={() => mutation.mutate()}
            disabled={!number || !name || mutation.isPending}
            className="w-full"
            data-testid={`button-add-${type}`}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add {type === "lecture" ? "Lecture" : "DPP"}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function BattleArena() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeSubject, setActiveSubject] = useState<Subject | "all">("all");

  const { data, isLoading } = useQuery<BattleData>({
    queryKey: ["/api/pw/all"],
    refetchInterval: 2000,
  });

  const toggleLecture = useMutation({
    mutationFn: async (lectureId: string) => {
      return apiRequest("PATCH", `/api/pw/lectures/${lectureId}/toggle`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pw/all"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleDpp = useMutation({
    mutationFn: async (dppId: string) => {
      return apiRequest("PATCH", `/api/pw/dpps/${dppId}/toggle`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pw/all"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredChapters = data?.chapters.filter(
    (ch) => activeSubject === "all" || ch.subject === activeSubject
  ) || [];

  const subjects = Object.keys(CHAPTERS_DATA) as Subject[];

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex gap-2 flex-wrap">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 w-24" />
          ))}
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3].map((j) => (
                <Skeleton key={j} className="h-12 w-full" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={activeSubject === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveSubject("all")}
            data-testid="filter-all"
          >
            All Subjects
          </Button>
          {subjects.map((subject) => {
            const Icon = subjectIcons[subject];
            return (
              <Button
                key={subject}
                variant={activeSubject === subject ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveSubject(subject)}
                className="gap-2"
                data-testid={`filter-${subject.toLowerCase()}`}
              >
                <Icon className="w-4 h-4" />
                {subject}
              </Button>
            );
          })}
        </div>
        {data?.rival && (
          <Badge variant="secondary" className="gap-2 px-3 py-1.5">
            <Users className="w-4 h-4" />
            vs {data.rival.name}
          </Badge>
        )}
      </div>

      {filteredChapters.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Chapters Found</h3>
            <p className="text-muted-foreground">
              Chapters will appear here once they are loaded.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="multiple" className="space-y-3">
          {filteredChapters.map((chapter) => {
            const Icon = subjectIcons[chapter.subject];
            const userLectures = chapter.lectures.filter((l) => l.completedByUser).length;
            const userDpps = chapter.dpps.filter((d) => d.completedByUser).length;
            const rivalLectures = chapter.lectures.filter((l) => l.completedByRival).length;
            const rivalDpps = chapter.dpps.filter((d) => d.completedByRival).length;
            const totalItems = chapter.lectures.length + chapter.dpps.length;

            return (
              <AccordionItem
                key={`${chapter.subject}-${chapter.chapter}`}
                value={`${chapter.subject}-${chapter.chapter}`}
                className="border rounded-lg bg-card"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 rounded-t-lg data-[state=open]:rounded-b-none">
                  <div className="flex items-center gap-3 flex-1 min-w-0 text-left">
                    <div className={`p-2 rounded-lg ${subjectColors[chapter.subject]}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{chapter.chapter}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {chapter.lectures.length} lectures
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {chapter.dpps.length} DPPs
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="text-center">
                        <div className="font-semibold text-green-600 dark:text-green-400">
                          {userLectures + userDpps}/{totalItems}
                        </div>
                        <div className="text-muted-foreground">You</div>
                      </div>
                      {data?.rival && (
                        <div className="text-center">
                          <div className="font-semibold text-orange-600 dark:text-orange-400">
                            {rivalLectures + rivalDpps}/{totalItems}
                          </div>
                          <div className="text-muted-foreground">Rival</div>
                        </div>
                      )}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-6 pt-2">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-primary" />
                          Lectures
                        </h4>
                        <AddItemDialog
                          subject={chapter.subject}
                          chapter={chapter.chapter}
                          type="lecture"
                        />
                      </div>
                      {chapter.lectures.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-2">
                          No lectures added yet
                        </p>
                      ) : (
                        <div className="space-y-1">
                          {chapter.lectures.map((lecture) => (
                            <div
                              key={lecture.id}
                              className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                              data-testid={`lecture-${lecture.id}`}
                            >
                              <Checkbox
                                checked={lecture.completedByUser}
                                onCheckedChange={() => toggleLecture.mutate(lecture.id)}
                                disabled={toggleLecture.isPending}
                                data-testid={`checkbox-lecture-${lecture.id}`}
                              />
                              <div className="flex-1 min-w-0">
                                <span className="text-xs text-muted-foreground font-mono">
                                  {lecture.lectureNumber}
                                </span>
                                <p className="text-sm truncate">{lecture.lectureName}</p>
                              </div>
                              <CompletionStatus
                                user={lecture.completedByUser}
                                rival={lecture.completedByRival}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                          <FileText className="w-4 h-4 text-orange-500" />
                          DPPs
                        </h4>
                        <AddItemDialog
                          subject={chapter.subject}
                          chapter={chapter.chapter}
                          type="dpp"
                        />
                      </div>
                      {chapter.dpps.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-2">
                          No DPPs added yet
                        </p>
                      ) : (
                        <div className="space-y-1">
                          {chapter.dpps.map((dpp) => (
                            <div
                              key={dpp.id}
                              className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                              data-testid={`dpp-${dpp.id}`}
                            >
                              <Checkbox
                                checked={dpp.completedByUser}
                                onCheckedChange={() => toggleDpp.mutate(dpp.id)}
                                disabled={toggleDpp.isPending}
                                data-testid={`checkbox-dpp-${dpp.id}`}
                              />
                              <div className="flex-1 min-w-0">
                                <span className="text-xs text-muted-foreground font-mono">
                                  {dpp.dppNumber}
                                </span>
                                <p className="text-sm truncate">{dpp.dppName}</p>
                              </div>
                              <CompletionStatus
                                user={dpp.completedByUser}
                                rival={dpp.completedByRival}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
}
