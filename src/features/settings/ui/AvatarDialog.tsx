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
        <div className="grid grid-cols-4 gap-4 py-4">
          {availableAvatars.map((avatarUrl, index) => (
            <button
              key={index}
              onClick={() => onAvatarSelect(avatarUrl)}
              className={`p-2 rounded-lg border-2 transition-colors hover:border-primary ${
                currentAvatar === avatarUrl
                  ? "border-primary bg-primary/10"
                  : "border-border"
              }`}
            >
              <Avatar className="h-16 w-16 mx-auto">
                <AvatarImage src={avatarUrl} alt={`Avatar ${index + 1}`} />
                <AvatarFallback>A{index + 1}</AvatarFallback>
              </Avatar>
            </button>
          ))}
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