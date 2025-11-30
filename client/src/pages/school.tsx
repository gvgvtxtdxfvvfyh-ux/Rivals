import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  GraduationCap,
  Plus,
  BookOpen,
  Calendar,
  MessageCircle,
  Send,
  FileText,
  Upload,
  Check,
  X,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface SchoolData {
  lessons: {
    id: string;
    subject: string;
    lessonNumber: string;
    lessonName: string;
    monthRange: string;
    mindmapUrl: string | null;
    completedByUser: boolean;
    completedByRival: boolean;
    createdBy: string;
  }[];
  messages: {
    id: string;
    userId: string;
    userName: string;
    userIcon: string;
    userProfileImage: string | null;
    message: string;
    createdAt: string;
    isCurrentUser: boolean;
  }[];
  rival: {
    id: string;
    name: string;
    userIcon: string;
    profileImageUrl: string | null;
  } | null;
}

const lessonSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  lessonNumber: z.string().min(1, "Lesson number is required"),
  lessonName: z.string().min(1, "Lesson name is required"),
  monthRange: z.string().min(1, "Month range is required"),
});

type LessonFormData = z.infer<typeof lessonSchema>;

const MONTH_RANGES = [
  "January - February",
  "March - April",
  "May - June",
  "July - August",
  "September - October",
  "November - December",
];

const SUBJECTS = [
  "Physics",
  "Chemistry",
  "Mathematics",
  "Biology",
  "English",
  "Computer Science",
  "Other",
];

function AddLessonDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const form = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      subject: "",
      lessonNumber: "",
      lessonName: "",
      monthRange: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: LessonFormData) => {
      return apiRequest("POST", "/api/school/lessons", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/school/all"] });
      toast({
        title: "Lesson added",
        description: "Your school lesson has been created.",
      });
      setOpen(false);
      form.reset();
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
        <Button className="gap-2" data-testid="button-add-lesson">
          <Plus className="w-4 h-4" />
          Add Lesson
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add School Lesson</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
            className="space-y-4 pt-4"
          >
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-subject">
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SUBJECTS.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lessonNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lesson Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Lesson 1"
                      data-testid="input-lesson-number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lessonName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lesson Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter lesson name"
                      data-testid="input-lesson-name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="monthRange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Month Range</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-month-range">
                        <SelectValue placeholder="Select month range" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MONTH_RANGES.map((range) => (
                        <SelectItem key={range} value={range}>
                          {range}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={mutation.isPending}
              data-testid="button-submit-lesson"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Lesson"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function ChatSection({
  messages,
  rival,
}: {
  messages: SchoolData["messages"];
  rival: SchoolData["rival"];
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = useMutation({
    mutationFn: async (messageText: string) => {
      return apiRequest("POST", "/api/school/chat", { message: messageText });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/school/all"] });
      setMessage("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSend = () => {
    if (message.trim()) {
      sendMessage.mutate(message.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="flex flex-col h-[500px]">
      <CardHeader className="border-b py-3 px-4">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-primary" />
          Chat with {rival?.name || "Rival"}
        </CardTitle>
      </CardHeader>
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <MessageCircle className="w-10 h-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${
                  msg.isCurrentUser ? "flex-row-reverse" : ""
                }`}
              >
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage
                    src={msg.userProfileImage || undefined}
                    alt={msg.userName}
                  />
                  <AvatarFallback className="text-xs">
                    {msg.userIcon || msg.userName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`max-w-[70%] ${
                    msg.isCurrentUser ? "text-right" : ""
                  }`}
                >
                  <div
                    className={`px-3 py-2 rounded-xl ${
                      msg.isCurrentUser
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-muted rounded-tl-sm"
                    }`}
                  >
                    <p className="text-sm break-words">{msg.message}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
      <div className="border-t p-3">
        <div className="flex gap-2">
          <Textarea
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="resize-none min-h-[44px] max-h-24"
            rows={1}
            data-testid="input-chat-message"
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim() || sendMessage.isPending}
            size="icon"
            data-testid="button-send-message"
          >
            {sendMessage.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}

function LessonCard({
  lesson,
}: {
  lesson: SchoolData["lessons"][0];
}) {
  const { toast } = useToast();

  const toggleCompletion = useMutation({
    mutationFn: async () => {
      return apiRequest("PATCH", `/api/school/lessons/${lesson.id}/toggle`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/school/all"] });
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
    <Card
      className="hover:shadow-sm transition-shadow"
      data-testid={`lesson-${lesson.id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={lesson.completedByUser}
            onCheckedChange={() => toggleCompletion.mutate()}
            disabled={toggleCompletion.isPending}
            className="mt-1"
            data-testid={`checkbox-lesson-${lesson.id}`}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge variant="secondary" className="text-xs">
                {lesson.subject}
              </Badge>
              <Badge variant="outline" className="text-xs gap-1">
                <Calendar className="w-3 h-3" />
                {lesson.monthRange}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              {lesson.lessonNumber}
            </p>
            <p className="font-medium truncate">{lesson.lessonName}</p>
            {lesson.mindmapUrl && (
              <a
                href={lesson.mindmapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
              >
                <FileText className="w-3 h-3" />
                View Mindmap
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <div className="flex items-center gap-1">
            {lesson.completedByUser && lesson.completedByRival ? (
              <Badge className="bg-primary/10 text-primary border-primary/20">
                <Check className="w-3 h-3 mr-1" />
                Both
              </Badge>
            ) : lesson.completedByUser ? (
              <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                <Check className="w-3 h-3 mr-1" />
                You
              </Badge>
            ) : lesson.completedByRival ? (
              <Badge className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20">
                Rival
              </Badge>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function School() {
  const { data, isLoading } = useQuery<SchoolData>({
    queryKey: ["/api/school/all"],
    refetchInterval: 2000,
  });

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-10 w-32" />
            </div>
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="h-[500px]">
            <Skeleton className="h-full w-full" />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <GraduationCap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">School Lessons</h2>
                <p className="text-sm text-muted-foreground">
                  Track your school syllabus progress
                </p>
              </div>
            </div>
            <AddLessonDialog />
          </div>

          {data?.lessons.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Lessons Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Add your first school lesson to start tracking.
                </p>
                <AddLessonDialog />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {data?.lessons.map((lesson) => (
                <LessonCard key={lesson.id} lesson={lesson} />
              ))}
            </div>
          )}
        </div>

        <ChatSection messages={data?.messages || []} rival={data?.rival || null} />
      </div>
    </div>
  );
}
