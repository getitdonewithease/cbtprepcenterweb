import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SectionAlertBanner } from "@/components/ui/section-alert-banner";
import { UserProfile } from "../types/settingsTypes";
import { subjects } from "../data/constants";
import AvatarDialog from "./AvatarDialog";

const orange = "hsl(var(--brand-orange))";

interface ProfileSettingsProps {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  handleProfileUpdate: () => void;
  profileFeedback: { type: "success" | "error"; message: string } | null;
  clearProfileFeedback: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  user,
  setUser,
  handleProfileUpdate,
  profileFeedback,
  clearProfileFeedback,
}) => {
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);

  const atMax = user.selectedSubjects.length >= 4;

  const toggleSubject = (value: string) => {
    if (value === "english") return;
    const selected = user.selectedSubjects.includes(value);
    if (selected) {
      setUser({ ...user, selectedSubjects: user.selectedSubjects.filter(s => s !== value) });
    } else if (!atMax) {
      setUser({ ...user, selectedSubjects: [...user.selectedSubjects, value] });
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleProfileUpdate();
  };

  const initials = user.firstName && user.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`
    : user.email
      ? user.email[0].toUpperCase()
      : "U";

  return (
    <form onSubmit={handleFormSubmit}>
      {profileFeedback ? (
        <SectionAlertBanner
          title={profileFeedback.type === "success" ? "Profile updated" : "Update failed"}
          description={profileFeedback.message}
          onDismiss={clearProfileFeedback}
          className={
            profileFeedback.type === "success"
              ? "border-green-600/30 bg-green-500/10 text-foreground"
              : undefined
          }
        />
      ) : null}

      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6">
        Profile Information
      </p>

      {/* Avatar row */}
      <div className="flex items-center gap-5 pb-6 border-b border-border">
        <Avatar className="h-20 w-20 shrink-0">
          <AvatarImage src={user.avatar || undefined} alt={user.firstName} />
          <AvatarFallback className="text-lg font-semibold">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">
            {user.firstName || user.lastName
              ? `${user.firstName} ${user.lastName}`.trim()
              : "Your Name"}
          </p>
          <p className="text-xs text-muted-foreground mb-3 truncate">{user.email}</p>
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => setAvatarDialogOpen(true)}
          >
            Change Avatar
          </Button>
        </div>
      </div>

      <AvatarDialog
        isOpen={avatarDialogOpen}
        onClose={() => setAvatarDialogOpen(false)}
        currentAvatar={user.avatar}
        onAvatarSelect={(avatarUrl) => {
          setUser({ ...user, avatar: avatarUrl });
          setAvatarDialogOpen(false);
        }}
      />

      {/* Form fields */}
      <div className="pt-6 space-y-5">

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={user.firstName}
              onChange={e => setUser({ ...user, firstName: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={user.lastName}
              onChange={e => setUser({ ...user, lastName: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            Email
            <span className="ml-2 text-xs text-muted-foreground font-normal">(read-only)</span>
          </Label>
          <Input
            id="email"
            value={user.email}
            disabled
            readOnly
            className="bg-muted/40 cursor-not-allowed"
          />
        </div>

        {/* Subject pills */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Your UTME Subjects</Label>
            <span className="text-xs font-medium" style={{ color: orange }}>
              {atMax
                ? "✓ All 4 selected"
                : user.selectedSubjects.length > 0
                  ? `${user.selectedSubjects.length}/4 — ${4 - user.selectedSubjects.length} more to go`
                  : "Pick 4 subjects"}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {subjects.map((subject) => {
              const isEnglish = subject.value === "english";
              const selected = user.selectedSubjects.includes(subject.value);
              const disabled = !selected && atMax;
              return (
                <button
                  key={subject.value}
                  type="button"
                  onClick={() => toggleSubject(subject.value)}
                  disabled={disabled}
                  className="rounded-full border px-3 py-1.5 text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={
                    selected
                      ? {
                          borderColor: orange,
                          backgroundColor: "hsl(25 95% 53% / 0.12)",
                          color: "hsl(var(--foreground))",
                          fontWeight: 600,
                          cursor: isEnglish ? "default" : "pointer",
                        }
                      : {
                          borderColor: "hsl(var(--border))",
                          color: "hsl(var(--muted-foreground))",
                        }
                  }
                >
                  {subject.label}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            English is compulsory and always selected.
          </p>
        </div>

      </div>

      {/* Save footer */}
      <div className="pt-6 mt-2 border-t border-border flex justify-end">
        <Button
          type="submit"
          size="sm"
          className="text-white"
          style={{ backgroundColor: orange }}
        >
          Save Changes
        </Button>
      </div>

    </form>
  );
};

export default ProfileSettings;
