import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { X, ChevronDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Lock,
  Moon,
  Sun,
  Eye,
  EyeOff,
  Trash,
  LogOut,
  MessageCircle,
} from "lucide-react";
import Layout from "./common/Layout";
import api from "@/lib/apiConfig";

const departmentSubjects: { [key: string]: string[] } = {
  Science: ["mathematics", "english", "biology", "physics", "chemistry"],
  // Add other departments and their allowed subjects
};

const Settings = () => {
  // Available subjects
  const subjects = [
    { value: "english", label: "English" },
    { value: "mathematics", label: "Mathematics" },
    { value: "commerce", label: "Commerce" },
    { value: "accounting", label: "Accounting" },
    { value: "biology", label: "Biology" },
    { value: "physics", label: "Physics" },
    { value: "chemistry", label: "Chemistry" },
    { value: "englishlit", label: "English Literature" },
    { value: "government", label: "Government" },
    { value: "crk", label: "Christian Religious Knowledge" },
    { value: "geography", label: "Geography" },
    { value: "economics", label: "Economics" },
    { value: "irk", label: "Islamic Religious Knowledge" },
    { value: "civiledu", label: "Civic Education" },
    { value: "insurance", label: "Insurance" },
    { value: "currentaffairs", label: "Current Affairs" },
    { value: "history", label: "History" },
  ];

  // User profile state
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    department: "",
    selectedSubjects: [] as string[],
    avatar: "",
  });

  // Subject selection state
  const [subjectPopoverOpen, setSubjectPopoverOpen] = useState(false);

  // Avatar selection state
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);

  // Available avatars
  const availableAvatars = [
    // Original avatars
    "https://api.dicebear.com/7.x/avataaars/svg?seed=oluwaseun",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=adebayo",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=kemi",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=tunde",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=folake",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=emeka",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=aisha",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=ibrahim",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=chioma",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=yusuf",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=blessing",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=daniel",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=fatima",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=chinedu",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=amina",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=samuel",
    // Black masculine avatars
    "https://api.dicebear.com/7.x/avataaars/svg?seed=kwame&skinColor=brown",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=malik&skinColor=dark",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=kofi&skinColor=brown",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=jamal&skinColor=dark",
    // Black feminine avatars
    "https://api.dicebear.com/7.x/avataaars/svg?seed=asha&skinColor=brown",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=zara&skinColor=dark",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=keisha&skinColor=brown",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=nia&skinColor=dark",
    // Religious/modest avatars
    "https://api.dicebear.com/7.x/avataaars/svg?seed=hajiya&accessoriesChance=100&accessories=hijab",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=maryam&accessoriesChance=100&accessories=hijab",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=pastor&clothingColor=black",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=imam&facialHairChance=100",
  ];

  // Settings state
  const [settings, setSettings] = useState({
    theme: "light",
    profileVisibility: true,
    emailNotifications: true,
    joinLeaderboard: true,
  });

  // Password state
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/api/v1/students/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data.value;
        if (data) {
          setUser({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || "",
            department: data.department || "",
            selectedSubjects: Array.isArray(data.courses) ? data.courses.map((c: string) => c.toLowerCase()) : [],
            avatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.firstName}`,
          });
        }
      } catch (err) {
        console.error("Failed to fetch student profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Handle theme toggle
  const handleThemeToggle = () => {
    const newTheme = settings.theme === "light" ? "dark" : "light";
    setSettings({ ...settings, theme: newTheme });
    // In a real app, you would apply the theme to the document here
    // document.documentElement.classList.toggle('dark');
  };

  // Handle profile visibility toggle
  const handleProfileVisibilityToggle = () => {
    const newVisibility = !settings.profileVisibility;
    setSettings({
      ...settings,
      profileVisibility: newVisibility,
      // If profile visibility is turned off, also turn off leaderboard participation
      joinLeaderboard: newVisibility ? settings.joinLeaderboard : false,
    });
  };

  // Handle leaderboard participation toggle
  const handleLeaderboardToggle = () => {
    // Can only toggle on if profile is visible
    if (!settings.profileVisibility && !settings.joinLeaderboard) return;

    setSettings({
      ...settings,
      joinLeaderboard: !settings.joinLeaderboard,
    });
  };

  // Handle subject selection
  const handleSubjectToggle = (subjectValue: string) => {
    setUser((prev) => ({
      ...prev,
      selectedSubjects: prev.selectedSubjects.includes(subjectValue)
        ? prev.selectedSubjects.filter((s) => s !== subjectValue)
        : [...prev.selectedSubjects, subjectValue],
    }));
  };

  // Handle subject removal
  const handleSubjectRemove = (subjectValue: string) => {
    setUser((prev) => ({
      ...prev,
      selectedSubjects: prev.selectedSubjects.filter((s) => s !== subjectValue),
    }));
  };

  // Handle avatar selection
  const handleAvatarSelect = (avatarUrl: string) => {
    setUser((prev) => ({
      ...prev,
      avatar: avatarUrl,
    }));
    setAvatarDialogOpen(false);
  };

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await api.put(
        "/api/v1/students",
        {
          firstName: user.firstName,
          lastName: user.lastName,
          department: user.department,
          courses: user.selectedSubjects.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Failed to update profile.");
    }
  };

  // Handle password change
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate passwords
    if (passwords.new !== passwords.confirm) {
      alert("New passwords do not match!");
      return;
    }
    // In a real app, you would send this data to your backend
    alert("Password changed successfully!");
    setPasswords({ current: "", new: "", confirm: "" });
  };

  const filteredSubjects = user.department && departmentSubjects[user.department]
    ? subjects.filter((s) => departmentSubjects[user.department].includes(s.value))
    : subjects;

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Layout title="Settings">
      <div className="container py-10">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger
              value="application"
              className="flex items-center gap-2"
            >
              {settings.theme === "light" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              Application
            </TabsTrigger>
            <TabsTrigger
              value="destructive"
              className="flex items-center gap-2 text-destructive"
            >
              <Trash className="h-4 w-4" />
              Destructive Actions
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and how it appears on your
                  profile.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleProfileUpdate}
                  onClick={e => {
                    // If the clicked element is a button and not type="submit", prevent form submission
                    const target = e.target as HTMLElement;
                    if (
                      target.tagName === "BUTTON" &&
                      (target as HTMLButtonElement).type !== "submit"
                    ) {
                      e.preventDefault();
                    }
                  }}
                  onKeyDown={e => {
                    // Prevent Enter from submitting the form if focus is on a dropdown/popover/combobox/option
                    const role = document.activeElement?.getAttribute("role");
                    if (
                      e.key === "Enter" &&
                      (role === "combobox" ||
                        role === "option" ||
                        document.activeElement?.closest("[data-radix-popper-content-wrapper]") ||
                        document.activeElement?.closest("[role=dialog]"))
                    ) {
                      e.preventDefault();
                    }
                  }}
                >
                  <div className="space-y-6">
                    <div className="flex items-center gap-6">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={user.avatar} alt={user.firstName} />
                        <AvatarFallback>
                          {user.firstName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Dialog
                          open={avatarDialogOpen}
                          onOpenChange={setAvatarDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              Change Avatar
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                              <DialogTitle>Choose Your Avatar</DialogTitle>
                              <DialogDescription>
                                Select an avatar that represents you best.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-4 gap-4 py-4">
                              {availableAvatars.map((avatarUrl, index) => (
                                <button
                                  key={index}
                                  onClick={() => handleAvatarSelect(avatarUrl)}
                                  className={`p-2 rounded-lg border-2 transition-colors hover:border-primary ${
                                    user.avatar === avatarUrl
                                      ? "border-primary bg-primary/10"
                                      : "border-border"
                                  }`}
                                >
                                  <Avatar className="h-16 w-16 mx-auto">
                                    <AvatarImage
                                      src={avatarUrl}
                                      alt={`Avatar ${index + 1}`}
                                    />
                                    <AvatarFallback>
                                      A{index + 1}
                                    </AvatarFallback>
                                  </Avatar>
                                </button>
                              ))}
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setAvatarDialogOpen(false)}
                              >
                                Cancel
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <p className="text-sm text-muted-foreground mt-2">
                          Choose from our collection of avatars.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          value={user.email}
                          disabled
                          readOnly
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Input
                          id="department"
                          value={user.department}
                          onChange={e => setUser({ ...user, department: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Selected Subjects</Label>
                      <Popover
                        open={subjectPopoverOpen}
                        onOpenChange={setSubjectPopoverOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            role="combobox"
                            aria-expanded={subjectPopoverOpen}
                            className="w-full justify-between h-auto min-h-[2.5rem] p-2"
                          >
                            <div className="flex flex-wrap gap-1">
                              {user.selectedSubjects.length === 0 ? (
                                <span className="text-muted-foreground">
                                  Select subjects...
                                </span>
                              ) : (
                                user.selectedSubjects.map((subjectValue) => {
                                  const subject = subjects.find(
                                    (s) => s.value === subjectValue,
                                  );
                                  return (
                                    <Badge
                                      key={subjectValue}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {subject?.label}
                                      <button
                                        type="button"
                                        className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") {
                                            handleSubjectRemove(subjectValue);
                                          }
                                        }}
                                        onMouseDown={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                        }}
                                        onClick={() =>
                                          handleSubjectRemove(subjectValue)
                                        }
                                      >
                                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                      </button>
                                    </Badge>
                                  );
                                })
                              )}
                            </div>
                            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search subjects..." />
                            <CommandEmpty>No subject found.</CommandEmpty>
                            <CommandGroup className="max-h-64 overflow-auto">
                              {filteredSubjects.map((subject) => (
                                <CommandItem
                                  key={subject.value}
                                  onSelect={() =>
                                    handleSubjectToggle(subject.value)
                                  }
                                  className="flex items-center space-x-2"
                                >
                                  <Checkbox
                                    checked={user.selectedSubjects.includes(
                                      subject.value,
                                    )}
                                    onChange={() =>
                                      handleSubjectToggle(subject.value)
                                    }
                                  />
                                  <span>{subject.label}</span>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <p className="text-sm text-muted-foreground">
                        Select the subjects you want to practice for your UTME
                        exam.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row gap-4">
                    <Button type="submit">Save Changes</Button>
                    <Button
                      type="button"
                      style={{ backgroundColor: "#5865F2", color: "white" }}
                      className="flex items-center gap-2 hover:brightness-110"
                      onClick={() =>
                        window.open("https://discord.gg/utmeprep", "_blank")
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-4 w-4"
                        aria-hidden="true"
                      >
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                      </svg>
                      Join Discord Community
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>
                  Change your password to keep your account secure.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={passwords.current}
                        onChange={(e) =>
                          setPasswords({
                            ...passwords,
                            current: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={passwords.new}
                        onChange={(e) =>
                          setPasswords({ ...passwords, new: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={passwords.confirm}
                        onChange={(e) =>
                          setPasswords({
                            ...passwords,
                            confirm: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button type="submit">Change Password</Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>
                  Add an extra layer of security to your account.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Authenticator App</p>
                    <p className="text-sm text-muted-foreground">
                      Use an authenticator app to generate one-time codes.
                    </p>
                  </div>
                  <Button variant="outline">Setup</Button>
                </div>

                <Separator className="my-6" />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">SMS Recovery</p>
                    <p className="text-sm text-muted-foreground">
                      Use your phone number as a backup method.
                    </p>
                  </div>
                  <Button variant="outline">Setup</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Application Tab */}
          <TabsContent value="application">
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
                      <p className="text-sm text-muted-foreground">
                        Switch between light and dark mode.
                      </p>
                    </div>
                    <div className="flex items-center">
                      <Sun className="h-5 w-5 mr-2" />
                      <Switch
                        id="theme"
                        checked={settings.theme === "dark"}
                        onCheckedChange={handleThemeToggle}
                      />
                      <Moon className="h-5 w-5 ml-2" />
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="profile-visibility">
                        Profile Visibility
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Allow others to see your profile and test results.
                      </p>
                    </div>
                    <div className="flex items-center">
                      {settings.profileVisibility ? (
                        <Eye className="h-5 w-5 mr-2" />
                      ) : (
                        <EyeOff className="h-5 w-5 mr-2" />
                      )}
                      <Switch
                        id="profile-visibility"
                        checked={settings.profileVisibility}
                        onCheckedChange={handleProfileVisibilityToggle}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="join-leaderboard">Join Leaderboard</Label>
                      <p className="text-sm text-muted-foreground">
                        Participate in the global leaderboard rankings.
                      </p>
                    </div>
                    <Switch
                      id="join-leaderboard"
                      checked={settings.joinLeaderboard}
                      onCheckedChange={handleLeaderboardToggle}
                      disabled={!settings.profileVisibility}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications">
                        Email Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive updates, tips, and test reminders via email.
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={settings.emailNotifications}
                      onCheckedChange={() =>
                        setSettings({
                          ...settings,
                          emailNotifications: !settings.emailNotifications,
                        })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Destructive Actions Tab */}
          <TabsContent value="destructive">
            <Card>
              <CardHeader>
                <CardTitle className="text-destructive">
                  Destructive Actions
                </CardTitle>
                <CardDescription>
                  These actions cannot be undone. Please proceed with caution.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border border-destructive/20 rounded-lg p-4 bg-destructive/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Clear Test History</h3>
                      <p className="text-sm text-muted-foreground">
                        Delete all your test attempts and results.
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          Clear History
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete all your test history and remove your data
                            from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive">
                            Yes, clear my history
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="border border-destructive/20 rounded-lg p-4 bg-destructive/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Delete Account</h3>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your account and all associated data.
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          Delete Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete your account and remove your data from our
                            servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive">
                            Yes, delete my account
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="border border-destructive/20 rounded-lg p-4 bg-destructive/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Log Out Everywhere</h3>
                      <p className="text-sm text-muted-foreground">
                        Log out from all devices except this one.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-destructive text-destructive hover:bg-destructive/10"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Log Out Everywhere
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Settings;
