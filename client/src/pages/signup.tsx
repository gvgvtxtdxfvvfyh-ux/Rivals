import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Lock, Users } from "lucide-react";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  pwBatchId: z.string().min(1, "PW Batch ID is required"),
  rivalCode: z.string().min(4, "Rival Code must be at least 4 characters"),
});

export default function SignUp() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [userCount, setUserCount] = useState<number>(0);

  const { data: countData } = useQuery({
    queryKey: ["/api/auth/user-count"],
  });

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      pwBatchId: "",
      rivalCode: "",
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: z.infer<typeof signupSchema>) => {
      return await apiRequest("POST", "/api/auth/signup", data);
    },
    onSuccess: () => {
      toast({
        title: "Account created",
        description: "Welcome to the battlefield!",
      });
      setLocation("/signin");
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Signup failed",
        description: error.message || "Could not create account",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof signupSchema>) => {
    signupMutation.mutate(values);
  };

  const currentCount = countData?.count || 0;
  const isFull = currentCount >= 2;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="w-8 h-8 text-primary" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <CardTitle className="text-3xl font-bold tracking-tight">Join the Rivalry</CardTitle>
            <CardDescription className="text-base">
              Create your account and enter the battlefield
            </CardDescription>
          </div>
          <div className="flex items-center justify-center gap-2 p-3 bg-muted rounded-md">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {isFull ? (
                <span className="text-destructive">Full - No new signups</span>
              ) : (
                <span className="text-foreground">{currentCount}/2 slots filled</span>
              )}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {isFull ? (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                The battlefield is full. Only 2 rivals are allowed.
              </p>
              <Button
                onClick={() => setLocation("/signin")}
                variant="outline"
                className="w-full"
                data-testid="button-go-signin"
              >
                Go to Sign In
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your name"
                          data-testid="input-name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          data-testid="input-email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Create a password"
                          data-testid="input-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pwBatchId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PW Batch ID</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your Physics Wallah batch ID"
                          data-testid="input-batch-id"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rivalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rival Code</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Enter shared rival code"
                            className="text-center font-mono text-lg tracking-wider"
                            data-testid="input-rival-code"
                            {...field}
                          />
                          <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        </div>
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground mt-1">
                        Both rivals must use the same code to link accounts
                      </p>
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={signupMutation.isPending}
                  data-testid="button-signup"
                >
                  {signupMutation.isPending ? "Creating Account..." : "Create Account"}
                </Button>
                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setLocation("/signin")}
                    className="text-sm"
                    data-testid="link-signin"
                  >
                    Already have an account? Sign in
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
