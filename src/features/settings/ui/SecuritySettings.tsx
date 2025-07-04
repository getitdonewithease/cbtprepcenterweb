import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PasswordState } from "../types/settingsTypes";

interface SecuritySettingsProps {
  passwords: PasswordState;
  setPasswords: React.Dispatch<React.SetStateAction<PasswordState>>;
  handlePasswordChange: () => void;
  emailConfirmed: boolean;
  handleConfirmEmail: () => void;
}

const SecuritySettings: React.FC<SecuritySettingsProps> = ({ passwords, setPasswords, handlePasswordChange, emailConfirmed, handleConfirmEmail }) => {
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handlePasswordChange();
  };
  
  return (
    <>
      {!emailConfirmed && (
        <Card>
          <CardHeader>
            <CardTitle>Email</CardTitle>
            <CardDescription>
              Confirm your email address to secure your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleConfirmEmail}>Confirm Email</Button>
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            Change your password to keep your account secure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setShowPasswordForm((prev) => !prev)} className="mb-4">
            {showPasswordForm ? "Hide" : "Change Password"}
          </Button>
          {showPasswordForm && (
            <form onSubmit={handleFormSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" value={passwords.current} onChange={e => setPasswords({ ...passwords, current: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" value={passwords.new} onChange={e => setPasswords({ ...passwords, new: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} />
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                <Button type="submit">Change Password</Button>
              </div>
            </form>
          )}
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
    </>
  );
};

export default SecuritySettings; 