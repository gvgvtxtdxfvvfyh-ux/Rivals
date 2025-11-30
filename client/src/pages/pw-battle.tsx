import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Plus, CheckCircle2, Circle, BookOpen, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface LectureOrDpp {
  id: string;
  subject: string;
  chapter: string;
  number: string;
  name: string;
  userCompleted: boolean;
  rivalCompleted: boolean;
}

interface PWData {
  user: { id: string; name: string; userIcon: string };
  rival: { id: string; name: string; userIcon: string };
  lectures: LectureOrDpp[];
  dpps: LectureOrDpp[];
}

const subjects = [
  { key: "Physics", label: "Physics", color: "chart-1" },
  { key: "Chemistry", label: "Chemistry", color: "chart-2" },
  { key: "Math", label: "Mathematics", color: "chart-3" },
];

export default function PWBattle() {
  const { toast } = useToast();
  const [addingLecture, setAddingLecture] = useState<string | null>(null);
  const [addingDpp, setAddingDpp] = useState<string | null>(null);
  const [lectureForm, setLectureForm] = useState({ chapter: "", number: "", name: "" });
  const [dppForm, setDppForm] = useState({ chapter: "", number: "", name: "" });

  const { data: pwData, isLoading } = useQuery<PWData>({
    queryKey: ["/api/pw/all"],
    refetchInterval: 1000, // Refetch every second for live updates
  });

  const addLectureMutation = useMutation({
    mutationFn: async (data: { subject: string; chapter: string; number: string; name: string }) => {
      return await apiRequest("POST", "/api/pw/lectures", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pw/all"] });
      setAddingLecture(null);
      setLectureForm({ chapter: "", number: "", name: "" });
      toast({ title: "Lecture added successfully" });
    },
  });

  const addDppMutation = useMutation({
    mutationFn: async (data: { subject: string; chapter: string; number: string; name: string }) => {
      return await apiRequest("POST", "/api/pw/dpps", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pw/all"] });
      setAddingDpp(null);
      setDppForm({ chapter: "", number: "", name: "" });
      toast({ title: "DPP added successfully" });
    },
  });

  const toggleLectureMutation = useMutation({
    mutationFn: async (lectureId: string) => {
      return await apiRequest("PATCH", `/api/pw/lectures/${lectureId}/toggle`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pw/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/progress/dashboard"] });
    },
  });

  const toggleDppMutation = useMutation({
    mutationFn: async (dppId: string) => {
      return await apiRequest("PATCH", `/api/pw/dpps/${dppId}/toggle`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pw/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/progress/dashboard"] });
    },
  });

  if (isLoading || !pwData) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  const getSubjectLectures = (subject: string) => {
    const lectures = pwData.lectures.filter((l) => l.subject === subject);
    return lectures.sort((a, b) => {
      const chapterA = parseInt(a.chapter?.match(/\d+/)?.[0] || "0");
      const chapterB = parseInt(b.chapter?.match(/\d+/)?.[0] || "0");
      if (chapterA !== chapterB) return chapterA - chapterB;
      return parseInt(a.number) - parseInt(b.number);
    });
  };
  const getSubjectDpps = (subject: string) => {
    const dpps = pwData.dpps.filter((d) => d.subject === subject);
    return dpps.sort((a, b) => {
      const chapterA = parseInt(a.chapter?.match(/\d+/)?.[0] || "0");
      const chapterB = parseInt(b.chapter?.match(/\d+/)?.[0] || "0");
      if (chapterA !== chapterB) return chapterA - chapterB;
      return parseInt(a.number) - parseInt(b.number);
    });
  };

  const groupByChapter = (items: LectureOrDpp[]) => {
    const grouped: { [key: string]: LectureOrDpp[] } = {};
    items.forEach((item) => {
      if (!grouped[item.chapter]) {
        grouped[item.chapter] = [];
      }
      grouped[item.chapter].push(item);
    });
    return grouped;
  };

  const renderStatus = (userCompleted: boolean, rivalCompleted: boolean) => {
    if (userCompleted && rivalCompleted) {
      return (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-chart-1/10 text-chart-1 border-chart-1/30">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Both Complete
          </Badge>
        </div>
      );
    }
    if (userCompleted) {
      return (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-chart-1">You ✓</span>
          <span className="text-muted-foreground">|</span>
          <span className="text-muted-foreground">{pwData?.rival.name} ✗</span>
        </div>
      );
    }
    if (rivalCompleted) {
      return (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">You ✗</span>
          <span className="text-muted-foreground">|</span>
          <span className="text-chart-2">{pwData?.rival.name} ✓</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>You ✗</span>
        <span>|</span>
        <span>{pwData?.rival.name} ✗</span>
      </div>
    );
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">PW Battle Arena</h1>
          <p className="text-muted-foreground">Track your Physics Wallah MHT-CET preparation</p>
        </div>
        <div className="flex items-center gap-4 p-3 bg-card border border-card-border rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{pwData.user.userIcon}</span>
            <span className="text-sm font-medium">{pwData.user.name}</span>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="flex items-center gap-2">
            <span className="text-2xl">{pwData.rival.userIcon}</span>
            <span className="text-sm font-medium">{pwData.rival.name}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <span className="text-sm text-muted-foreground self-center">Quick Jump:</span>
        {subjects.map((subject) => (
          <Button
            key={subject.key}
            size="sm"
            variant="outline"
            onClick={() => scrollToSection(subject.key)}
            data-testid={`button-jump-${subject.key.toLowerCase()}`}
          >
            {subject.label}
          </Button>
        ))}
      </div>

      <Accordion type="multiple" defaultValue={subjects.map((s) => s.key)} className="space-y-4">
        {subjects.map((subject) => {
          const lectures = getSubjectLectures(subject.key);
          const dpps = getSubjectDpps(subject.key);

          return (
            <AccordionItem key={subject.key} value={subject.key} className="border-none" id={subject.key}>
              <Card>
                <AccordionTrigger className="hover:no-underline px-6 py-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-3 h-3 rounded-full bg-${subject.color}`} />
                    <span className="text-xl font-semibold">{subject.label}</span>
                    <div className="flex items-center gap-4 ml-auto mr-4">
                      <Badge variant="secondary" className="tabular-nums">
                        {lectures.length} Lectures
                      </Badge>
                      <Badge variant="secondary" className="tabular-nums">
                        {dpps.length} DPPs
                      </Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="space-y-6 mt-4">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-muted-foreground" />
                          <h3 className="font-semibold">Lectures</h3>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setAddingLecture(subject.key)}
                          data-testid={`button-add-lecture-${subject.key.toLowerCase()}`}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Lecture
                        </Button>
                      </div>

                      {addingLecture === subject.key && (
                        <div className="flex flex-col gap-3 mb-4 p-4 bg-muted/50 rounded-md">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Chapter Name (e.g., Chapter 1: Basics)"
                              value={lectureForm.chapter}
                              onChange={(e) =>
                                setLectureForm({ ...lectureForm, chapter: e.target.value })
                              }
                              className="flex-1"
                              data-testid="input-lecture-chapter"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Lecture #"
                              value={lectureForm.number}
                              onChange={(e) =>
                                setLectureForm({ ...lectureForm, number: e.target.value })
                              }
                              className="w-32"
                              data-testid="input-lecture-number"
                            />
                            <Input
                              placeholder="Lecture Name"
                              value={lectureForm.name}
                              onChange={(e) =>
                                setLectureForm({ ...lectureForm, name: e.target.value })
                              }
                              className="flex-1"
                              data-testid="input-lecture-name"
                            />
                            <Button
                              onClick={() =>
                                addLectureMutation.mutate({
                                  subject: subject.key,
                                  ...lectureForm,
                                })
                              }
                              disabled={!lectureForm.chapter || !lectureForm.number || !lectureForm.name}
                              data-testid="button-save-lecture"
                            >
                              Save
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setAddingLecture(null);
                                setLectureForm({ chapter: "", number: "", name: "" });
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="space-y-4">
                        {lectures.length === 0 ? (
                          <p className="text-sm text-muted-foreground py-4 text-center">
                            No lectures added yet
                          </p>
                        ) : (
                          Object.entries(groupByChapter(lectures)).map(([chapter, chapterLectures]) => (
                            <div key={chapter} className="space-y-2">
                              <h4 className="text-sm font-semibold text-muted-foreground px-1">{chapter}</h4>
                              {chapterLectures.map((lecture) => (
                                <div
                                  key={lecture.id}
                                  className="flex items-center gap-3 p-3 bg-card border border-card-border rounded-md hover-elevate"
                                >
                                  <Checkbox
                                    checked={lecture.userCompleted}
                                    onCheckedChange={() => toggleLectureMutation.mutate(lecture.id)}
                                    data-testid={`checkbox-lecture-${lecture.id}`}
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="font-mono text-xs">
                                        #{lecture.number}
                                      </Badge>
                                      <span className="font-medium">{lecture.name}</span>
                                    </div>
                                  </div>
                                  <div>{renderStatus(lecture.userCompleted, lecture.rivalCompleted)}</div>
                                </div>
                              ))}
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="h-px bg-border" />

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <h3 className="font-semibold">Daily Practice Problems</h3>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setAddingDpp(subject.key)}
                          data-testid={`button-add-dpp-${subject.key.toLowerCase()}`}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add DPP
                        </Button>
                      </div>

                      {addingDpp === subject.key && (
                        <div className="flex flex-col gap-3 mb-4 p-4 bg-muted/50 rounded-md">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Chapter Name (e.g., Chapter 1: Basics)"
                              value={dppForm.chapter}
                              onChange={(e) => setDppForm({ ...dppForm, chapter: e.target.value })}
                              className="flex-1"
                              data-testid="input-dpp-chapter"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Input
                              placeholder="DPP #"
                              value={dppForm.number}
                              onChange={(e) => setDppForm({ ...dppForm, number: e.target.value })}
                              className="w-32"
                              data-testid="input-dpp-number"
                            />
                            <Input
                              placeholder="DPP Name"
                              value={dppForm.name}
                              onChange={(e) => setDppForm({ ...dppForm, name: e.target.value })}
                              className="flex-1"
                              data-testid="input-dpp-name"
                            />
                            <Button
                              onClick={() =>
                                addDppMutation.mutate({
                                  subject: subject.key,
                                  ...dppForm,
                                })
                              }
                              disabled={!dppForm.chapter || !dppForm.number || !dppForm.name}
                              data-testid="button-save-dpp"
                            >
                              Save
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setAddingDpp(null);
                                setDppForm({ chapter: "", number: "", name: "" });
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="space-y-4">
                        {dpps.length === 0 ? (
                          <p className="text-sm text-muted-foreground py-4 text-center">
                            No DPPs added yet
                          </p>
                        ) : (
                          Object.entries(groupByChapter(dpps)).map(([chapter, chapterDpps]) => (
                            <div key={chapter} className="space-y-2">
                              <h4 className="text-sm font-semibold text-muted-foreground px-1">{chapter}</h4>
                              {chapterDpps.map((dpp) => (
                                <div
                                  key={dpp.id}
                                  className="flex items-center gap-3 p-3 bg-card border border-card-border rounded-md hover-elevate"
                                >
                                  <Checkbox
                                    checked={dpp.userCompleted}
                                    onCheckedChange={() => toggleDppMutation.mutate(dpp.id)}
                                    data-testid={`checkbox-dpp-${dpp.id}`}
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="font-mono text-xs">
                                        #{dpp.number}
                                      </Badge>
                                      <span className="font-medium">{dpp.name}</span>
                                    </div>
                                  </div>
                                  <div>{renderStatus(dpp.userCompleted, dpp.rivalCompleted)}</div>
                                </div>
                              ))}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </Card>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
