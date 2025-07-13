// import React from "react";
// import Layout from "@/components/common/Layout";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
// import { User, Lock, Sun, Moon, Trash } from "lucide-react";
// import { useSettings } from "../hooks/useSettings";
// import ProfileSettings from "./ProfileSettings";
// import SecuritySettings from "./SecuritySettings";
// import ApplicationSettings from "./ApplicationSettings";
// import DestructiveActions from "./DestructiveActions";

// const SettingsPage = () => {
//   const {
//     user,
//     setUser,
//     settings,
//     setSettings,
//     passwords,
//     setPasswords,
//     loading,
//     error,
//     handleProfileUpdate,
//     handlePasswordChange,
//     handleConfirmEmail,
//   } = useSettings();

//   if (loading) {
//     return <Layout title="Settings"><div>Loading...</div></Layout>;
//   }

//   if (error) {
//     return <Layout title="Settings"><div>{error}</div></Layout>;
//   }

//   return (
//     <Layout title="Settings">
//       <div className="container py-10">
//         <Tabs defaultValue="profile" className="w-full">
//           <TabsList className="mb-8">
//             <TabsTrigger value="profile" className="flex items-center gap-2">
//               <User className="h-4 w-4" />
//               Profile
//             </TabsTrigger>
//             <TabsTrigger value="security" className="flex items-center gap-2">
//               <Lock className="h-4 w-4" />
//               Security
//             </TabsTrigger>
//             <TabsTrigger value="application" className="flex items-center gap-2">
//               {settings.theme === "light" ? (
//                 <Sun className="h-4 w-4" />
//               ) : (
//                 <Moon className="h-4 w-4" />
//               )}
//               Application
//             </TabsTrigger>
//             <TabsTrigger value="destructive" className="flex items-center gap-2 text-destructive">
//               <Trash className="h-4 w-4" />
//               Destructive Actions
//             </TabsTrigger>
//           </TabsList>

//           <TabsContent value="profile">
//             <ProfileSettings 
//               user={user}
//               setUser={setUser}
//               handleProfileUpdate={handleProfileUpdate}
//             />
//           </TabsContent>

//           <TabsContent value="security">
//             <SecuritySettings 
//               passwords={passwords}
//               setPasswords={setPasswords}
//               handlePasswordChange={handlePasswordChange}
//               emailConfirmed={user.emailConfirmed}
//               handleConfirmEmail={handleConfirmEmail}
//             />
//           </TabsContent>

//           <TabsContent value="application">
//             <ApplicationSettings 
//               settings={settings}
//               setSettings={setSettings}
//             />
//           </TabsContent>
          
//           <TabsContent value="destructive">
//             <DestructiveActions />
//           </TabsContent>
//         </Tabs>
//       </div>
//     </Layout>
//   );
// };

// export default SettingsPage; 




















import React from "react";
import Layout from "@/components/common/Layout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { User, Lock, Sun, Moon, Trash } from "lucide-react";
import { useSettings } from "../hooks/useSettings";
import { Skeleton } from "@/components/ui/skeleton";
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
    handleConfirmEmail,
  } = useSettings();

  if (loading) {
    return (
      <Layout title="Settings">
        <div className="px-4 sm:px-6 py-6 sm:py-8">
          <div className="mb-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-8 w-full sm:w-24" />
              ))}
            </div>
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Settings">
        <div className="px-4 sm:px-6 py-6 sm:py-8 text-red-500 text-xs sm:text-sm">
          {error}
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Settings">
      <div className="px-4 sm:px-6 py-6 sm:py-8">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-4 sm:mb-6 grid grid-cols-2 sm:flex sm:flex-wrap justify-start">
            <TabsTrigger value="profile" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <User className="h-3.5 w-3.5" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Lock className="h-3.5 w-3.5" />
              Security
            </TabsTrigger>
            <TabsTrigger value="application" className="flex items-center gap-1.5 text-xs sm:text-sm">
              {settings.theme === "light" ? (
                <Sun className="h-3.5 w-3.5" />
              ) : (
                <Moon className="h-3.5 w-3.5" />
              )}
              Application
            </TabsTrigger>
            <TabsTrigger value="destructive" className="flex items-center gap-1.5 text-destructive text-xs sm:text-sm">
              <Trash className="h-3.5 w-3.5" />
              Destructive
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
              emailConfirmed={user.emailConfirmed}
              handleConfirmEmail={handleConfirmEmail}
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