import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const SUBJECTS = ["Physics", "English", "Mathematics", "Chemistry"];

interface NewTestDialogProps {
  children: React.ReactNode;
  onStart?: (opts: any) => void;
}

export default function NewTestDialog({ children, onStart }: NewTestDialogProps) {
  const [tab, setTab] = useState("standard");
  const [customSubjects, setCustomSubjects] = useState<string[]>([]);
  const [customTime, setCustomTime] = useState(120);
  const [customQuestions, setCustomQuestions] = useState(180);
  const [showTimer, setShowTimer] = useState(true);
  const [englishComprehensive, setEnglishComprehensive] = useState(false);

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
    subjects: SUBJECTS,
    time: 120,
    questions: 180,
    showTimer: true,
  };

  // For customized: allow changes
  const canStartCustom = customSubjects.length === 4 && customTime > 0 && customQuestions > 0;

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-lg w-full">
        <DialogHeader>
          <DialogTitle>New Test</DialogTitle>
        </DialogHeader>
        <Tabs value={tab} onValueChange={setTab} className="w-full mt-2">
          <TabsList className="mb-4 flex gap-2">
            <TabsTrigger value="standard">Standard</TabsTrigger>
            <TabsTrigger value="customized">Customized</TabsTrigger>
          </TabsList>
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
                <Label>Show/hide the timer during the test</Label>
                <RadioGroup value={standardFields.showTimer ? "show" : "hide"} className="mt-1" disabled>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="show" checked id="show-timer" />
                    <Label htmlFor="show-timer">Show Timer</Label>
                  </div>
                </RadioGroup>
              </div>
              <Button className="w-full mt-2" disabled>Start Test</Button>
            </div>
          </TabsContent>
          {/* Customized Tab */}
          <TabsContent value="customized">
            <div className="space-y-4">
              <div>
                <Label className="mb-1 block">Select Subject (max 4)</Label>
                <div className="flex flex-wrap gap-2">
                  {SUBJECTS.map((sub) => (
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
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>Time (minutes)</Label>
                  <input
                    type="number"
                    min={30}
                    max={180}
                    step={5}
                    value={customTime}
                    onChange={e => setCustomTime(Number(e.target.value))}
                    className="w-full mt-1 border rounded px-2 py-1"
                  />
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
              <div>
                <Label>Show/hide the timer during the test</Label>
                <RadioGroup
                  value={showTimer ? "show" : "hide"}
                  onValueChange={val => setShowTimer(val === "show")}
                  className="mt-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="show" id="show-timer-custom" />
                    <Label htmlFor="show-timer-custom">Show Timer</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hide" id="hide-timer-custom" />
                    <Label htmlFor="hide-timer-custom">Hide Timer</Label>
                  </div>
                </RadioGroup>
              </div>
              {showEnglishComprehensive && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="english-comprehensive"
                    checked={englishComprehensive}
                    onCheckedChange={(checked) => setEnglishComprehensive(checked === true)}
                  />
                  <Label htmlFor="english-comprehensive">English with comprehensive</Label>
                </div>
              )}
              <Button
                className="w-full mt-2"
                disabled={!canStartCustom}
                onClick={() =>
                  onStart?.({
                    subjects: customSubjects,
                    time: customTime,
                    questions: customQuestions,
                    showTimer,
                    englishComprehensive,
                  })
                }
              >
                Start Test
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 