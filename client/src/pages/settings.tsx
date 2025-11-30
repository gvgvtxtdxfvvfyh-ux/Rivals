import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Settings as SettingsIcon,
  User,
  Moon,
  Sun,
  Upload,
  Loader2,
  Mail,
  Hash,
  Users,
  Camera,
} from "lucide-react";

export default function Settings() {
  const { user, refetchUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file (JPG, PNG)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/users/upload-profile-image", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Upload failed");
      }

      await refetchUser();
      toast({
        title: "Profile updated",
        description: "Your profile image has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-primary/10">
          <SettingsIcon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Settings</h2>
          <p className="text-sm text-muted-foreground">
            Manage your profile and preferences
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile
          </CardTitle>
          <CardDescription>
            Your personal information and account details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <Avatar className="w-28 h-28 border-4 border-primary/20">
                <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.name} />
                <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                  {user?.userIcon || user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="profile-image"
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                {isUploading ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Camera className="w-6 h-6 text-white" />
                )}
              </label>
              <input
                id="profile-image"
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleImageUpload}
                disabled={isUploading}
                className="hidden"
                data-testid="input-profile-image"
              />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-xl font-semibold">{user?.name}</h3>
              <p className="text-muted-foreground">{user?.email}</p>
              <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                <Badge variant="secondary" className="gap-1.5">
                  <Hash className="w-3.5 h-3.5" />
                  {user?.pwBatchId}
                </Badge>
                <Badge variant="secondary" className="gap-1.5 font-mono">
                  <Users className="w-3.5 h-3.5" />
                  {user?.rivalCode}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Full Name</Label>
              <Input value={user?.name || ""} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input value={user?.email || ""} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground flex items-center gap-2">
                <Hash className="w-4 h-4" />
                PW Batch ID
              </Label>
              <Input value={user?.pwBatchId || ""} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                Rival Code
              </Label>
              <div className="flex gap-2">
                <Input
                  value={user?.rivalCode || ""}
                  disabled
                  className="bg-muted font-mono"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(user?.rivalCode || "");
                    toast({
                      title: "Copied!",
                      description: "Rival code copied to clipboard",
                    });
                  }}
                  data-testid="button-copy-rival-code"
                >
                  Copy
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            {theme === "dark" ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
            Appearance
          </CardTitle>
          <CardDescription>
            Customize how Rivals looks on your device
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Dark Mode</Label>
              <p className="text-sm text-muted-foreground">
                Toggle between light and dark themes
              </p>
            </div>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={toggleTheme}
              data-testid="switch-dark-mode"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Profile Image
          </CardTitle>
          <CardDescription>
            Update your profile picture (max 5MB, JPG or PNG)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
            <input
              id="profile-image-drop"
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleImageUpload}
              disabled={isUploading}
              className="hidden"
              data-testid="input-profile-image-drop"
            />
            <label
              htmlFor="profile-image-drop"
              className="cursor-pointer flex flex-col items-center"
            >
              {isUploading ? (
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
              ) : (
                <Upload className="w-10 h-10 text-muted-foreground mb-3" />
              )}
              <p className="font-medium">
                {isUploading ? "Uploading..." : "Click to upload"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                or drag and drop your image here
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                JPG, PNG up to 5MB
              </p>
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
