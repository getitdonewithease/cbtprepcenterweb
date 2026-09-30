import React from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, CheckCircle2, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DailyChallengeSubmissionValue } from "../types/dailyChallengeTypes";

interface DailyChallengeResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: DailyChallengeSubmissionValue | null;
  date?: string;
}

const orange = "hsl(var(--brand-orange))";
const orangeText = "hsl(25 85% 45%)";

export const DailyChallengeResultModal: React.FC<DailyChallengeResultModalProps> = ({
  isOpen,
  onClose,
  result,
  date,
}) => {
  const navigate = useNavigate();

  if (!result) return null;

  const total = result.totalQuestions || 0;
  const correct = result.correctAnswers || 0;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  const handleReturnToDashboard = () => {
    onClose();
    navigate("/dashboard");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleReturnToDashboard()}>
      <DialogContent className="max-w-md rounded-2xl p-6 sm:p-8 border-[0.5px] border-[#e4e4e1] shadow-2xl">
        <DialogHeader className="items-center text-center">
          {/* Trophy Header Icon */}
          <div
            className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl transition-transform hover:scale-105"
            style={{ backgroundColor: "hsl(25 95% 53% / 0.12)" }}
          >
            <Trophy className="h-8 w-8" style={{ color: orange }} />
          </div>

          <DialogTitle className="text-2xl font-bold tracking-tight text-[#222]">
            Challenge Completed!
          </DialogTitle>
          <DialogDescription className="text-[14px] text-[#666]">
            {date ? `You completed the daily challenge for ${date}.` : "You completed today's daily challenge."}
          </DialogDescription>
        </DialogHeader>

        {/* Future Streak / Fire Animation Placeholder Container */}
        <div id="streak-animation-container" className="my-2">
          {/* Will host the smooth animated fire & streak count */}
        </div>

        {/* Results Stats Cards */}
        <div className="grid grid-cols-2 gap-3 my-4">
          <div className="rounded-xl border-[0.5px] border-[#e8e8e5] bg-[#fafaf8] p-4 text-center">
            <span className="text-[12px] font-medium uppercase tracking-wider text-[#888]">
              Score
            </span>
            <p className="mt-1 text-2xl font-black text-[#222]">{result.score}</p>
          </div>

          <div className="rounded-xl border-[0.5px] border-[#e8e8e5] bg-[#fafaf8] p-4 text-center">
            <span className="text-[12px] font-medium uppercase tracking-wider text-[#888]">
              Accuracy
            </span>
            <p className="mt-1 text-2xl font-black" style={{ color: orangeText }}>
              {accuracy}%
            </p>
          </div>
        </div>

        <div className="rounded-xl border-[0.5px] border-[#e8e8e5] bg-white p-3.5 flex items-center justify-between text-[13px] text-[#555]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span className="font-medium text-[#333]">Correct Questions</span>
          </div>
          <span className="font-semibold text-[#222]">
            {correct} of {total}
          </span>
        </div>

        <DialogFooter className="mt-6 sm:justify-center">
          <Button
            onClick={handleReturnToDashboard}
            className="w-full rounded-xl text-[14px] font-semibold text-white shadow-none hover:opacity-95 h-11"
            style={{ backgroundColor: orange }}
          >
            <span>Return to Dashboard</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DailyChallengeResultModal;
