import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Sun, Moon } from "lucide-react";
import { ApplicationSettings as AppSettingsType } from "../types/settingsTypes";

const orange = "hsl(var(--brand-orange))";

interface ApplicationSettingsProps {
  settings: AppSettingsType;
  setSettings: React.Dispatch<React.SetStateAction<AppSettingsType>>;
}

const ApplicationSettings: React.FC<ApplicationSettingsProps> = ({ settings, setSettings }) => {
  const handleThemeToggle = () => {
    const newTheme = settings.theme === "light" ? "dark" : "light";
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
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6">
        Appearance
      </p>

      {/* Theme row — segmented control */}
      <div className="flex items-center justify-between py-4 border-b border-border">
        <div>
          <p className="text-sm font-medium">Theme</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Switch between light and dark mode.
          </p>
        </div>
        <div className="flex rounded-lg border border-input overflow-hidden shrink-0">
          <button
            type="button"
            onClick={() => settings.theme !== "light" && handleThemeToggle()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors"
            style={
              settings.theme === "light"
                ? { backgroundColor: orange, color: "white", fontWeight: 600 }
                : { color: "hsl(var(--muted-foreground))" }
            }
          >
            <Sun className="h-3.5 w-3.5" />
            Light
          </button>
          <button
            type="button"
            onClick={() => settings.theme !== "dark" && handleThemeToggle()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors border-l border-input"
            style={
              settings.theme === "dark"
                ? { backgroundColor: orange, color: "white", fontWeight: 600 }
                : { color: "hsl(var(--muted-foreground))" }
            }
          >
            <Moon className="h-3.5 w-3.5" />
            Dark
          </button>
        </div>
      </div>

      {/* Profile Visibility row */}
      <div className="flex items-center justify-between py-4 border-b border-border">
        <div>
          <Label htmlFor="profile-visibility" className="text-sm font-medium cursor-pointer">
            Profile Visibility
          </Label>
          <p className="text-sm text-muted-foreground mt-0.5">
            Allow others to see your profile and test results.
          </p>
        </div>
        <Switch
          id="profile-visibility"
          checked={settings.profileVisibility}
          onCheckedChange={handleProfileVisibilityToggle}
          className="data-[state=checked]:bg-[hsl(var(--brand-orange))]"
        />
      </div>

      {/* Leaderboard row */}
      <div className="flex items-center justify-between py-4 border-b border-border">
        <div>
          <Label
            htmlFor="join-leaderboard"
            className={[
              "text-sm font-medium cursor-pointer",
              !settings.profileVisibility ? "opacity-50" : "",
            ].join(" ")}
          >
            Join Leaderboard
          </Label>
          <p
            className={[
              "text-sm text-muted-foreground mt-0.5",
              !settings.profileVisibility ? "opacity-50" : "",
            ].join(" ")}
          >
            Participate in the global leaderboard rankings.
          </p>
        </div>
        <Switch
          id="join-leaderboard"
          checked={settings.joinLeaderboard}
          onCheckedChange={handleLeaderboardToggle}
          disabled={!settings.profileVisibility}
          className="data-[state=checked]:bg-[hsl(var(--brand-orange))]"
        />
      </div>

      {/* Email Notifications row */}
      <div className="flex items-center justify-between py-4 border-b border-border">
        <div>
          <Label htmlFor="email-notifications" className="text-sm font-medium cursor-pointer">
            Email Notifications
          </Label>
          <p className="text-sm text-muted-foreground mt-0.5">
            Receive updates, tips, and test reminders via email.
          </p>
        </div>
        <Switch
          id="email-notifications"
          checked={settings.emailNotifications}
          onCheckedChange={() =>
            setSettings({ ...settings, emailNotifications: !settings.emailNotifications })
          }
          className="data-[state=checked]:bg-[hsl(var(--brand-orange))]"
        />
      </div>
    </div>
  );
};

export default ApplicationSettings;
