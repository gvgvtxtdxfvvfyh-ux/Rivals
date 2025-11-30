import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  Send,
  Loader2,
  Users,
} from "lucide-react";

interface ChatData {
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

export default function Chat() {
  const { user } = useAuth();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState("");

  const { data, isLoading } = useQuery<ChatData>({
    queryKey: ["/api/chat/messages"],
    refetchInterval: 1000,
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [data?.messages]);

  const sendMessage = useMutation({
    mutationFn: async (messageText: string) => {
      return apiRequest("POST", "/api/chat/messages", { message: messageText });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
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

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto h-[calc(100vh-180px)]">
        <Card className="h-full flex flex-col">
          <CardHeader className="border-b">
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="flex-1 p-4">
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`flex gap-2 ${i % 2 === 0 ? "flex-row-reverse" : ""}`}
                >
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <Skeleton className="h-16 w-48" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data?.rival) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardContent className="py-16 text-center">
            <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Rival Yet</h3>
            <p className="text-muted-foreground mb-4">
              Share your rival code with a friend to start chatting!
            </p>
            <Badge variant="secondary" className="text-lg font-mono px-4 py-2">
              {user?.rivalCode}
            </Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-180px)]">
      <Card className="h-full flex flex-col">
        <CardHeader className="border-b py-4 px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 border-2 border-orange-500/50">
                <AvatarImage
                  src={data.rival.profileImageUrl || undefined}
                  alt={data.rival.name}
                />
                <AvatarFallback className="bg-orange-500/10 text-orange-600">
                  {data.rival.userIcon || data.rival.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{data.rival.name}</CardTitle>
                <p className="text-xs text-muted-foreground">Your Rival</p>
              </div>
            </div>
            <Badge variant="secondary" className="gap-1.5">
              <MessageCircle className="w-3.5 h-3.5" />
              {data.messages.length} messages
            </Badge>
          </div>
        </CardHeader>

        <ScrollArea className="flex-1 p-6" ref={scrollRef}>
          {data.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <MessageCircle className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Start the Conversation</h3>
              <p className="text-muted-foreground max-w-sm">
                Send a message to your rival and start competing together!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.messages.map((msg, index) => {
                const showAvatar =
                  index === 0 ||
                  data.messages[index - 1].userId !== msg.userId;
                const showTimestamp =
                  index === data.messages.length - 1 ||
                  data.messages[index + 1].userId !== msg.userId;

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${
                      msg.isCurrentUser ? "flex-row-reverse" : ""
                    }`}
                    data-testid={`message-${msg.id}`}
                  >
                    {showAvatar ? (
                      <Avatar className="w-9 h-9 flex-shrink-0">
                        <AvatarImage
                          src={msg.userProfileImage || undefined}
                          alt={msg.userName}
                        />
                        <AvatarFallback
                          className={
                            msg.isCurrentUser
                              ? "bg-primary/10 text-primary"
                              : "bg-orange-500/10 text-orange-600"
                          }
                        >
                          {msg.userIcon || msg.userName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-9 flex-shrink-0" />
                    )}
                    <div
                      className={`max-w-[75%] ${
                        msg.isCurrentUser ? "text-right" : ""
                      }`}
                    >
                      {showAvatar && (
                        <p
                          className={`text-xs font-medium mb-1 ${
                            msg.isCurrentUser
                              ? "text-primary"
                              : "text-orange-600 dark:text-orange-400"
                          }`}
                        >
                          {msg.isCurrentUser ? "You" : msg.userName}
                        </p>
                      )}
                      <div
                        className={`px-4 py-2.5 rounded-2xl ${
                          msg.isCurrentUser
                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                            : "bg-muted rounded-tl-sm"
                        }`}
                      >
                        <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                          {msg.message}
                        </p>
                      </div>
                      {showTimestamp && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <div className="border-t p-4">
          <div className="flex gap-3">
            <Textarea
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="resize-none min-h-[48px] max-h-32"
              rows={1}
              data-testid="input-chat-message"
            />
            <Button
              onClick={handleSend}
              disabled={!message.trim() || sendMessage.isPending}
              size="lg"
              className="px-6"
              data-testid="button-send-message"
            >
              {sendMessage.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
