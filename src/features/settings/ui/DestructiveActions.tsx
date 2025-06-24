import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
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
    <Card>
      <CardHeader>
        <CardTitle className="text-destructive">Destructive Actions</CardTitle>
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
                <Button variant="destructive" size="sm">Clear History</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all your test history and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive">Yes, clear my history</AlertDialogAction>
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
                <Button variant="destructive" size="sm">Delete Account</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive">Yes, delete my account</AlertDialogAction>
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
            <Button variant="outline" size="sm" className="border-destructive text-destructive hover:bg-destructive/10">
              <LogOut className="h-4 w-4 mr-2" />
              Log Out Everywhere
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DestructiveActions; 