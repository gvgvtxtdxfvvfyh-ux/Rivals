import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { THEME_PALETTES, type ThemeKey, applyTheme } from "@/lib/themes";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
  theme: string;
}

export default function Settings() {
  const { toast } = useToast();
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey>("obsidian");

  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
  });

  useEffect(() => {
    if (user?.theme) {
      setSelectedTheme((user.theme as ThemeKey) || "obsidian");
      applyTheme((user.theme as ThemeKey) || "obsidian");
    }
  }, [user]);

  const updateThemeMutation = useMutation({
    mutationFn: async (theme: ThemeKey) => {
      return await apiRequest("POST", "/api/user/theme", { theme });
    },
    onSuccess: () => {
      applyTheme(selectedTheme);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Theme Updated",
        description: "Your theme has been changed successfully!",
      });
    },
  });

  const handleThemeChange = (theme: ThemeKey) => {
    setSelectedTheme(theme);
    updateThemeMutation.mutate(theme);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading themes...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2" data-testid="text-settings-title">
          Themes
        </h1>
        <p className="text-muted-foreground">Choose your favorite color palette</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Theme Customization</CardTitle>
          <CardDescription>
            Choose your favorite color theme. The app will remember your preference!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(THEME_PALETTES).map(([key, theme]) => (
              <button
                key={key}
                onClick={() => handleThemeChange(key as ThemeKey)}
                className={`relative p-4 rounded-lg border-2 transition-all ${
                  selectedTheme === key
                    ? "border-primary bg-card shadow-lg"
                    : "border-border hover-elevate"
                }`}
                data-testid={`button-theme-${key}`}
              >
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div
                      className="w-6 h-6 rounded-md border border-border"
                      style={{
                        backgroundColor: `hsl(${theme.cssVariables.accent1})`,
                      }}
                    />
                    <div
                      className="w-6 h-6 rounded-md border border-border"
                      style={{
                        backgroundColor: `hsl(${theme.cssVariables.accent2})`,
                      }}
                    />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-sm" data-testid={`text-theme-name-${key}`}>
                      {theme.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">{theme.description}</p>
                  </div>
                </div>

                {selectedTheme === key && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Username</label>
            <p className="text-lg font-semibold" data-testid="text-account-username">
              {user && "name" in user ? user.name : "Loading..."}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Current Theme</label>
            <p className="text-lg font-semibold" data-testid="text-account-theme">
              {THEME_PALETTES[selectedTheme]?.name}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
