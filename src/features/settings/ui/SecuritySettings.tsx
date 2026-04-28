import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import { PasswordState } from "../types/settingsTypes";

const orange = "hsl(var(--brand-orange))";

interface SecuritySettingsProps {
  passwords: PasswordState;
  setPasswords: React.Dispatch<React.SetStateAction<PasswordState>>;
  handlePasswordChange: () => void;
  emailConfirmed: boolean;
  handleConfirmEmail: () => void;
}

const SecuritySettings: React.FC<SecuritySettingsProps> = ({
  passwords,
  setPasswords,
  handlePasswordChange,
  emailConfirmed,
  handleConfirmEmail,
}) => {
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handlePasswordChange();
  };

  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6">
        Security
      </p>

      {/* Email confirmation banner */}
      {!emailConfirmed && (
        <div
          className={[
            "flex items-start gap-3 mb-6 p-4 rounded-lg",
            "bg-amber-50 dark:bg-amber-950/20",
            "border-l-4 border-amber-400",
          ].join(" ")}
        >
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
              Email not confirmed
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-400 mt-0.5">
              Confirm your email address to secure your account.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleConfirmEmail}
            className={[
              "shrink-0",
              "border-amber-300 text-amber-700 hover:bg-amber-100",
              "dark:border-amber-600 dark:text-amber-400 dark:hover:bg-amber-900/40",
            ].join(" ")}
          >
            Confirm Email
          </Button>
        </div>
      )}

      {/* Password row */}
      <div className="border-b border-border">
        <div className="flex items-center justify-between py-4">
          <div>
            <p className="text-sm font-medium">Password</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Change your password to keep your account secure.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPasswordForm((prev) => !prev)}
          >
            {showPasswordForm ? "Cancel" : "Change Password"}
          </Button>
        </div>

        {showPasswordForm && (
          <div className="bg-muted/40 rounded-lg p-4 mb-4">
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={passwords.current}
                  onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={passwords.new}
                  onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={passwords.confirm}
                  onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                />
              </div>
              <div className="flex justify-end pt-1">
                <Button
                  type="submit"
                  size="sm"
                  className="text-white"
                  style={{ backgroundColor: orange }}
                >
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Two-Factor Authentication section */}
      <div className="mt-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
          Two-Factor Authentication
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          Add an extra layer of security to your account.
        </p>

        <div className="flex items-center justify-between py-4 border-b border-border">
          <div>
            <p className="text-sm font-medium">Authenticator App</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Use an authenticator app to generate one-time codes.
            </p>
          </div>
          <Button variant="outline" size="sm">Setup</Button>
        </div>

        <div className="flex items-center justify-between py-4 border-b border-border">
          <div>
            <p className="text-sm font-medium">SMS Recovery</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Use your phone number as a backup method.
            </p>
          </div>
          <Button variant="outline" size="sm">Setup</Button>
        </div>
      </div>
    </>
  );
};

export default SecuritySettings;
