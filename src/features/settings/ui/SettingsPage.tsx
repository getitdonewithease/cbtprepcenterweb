import React from "react";
import Layout from "@/components/common/Layout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { User, Lock, Sun, Moon, Trash } from "lucide-react";
import { useSettings } from "../hooks/useSettings";
import ProfileSettings from "./ProfileSettings";
import SecuritySettings from "./SecuritySettings";
import ApplicationSettings from "./ApplicationSettings";
import DestructiveActions from "./DestructiveActions";

const SettingsPage = () => {
  const {
    user,
    setUser,
    settings,
    setSettings,
    passwords,
    setPasswords,
    loading,
    error,
    handleProfileUpdate,
    handlePasswordChange,
  } = useSettings();

  if (loading) {
    return <Layout title="Settings"><div>Loading...</div></Layout>;
  }

  if (error) {
    return <Layout title="Settings"><div>{error}</div></Layout>;
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
            <TabsTrigger value="application" className="flex items-center gap-2">
              {settings.theme === "light" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              Application
            </TabsTrigger>
            <TabsTrigger value="destructive" className="flex items-center gap-2 text-destructive">
              <Trash className="h-4 w-4" />
              Destructive Actions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileSettings 
              user={user}
              setUser={setUser}
              handleProfileUpdate={handleProfileUpdate}
            />
          </TabsContent>

          <TabsContent value="security">
            <SecuritySettings 
              passwords={passwords}
              setPasswords={setPasswords}
              handlePasswordChange={handlePasswordChange}
            />
          </TabsContent>

          <TabsContent value="application">
            <ApplicationSettings 
              settings={settings}
              setSettings={setSettings}
            />
          </TabsContent>
          
          <TabsContent value="destructive">
            <DestructiveActions />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default SettingsPage; 