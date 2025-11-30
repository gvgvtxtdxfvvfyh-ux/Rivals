import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2, Plus, BookOpen, FileText } from "lucide-react";
import { CHAPTERS_DATA, type Subject } from "@shared/schema";

interface ContentItem {
  id: string;
  lectureNumber?: string;
  dppNumber?: string;
  lectureName?: string;
  dppName?: string;
  subject: Subject;
  chapter: string;
}

interface ChapterContent {
  subject: Subject;
  chapter: string;
  lectures: ContentItem[];
  dpps: ContentItem[];
}

const subjects = Object.keys(CHAPTERS_DATA) as Subject[];

export default function ManageContent() {
  const { toast } = useToast();
  const [selectedSubject, setSelectedSubject] = useState<Subject>("Physics");
  const [selectedChapter, setSelectedChapter] = useState<string>("");
  const [newLectureNum, setNewLectureNum] = useState("");
  const [newLectureTitle, setNewLectureTitle] = useState("");
  const [newDppNum, setNewDppNum] = useState("");
  const [newDppTitle, setNewDppTitle] = useState("");

  const chapters = selectedSubject ? CHAPTERS_DATA[selectedSubject] : [];

  const { data: allContent } = useQuery<{ chapters: ChapterContent[] }>({
    queryKey: ["/api/pw/all"],
    staleTime: Infinity,
  });

  const createLectureMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/pw/lectures", {
        subject: selectedSubject,
        chapter: selectedChapter,
        lectureNumber: newLectureNum,
        lectureName: newLectureTitle,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pw/all"] });
      setNewLectureNum("");
      setNewLectureTitle("");
      toast({ title: "Lecture added successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add lecture",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createDppMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/pw/dpps", {
        subject: selectedSubject,
        chapter: selectedChapter,
        dppNumber: newDppNum,
        dppName: newDppTitle,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pw/all"] });
      setNewDppNum("");
      setNewDppTitle("");
      toast({ title: "DPP added successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add DPP",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteLectureMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/pw/lectures/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pw/all"] });
      toast({ title: "Lecture deleted successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete lecture",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteDppMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/pw/dpps/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pw/all"] });
      toast({ title: "DPP deleted successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete DPP",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const currentChapterData = allContent?.chapters?.find(
    (c: ChapterContent) => c.subject === selectedSubject && c.chapter === selectedChapter
  ) || { lectures: [], dpps: [] };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Manage Content</h1>
        <p className="text-muted-foreground mt-2">
          Add or delete lectures and DPPs for specific chapters
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Subject & Chapter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select value={selectedSubject} onValueChange={(v) => setSelectedSubject(v as Subject)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Chapter</Label>
              <Select value={selectedChapter} onValueChange={setSelectedChapter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select chapter" />
                </SelectTrigger>
                <SelectContent>
                  {chapters.map((chapter) => (
                    <SelectItem key={chapter} value={chapter}>
                      {chapter}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedChapter && (
        <>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Lectures
              </CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Lecture
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Lecture</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Lecture Number</Label>
                      <Input
                        placeholder="e.g., L1, L2"
                        value={newLectureNum}
                        onChange={(e) => setNewLectureNum(e.target.value)}
                        data-testid="input-lecture-number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Lecture Title</Label>
                      <Input
                        placeholder="e.g., Introduction to Physics"
                        value={newLectureTitle}
                        onChange={(e) => setNewLectureTitle(e.target.value)}
                        data-testid="input-lecture-title"
                      />
                    </div>
                    <Button
                      onClick={() => createLectureMutation.mutate()}
                      disabled={createLectureMutation.isPending || !newLectureNum || !newLectureTitle}
                      className="w-full"
                      data-testid="button-add-lecture"
                    >
                      Add Lecture
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {currentChapterData.lectures.length === 0 ? (
                <p className="text-muted-foreground">No lectures in this chapter</p>
              ) : (
                <div className="space-y-2">
                  {currentChapterData.lectures.map((lecture: ContentItem) => (
                    <div
                      key={lecture.id}
                      className="flex items-center justify-between p-3 border rounded-md"
                      data-testid={`row-lecture-${lecture.id}`}
                    >
                      <div>
                        <p className="font-medium">
                          {lecture.lectureNumber}: {lecture.lectureName}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteLectureMutation.mutate(lecture.id)}
                        disabled={deleteLectureMutation.isPending}
                        data-testid={`button-delete-lecture-${lecture.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                DPPs
              </CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add DPP
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New DPP</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>DPP Number</Label>
                      <Input
                        placeholder="e.g., DPP1, DPP2"
                        value={newDppNum}
                        onChange={(e) => setNewDppNum(e.target.value)}
                        data-testid="input-dpp-number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>DPP Title</Label>
                      <Input
                        placeholder="e.g., Daily Practice Paper 1"
                        value={newDppTitle}
                        onChange={(e) => setNewDppTitle(e.target.value)}
                        data-testid="input-dpp-title"
                      />
                    </div>
                    <Button
                      onClick={() => createDppMutation.mutate()}
                      disabled={createDppMutation.isPending || !newDppNum || !newDppTitle}
                      className="w-full"
                      data-testid="button-add-dpp"
                    >
                      Add DPP
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {currentChapterData.dpps.length === 0 ? (
                <p className="text-muted-foreground">No DPPs in this chapter</p>
              ) : (
                <div className="space-y-2">
                  {currentChapterData.dpps.map((dpp: ContentItem) => (
                    <div
                      key={dpp.id}
                      className="flex items-center justify-between p-3 border rounded-md"
                      data-testid={`row-dpp-${dpp.id}`}
                    >
                      <div>
                        <p className="font-medium">
                          {dpp.dppNumber}: {dpp.dppName}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteDppMutation.mutate(dpp.id)}
                        disabled={deleteDppMutation.isPending}
                        data-testid={`button-delete-dpp-${dpp.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
