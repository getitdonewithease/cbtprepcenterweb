import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Sun, Moon, Eye, EyeOff } from "lucide-react";
import { ApplicationSettings as AppSettingsType } from "../types/settingsTypes";

interface ApplicationSettingsProps {
  settings: AppSettingsType;
  setSettings: React.Dispatch<React.SetStateAction<AppSettingsType>>;
}

const ApplicationSettings: React.FC<ApplicationSettingsProps> = ({ settings, setSettings }) => {
  const handleThemeToggle = () => {
    const newTheme = settings.theme === 'light' ? 'dark' : 'light';
    setSettings({ ...settings, theme: newTheme });
  };

  const handleProfileVisibilityToggle = () => {
    const newVisibility = !settings.profileVisibility;
    setSettings({
      ...settings,
      profileVisibility: newVisibility,
      joinLeaderboard: newVisibility ? settings.joinLeaderboard : false,
    });
  };

  const handleLeaderboardToggle = () => {
    if (!settings.profileVisibility && !settings.joinLeaderboard) return;
    setSettings({ ...settings, joinLeaderboard: !settings.joinLeaderboard });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Customize how the application looks and feels.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="theme">Theme</Label>
              <p className="text-sm text-muted-foreground">Switch between light and dark mode.</p>
            </div>
            <div className="flex items-center">
              <Sun className="h-5 w-5 mr-2" />
              <Switch id="theme" checked={settings.theme === "dark"} onCheckedChange={handleThemeToggle} />
              <Moon className="h-5 w-5 ml-2" />
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="profile-visibility">Profile Visibility</Label>
              <p className="text-sm text-muted-foreground">Allow others to see your profile and test results.</p>
            </div>
            <div className="flex items-center">
              {settings.profileVisibility ? <Eye className="h-5 w-5 mr-2" /> : <EyeOff className="h-5 w-5 mr-2" />}
              <Switch id="profile-visibility" checked={settings.profileVisibility} onCheckedChange={handleProfileVisibilityToggle} />
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="join-leaderboard">Join Leaderboard</Label>
              <p className="text-sm text-muted-foreground">Participate in the global leaderboard rankings.</p>
            </div>
            <Switch id="join-leaderboard" checked={settings.joinLeaderboard} onCheckedChange={handleLeaderboardToggle} disabled={!settings.profileVisibility} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive updates, tips, and test reminders via email.</p>
            </div>
            <Switch id="email-notifications" checked={settings.emailNotifications} onCheckedChange={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicationSettings; 