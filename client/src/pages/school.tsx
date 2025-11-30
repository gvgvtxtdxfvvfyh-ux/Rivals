import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Send, BookOpen, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";

interface SchoolLesson {
  id: string;
  subject: string;
  lessonNumber: string;
  lessonName: string;
  monthRange: string;
  userCompleted: boolean;
  rivalCompleted: boolean;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userIcon: string;
  message: string;
  createdAt: string;
  isCurrentUser: boolean;
}

interface SchoolData {
  user: { id: string; name: string; userIcon: string };
  rival: { id: string; name: string; userIcon: string };
  lessons: SchoolLesson[];
  messages: ChatMessage[];
}

export default function SchoolPage() {
  const { toast } = useToast();
  const [addingLesson, setAddingLesson] = useState(false);
  const [lessonForm, setLessonForm] = useState({
    subject: "",
    lessonNumber: "",
    lessonName: "",
    monthRange: "",
  });
  const [customMonthRange, setCustomMonthRange] = useState(false);
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: schoolData, isLoading } = useQuery<SchoolData>({
    queryKey: ["/api/school/all"],
    refetchInterval: 3000,
  });

  const addLessonMutation = useMutation({
    mutationFn: async (data: typeof lessonForm) => {
      return await apiRequest("POST", "/api/school/lessons", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/school/all"] });
      setAddingLesson(false);
      setLessonForm({ subject: "", lessonNumber: "", lessonName: "", monthRange: "" });
      toast({ title: "Lesson added successfully" });
    },
  });

  const toggleLessonMutation = useMutation({
    mutationFn: async (lessonId: string) => {
      return await apiRequest("PATCH", `/api/school/lessons/${lessonId}/toggle`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/school/all"] });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      return await apiRequest("POST", "/api/school/messages", { message });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/school/all"] });
      setMessageText("");
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [schoolData?.messages]);

  if (isLoading || !schoolData) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Skeleton className="h-96" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const groupedLessons = schoolData.lessons.reduce((acc, lesson) => {
    if (!acc[lesson.monthRange]) {
      acc[lesson.monthRange] = [];
    }
    acc[lesson.monthRange].push(lesson);
    return acc;
  }, {} as Record<string, SchoolLesson[]>);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">School Syllabus</h1>
        <p className="text-muted-foreground">Track your school lessons and chat with your rival</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Syllabus Tracker
              </CardTitle>
              <Button
                size="sm"
                onClick={() => setAddingLesson(true)}
                data-testid="button-add-lesson"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Lesson
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {addingLesson && (
                <div className="p-4 bg-muted/50 rounded-md space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="Subject"
                      value={lessonForm.subject}
                      onChange={(e) =>
                        setLessonForm({ ...lessonForm, subject: e.target.value })
                      }
                      data-testid="input-lesson-subject"
                    />
                    <Input
                      placeholder="Lesson Number"
                      value={lessonForm.lessonNumber}
                      onChange={(e) =>
                        setLessonForm({ ...lessonForm, lessonNumber: e.target.value })
                      }
                      data-testid="input-lesson-number"
                    />
                  </div>
                  <Input
                    placeholder="Lesson Name"
                    value={lessonForm.lessonName}
                    onChange={(e) =>
                      setLessonForm({ ...lessonForm, lessonName: e.target.value })
                    }
                    data-testid="input-lesson-name"
                  />
                  <div className="space-y-2">
                    {!customMonthRange ? (
                      <>
                        <Select
                          value={lessonForm.monthRange}
                          onValueChange={(value) =>
                            setLessonForm({ ...lessonForm, monthRange: value })
                          }
                        >
                          <SelectTrigger data-testid="select-month-range">
                            <SelectValue placeholder="Select Month Range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Jan-Mar">January - March</SelectItem>
                            <SelectItem value="Apr-Jun">April - June</SelectItem>
                            <SelectItem value="Jul-Sep">July - September</SelectItem>
                            <SelectItem value="Oct-Dec">October - December</SelectItem>
                            <SelectItem value="Jan-Jun">January - June</SelectItem>
                            <SelectItem value="Jul-Dec">July - December</SelectItem>
                            <SelectItem value="Jan-Dec">Full Year</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCustomMonthRange(true);
                            setLessonForm({ ...lessonForm, monthRange: "" });
                          }}
                          className="w-full"
                          data-testid="button-custom-month-range"
                        >
                          + Custom Range
                        </Button>
                      </>
                    ) : (
                      <>
                        <Input
                          placeholder="e.g., Feb-May or January to June"
                          value={lessonForm.monthRange}
                          onChange={(e) =>
                            setLessonForm({ ...lessonForm, monthRange: e.target.value })
                          }
                          data-testid="input-custom-month-range"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCustomMonthRange(false);
                            setLessonForm({ ...lessonForm, monthRange: "" });
                          }}
                          className="w-full"
                          data-testid="button-back-to-presets"
                        >
                          Use Preset
                        </Button>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => addLessonMutation.mutate(lessonForm)}
                      disabled={
                        !lessonForm.subject ||
                        !lessonForm.lessonNumber ||
                        !lessonForm.lessonName ||
                        !lessonForm.monthRange
                      }
                      data-testid="button-save-lesson"
                    >
                      Save Lesson
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setAddingLesson(false);
                        setCustomMonthRange(false);
                        setLessonForm({
                          subject: "",
                          lessonNumber: "",
                          lessonName: "",
                          monthRange: "",
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {Object.keys(groupedLessons).length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No lessons added yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Click "Add Lesson" to start tracking your syllabus
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedLessons).map(([monthRange, lessons]) => (
                    <div key={monthRange}>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <div className="h-px flex-1 bg-border" />
                        <span className="px-3">{monthRange}</span>
                        <div className="h-px flex-1 bg-border" />
                      </h3>
                      <div className="space-y-2">
                        {lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className="flex items-center gap-4 p-3 bg-card border border-card-border rounded-md"
                          >
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={lesson.userCompleted}
                                onCheckedChange={() => toggleLessonMutation.mutate(lesson.id)}
                                data-testid={`checkbox-lesson-${lesson.id}-user`}
                              />
                              <span className="text-lg">{schoolData.user.userIcon}</span>
                            </div>
                            <div className="h-8 w-px bg-border" />
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={lesson.rivalCompleted}
                                disabled
                                data-testid={`checkbox-lesson-${lesson.id}-rival`}
                              />
                              <span className="text-lg">{schoolData.rival.userIcon}</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-muted-foreground">
                                  {lesson.subject}
                                </span>
                                <span className="text-sm text-muted-foreground">•</span>
                                <span className="text-sm font-mono">#{lesson.lessonNumber}</span>
                              </div>
                              <p className="font-medium">{lesson.lessonName}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="lg:sticky lg:top-4 lg:h-[calc(100vh-8rem)]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Chat
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="p-0 flex flex-col h-[calc(100%-5rem)]">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {schoolData.messages.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">No messages yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Start the conversation with your rival
                    </p>
                  </div>
                ) : (
                  schoolData.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${
                        msg.isCurrentUser ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-sm">{msg.userIcon}</span>
                      </div>
                      <div
                        className={`flex-1 max-w-[70%] ${
                          msg.isCurrentUser ? "items-end" : "items-start"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium">{msg.userName}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(msg.createdAt), "HH:mm")}
                          </span>
                        </div>
                        <div
                          className={`p-3 rounded-lg ${
                            msg.isCurrentUser
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm break-words">{msg.message}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            <div className="p-4 border-t border-border">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (messageText.trim()) {
                    sendMessageMutation.mutate(messageText);
                  }
                }}
                className="flex gap-2"
              >
                <Input
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  data-testid="input-chat-message"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!messageText.trim() || sendMessageMutation.isPending}
                  data-testid="button-send-message"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
