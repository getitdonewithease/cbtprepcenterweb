import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface NewTestDialogProps {
  children: React.ReactNode;
  onStart?: (opts: any) => void;
  subjects?: string[];
}

export default function NewTestDialog({ children, onStart, subjects = [] }: NewTestDialogProps) {
  const [tab, setTab] = useState("standard");
  const [customSubjects, setCustomSubjects] = useState<string[]>([]);
  const [customTime, setCustomTime] = useState(120);
  const [customQuestions, setCustomQuestions] = useState(180);
  const [showTimer, setShowTimer] = useState(true);
  const [addTimer, setAddTimer] = useState(true);
  const [englishComprehensive, setEnglishComprehensive] = useState(false);
  const [open, setOpen] = useState(false);

  // For customized: handle subject selection
  const handleSubjectToggle = (subject: string) => {
    setCustomSubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((s) => s !== subject)
        : prev.length < 4
        ? [...prev, subject]
        : prev
    );
  };

  // For customized: show English comprehensive only if English is selected
  const showEnglishComprehensive = tab === "customized" && customSubjects.includes("English");

  // For standard: all fields are fixed
  const standardFields = {
    subjects: subjects,
    time: 120,
    questions: 180,
    showTimer: true,
  };

  // For customized: allow changes
  const canStartCustom = customSubjects.length === 4 && customTime > 0 && customQuestions > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-lg w-full">
        <DialogHeader>
          <DialogTitle></DialogTitle>
        </DialogHeader>
        <Tabs value={tab} onValueChange={setTab} className="w-full mt-2">
          <div className="flex items-center justify-between w-full mb-4">
            <span className="text-lg font-semibold">New Test</span>
            <TabsList className="flex gap-2 bg-muted rounded-md px-1 py-1 w-auto min-w-0 shadow-none">
              <TabsTrigger value="standard">Standard</TabsTrigger>
              <TabsTrigger value="customized">Customized</TabsTrigger>
            </TabsList>
          </div>
          {/* Standard Tab */}
          <TabsContent value="standard">
            <div className="space-y-4">
              <div>
                <Label className="mb-1 block">Select Subject</Label>
                <div className="flex flex-wrap gap-2">
                  {standardFields.subjects.map((sub) => (
                    <Badge key={sub} variant="secondary" className="opacity-60 cursor-not-allowed">
                      {sub}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>Time</Label>
                  <Button disabled variant="outline" className="w-full mt-1">2 hours</Button>
                </div>
                <div className="flex-1">
                  <Label>Total Questions</Label>
                  <Button disabled variant="outline" className="w-full mt-1">180</Button>
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-2 mt-1">
                  <Checkbox id="show-timer-standard" checked={standardFields.showTimer} disabled />
                  <Label htmlFor="show-timer-standard">Show the countdown timer during the test</Label>
                </div>
              </div>
              <Button
                className="w-full mt-2"
                onClick={() => {
                  setOpen(false);
                  onStart?.({
                    duration: "02:00:00",
                    courses: standardFields.subjects.map(s => s.toLowerCase()),
                    practiceWithComprehension: true
                  });
                }}
              >
                Prepare Questions
              </Button>
            </div>
          </TabsContent>
          {/* Customized Tab */}
          <TabsContent value="customized">
            <div className="space-y-4">
              <div>
                <Label className="mb-1 block">Select Subject (max 4)</Label>
                <div className="flex flex-wrap gap-2">
                  {(subjects || []).map((sub) => (
                    <Button
                      key={sub}
                      variant={customSubjects.includes(sub) ? "default" : "outline"}
                      className={customSubjects.includes(sub) ? "" : "bg-muted"}
                      onClick={() => handleSubjectToggle(sub)}
                      disabled={
                        !customSubjects.includes(sub) && customSubjects.length >= 4
                      }
                    >
                      {sub}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex items-center mb-0">
                <Checkbox
                  id="add-timer"
                  checked={addTimer}
                  onCheckedChange={checked => setAddTimer(checked === true)}
                />
                <Label htmlFor="add-timer" className="ml-2">Enable Timer for Test</Label>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>Time</Label>
                  <div className="flex gap-2 mt-1">
                    <select
                      value={Math.floor(customTime / 60)}
                      onChange={e => {
                        const hours = Number(e.target.value);
                        let mins = customTime % 60;
                        if (hours === 2) mins = 0;
                        setCustomTime(hours * 60 + mins);
                      }}
                      className="border rounded px-2 py-1"
                      disabled={!addTimer}
                    >
                      {[0, 1, 2].map(h => (
                        <option key={h} value={h}>{h} hr</option>
                      ))}
                    </select>
                    <span className="self-center">:</span>
                    <select
                      value={Math.floor(customTime / 60) === 2 ? 0 : customTime % 60}
                      onChange={e => {
                        let mins = Number(e.target.value);
                        let hours = Math.floor(customTime / 60);
                        if (mins === 60) {
                          if (hours < 2) {
                            hours += 1;
                            mins = 0;
                          } else {
                            mins = 0;
                          }
                        }
                        if (hours === 2) mins = 0;
                        setCustomTime(hours * 60 + mins);
                      }}
                      className="border rounded px-2 py-1"
                      disabled={!addTimer || Math.floor(customTime / 60) === 2}
                    >
                      {Array.from({ length: 60 }, (_, m) => (
                        <option key={m} value={m}>{m.toString().padStart(2, '0')} min</option>
                      ))}
                      <option value={60}>60 min</option>
                    </select>
                  </div>
                </div>
                <div className="flex-1">
                  <Label>Total Questions</Label>
                  <input
                    type="number"
                    min={40}
                    max={180}
                    step={1}
                    value={customQuestions}
                    onChange={e => setCustomQuestions(Number(e.target.value))}
                    className="w-full mt-1 border rounded px-2 py-1"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <Checkbox
                  id="display-timer"
                  checked={showTimer}
                  onCheckedChange={checked => setShowTimer(checked === true)}
                  disabled={!addTimer}
                />
                <Label htmlFor="display-timer">Show the countdown timer during the test</Label>
              </div>
              {showEnglishComprehensive && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="english-comprehensive"
                    checked={englishComprehensive}
                    onCheckedChange={(checked) => setEnglishComprehensive(checked === true)}
                  />
                  <Label htmlFor="english-comprehensive">English with Comprehensive</Label>
                </div>
              )}
              <Button
                className="w-full mt-2"
              >
                Prepare Questions
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 