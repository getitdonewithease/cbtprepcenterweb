import React from "react";
import { Button } from "@/components/ui/button";
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
import { LogOut } from "lucide-react";

const DestructiveActions = () => {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-destructive mb-1">
        Danger Zone
      </p>
      <p className="text-sm text-muted-foreground mb-6">
        These actions are permanent and cannot be undone.
      </p>

      {/* Clear Test History */}
      <div className="flex items-center justify-between py-5 border-b border-border">
        <div className="mr-4">
          <p className="text-sm font-medium">Clear Test History</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Delete all your test attempts and results.
          </p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="shrink-0">
              Clear History
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete all your test history
                and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction className="bg-destructive">Yes, clear my history</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Delete Account */}
      <div className="flex items-center justify-between py-5 border-b border-border">
        <div className="mr-4">
          <p className="text-sm font-medium">Delete Account</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Permanently delete your account and all associated data.
          </p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="shrink-0">
              Delete Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your account and remove
                your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction className="bg-destructive">Yes, delete my account</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Log Out Everywhere */}
      <div className="flex items-center justify-between py-5 border-b border-border">
        <div className="mr-4">
          <p className="text-sm font-medium">Log Out Everywhere</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Log out from all devices except this one.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 border-destructive/40 text-destructive hover:bg-destructive/5 hover:border-destructive"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Log Out Everywhere
        </Button>
      </div>
    </div>
  );
};

export default DestructiveActions;
