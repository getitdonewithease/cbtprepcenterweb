import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check } from "lucide-react";
import { AVATAR_OPTIONS } from "../data/constants";

interface AvatarDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: string;
  onAvatarSelect: (avatarUrl: string) => void;
}

export const AvatarDialog: React.FC<AvatarDialogProps> = ({
  isOpen,
  onClose,
  currentAvatar,
  onAvatarSelect,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Choose Your Avatar</DialogTitle>
          <DialogDescription>
            Select an avatar that represents you on your prep journey.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-4 sm:grid-cols-4 gap-3 py-4 max-h-[380px] overflow-y-auto">
          {AVATAR_OPTIONS.map((avatarUrl, index) => {
            const isSelected = currentAvatar === avatarUrl;
            return (
              <button
                key={index}
                type="button"
                onClick={() => onAvatarSelect(avatarUrl)}
                className={[
                  "relative p-2 rounded-xl border-2 transition-all flex flex-col items-center justify-center hover:scale-105",
                  "hover:border-[hsl(var(--brand-orange))]",
                  isSelected
                    ? "border-[hsl(var(--brand-orange))] bg-[hsl(25,95%,53%)]/[0.08]"
                    : "border-border",
                ].join(" ")}
              >
                <Avatar className="h-16 w-16">
                  <AvatarImage src={avatarUrl} alt={`Avatar ${index + 1}`} />
                  <AvatarFallback>A{index + 1}</AvatarFallback>
                </Avatar>
                {isSelected && (
                  <div className="absolute top-1 right-1">
                    <div className="h-5 w-5 rounded-full bg-[hsl(var(--brand-orange))] flex items-center justify-center shadow-sm">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} type="button">
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
