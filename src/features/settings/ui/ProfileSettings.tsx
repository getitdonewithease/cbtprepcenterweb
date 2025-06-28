import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { UserProfile } from "../types/settingsTypes";
import { subjects, departmentSubjects } from "../data/constants";
import AvatarDialog from "./AvatarDialog";

interface ProfileSettingsProps {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  handleProfileUpdate: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, setUser, handleProfileUpdate }) => {
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);

  const handleSubjectRemove = (subjectValue: string) => {
    setUser((prev) => ({
      ...prev,
      selectedSubjects: prev.selectedSubjects.filter((s) => s !== subjectValue),
    }));
  };

  const filteredSubjects = user.department && departmentSubjects[user.department]
    ? subjects.filter((s) => departmentSubjects[user.department].includes(s.value))
    : [];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleProfileUpdate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>
          Update your personal information and how it appears on your profile.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFormSubmit}>
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.avatar || undefined} alt={user.firstName} />
                <AvatarFallback>
                  {user.firstName && user.lastName
                    ? `${user.firstName[0]}${user.lastName[0]}`
                    : (user.email ? user.email[0] : "U")}
                </AvatarFallback>
              </Avatar>
              <div>
                <Button variant="outline" size="sm" type="button" onClick={() => setAvatarDialogOpen(true)}>
                  Change Avatar
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Choose from our collection of avatars.
                </p>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" value={user.firstName} onChange={e => setUser({ ...user, firstName: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" value={user.lastName} onChange={e => setUser({ ...user, lastName: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user.email} disabled readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={user.department}
                  onValueChange={value => {
                    setUser({
                      ...user,
                      department: value,
                      selectedSubjects: user.selectedSubjects.filter(s => departmentSubjects[value]?.includes(s)),
                    });
                  }}
                >
                  <SelectTrigger id="department"><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Science">Science</SelectItem>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                    <SelectItem value="Art">Art</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Selected Subjects</Label>
              <Select
                value=""
                onValueChange={(value) => {
                  if (!user.selectedSubjects.includes(value) && user.selectedSubjects.length < 4) {
                    setUser({ ...user, selectedSubjects: [...user.selectedSubjects, value] });
                  }
                }}
                disabled={user.selectedSubjects.length >= 4}
              >
                <SelectTrigger className="w-full"><SelectValue placeholder="Add Subject" /></SelectTrigger>
                <SelectContent>
                  {filteredSubjects.map((subject) => (
                    <SelectItem key={subject.value} value={subject.value} disabled={user.selectedSubjects.includes(subject.value)}>
                      {subject.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex flex-wrap gap-2 mt-2">
                {user.selectedSubjects.map((subjectValue) => {
                  const subject = subjects.find((s) => s.value === subjectValue);
                  return (
                    <Badge key={subjectValue} variant="secondary" className="text-xs flex items-center gap-1">
                      {subject?.label}
                      {subjectValue !== "english" && (
                        <button type="button" onClick={() => handleSubjectRemove(subjectValue)}>
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </Badge>
                  );
                })}
              </div>
              <p className="text-sm text-muted-foreground">
                Select up to 4 subjects. English is compulsory.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileSettings; 