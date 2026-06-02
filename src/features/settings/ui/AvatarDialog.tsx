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
import { availableAvatars } from "../data/constants";

interface AvatarDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: string;
  onAvatarSelect: (avatarUrl: string) => void;
}

const AvatarDialog: React.FC<AvatarDialogProps> = ({ isOpen, onClose, currentAvatar, onAvatarSelect }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Choose Your Avatar</DialogTitle>
          <DialogDescription>
            Select an avatar that represents you best.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-5 gap-3 py-4">
          {availableAvatars.map((avatarUrl, index) => {
            const isSelected = currentAvatar === avatarUrl;
            return (
              <button
                key={index}
                onClick={() => onAvatarSelect(avatarUrl)}
                className={[
                  "relative p-1.5 rounded-lg border-2 transition-colors",
                  "hover:border-[hsl(var(--brand-orange))]",
                  isSelected
                    ? "border-[hsl(var(--brand-orange))] bg-[hsl(25,95%,53%)]/[0.08]"
                    : "border-border",
                ].join(" ")}
              >
                <Avatar className="h-14 w-14 mx-auto">
                  <AvatarImage src={avatarUrl} alt={`Avatar ${index + 1}`} />
                  <AvatarFallback>A{index + 1}</AvatarFallback>
                </Avatar>
                {isSelected && (
                  <div className="absolute inset-0 flex items-end justify-end p-1.5 pointer-events-none">
                    <div className="h-5 w-5 rounded-full bg-[hsl(var(--brand-orange))] flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AvatarDialog;
