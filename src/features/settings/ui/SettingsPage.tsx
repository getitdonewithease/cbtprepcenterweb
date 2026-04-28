import React, { useState } from "react";
import Layout from "@/components/common/Layout";
import { User, Lock, Sun, Trash2 } from "lucide-react";
import { useSettings } from "../hooks/useSettings";
import ProfileSettings from "./ProfileSettings";
import SecuritySettings from "./SecuritySettings";
import ApplicationSettings from "./ApplicationSettings";
import DestructiveActions from "./DestructiveActions";

type Section = "profile" | "security" | "appearance" | "danger";

const navItems: { id: Section; label: string; icon: React.ElementType; danger?: boolean }[] = [
  { id: "profile",    label: "Profile",     icon: User   },
  { id: "security",   label: "Security",    icon: Lock   },
  { id: "appearance", label: "Appearance",  icon: Sun    },
  { id: "danger",     label: "Danger Zone", icon: Trash2, danger: true },
];

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState<Section>("profile");

  const {
    user,
    setUser,
    settings,
    setSettings,
    passwords,
    setPasswords,
    loading,
    error,
    profileFeedback,
    handleProfileUpdate,
    handlePasswordChange,
    handleConfirmEmail,
    clearProfileFeedback,
  } = useSettings();

  if (loading) {
    return (
      <Layout title="Settings">
        <div className="p-8 text-muted-foreground text-sm">Loading...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Settings">
        <div className="p-8 text-destructive text-sm">{error}</div>
      </Layout>
    );
  }

  return (
    <Layout title="Settings">
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
        </div>

        {/* Two-column layout */}
        <div className="flex flex-col sm:flex-row gap-8 items-start">

          {/* Sidebar Nav */}
          <nav
            className={[
              "flex sm:flex-col gap-1",
              "overflow-x-auto sm:overflow-visible",
              "w-full sm:w-48 sm:shrink-0",
              "pb-3 sm:pb-0",
              "border-b sm:border-b-0 border-border",
            ].join(" ")}
          >
            {navItems.map(({ id, label, icon: Icon, danger }) => {
              const isActive = activeSection === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveSection(id)}
                  className={[
                    "flex items-center gap-2.5 text-sm px-3 py-2 transition-colors text-left",
                    "rounded-md sm:rounded-none whitespace-nowrap w-auto sm:w-full",
                    "sm:border-l-2",
                    isActive
                      ? [
                          "sm:border-[hsl(var(--brand-orange))]",
                          "bg-[hsl(25,95%,53%)]/[0.08]",
                          "text-[hsl(var(--brand-orange))]",
                          "font-medium",
                        ].join(" ")
                      : danger
                        ? "sm:border-transparent text-destructive hover:bg-destructive/5"
                        : "sm:border-transparent text-muted-foreground hover:text-foreground hover:bg-accent",
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </button>
              );
            })}
          </nav>

          {/* Content Area */}
          <div className="flex-1 min-w-0 max-w-2xl">
            {activeSection === "profile" && (
              <ProfileSettings
                user={user}
                setUser={setUser}
                handleProfileUpdate={handleProfileUpdate}
                profileFeedback={profileFeedback}
                clearProfileFeedback={clearProfileFeedback}
              />
            )}
            {activeSection === "security" && (
              <SecuritySettings
                passwords={passwords}
                setPasswords={setPasswords}
                handlePasswordChange={handlePasswordChange}
                emailConfirmed={user.emailConfirmed}
                handleConfirmEmail={handleConfirmEmail}
              />
            )}
            {activeSection === "appearance" && (
              <ApplicationSettings
                settings={settings}
                setSettings={setSettings}
              />
            )}
            {activeSection === "danger" && <DestructiveActions />}
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;
