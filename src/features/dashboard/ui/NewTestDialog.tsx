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
  const [customQuestions, setCustomQuestions] = useState<{ [subject: string]: number }>({});
  const [open, setOpen] = useState(false);

  // For standard: all fields are fixed
  const standardFields = {
    subjects: subjects,
    time: 120,
    questions: 180,
    showTimer: true,
  };

  // For customized: handle subject selection
  const handleSubjectToggle = (subject: string) => {
    setCustomSubjects((prev) => {
      if (prev.includes(subject)) {
        // Remove subject and its question count
        const updatedQuestions = { ...customQuestions };
        delete updatedQuestions[subject];
        setCustomQuestions(updatedQuestions);
        return prev.filter((s) => s !== subject);
      } else if (prev.length < 4) {
        setCustomQuestions({ ...customQuestions, [subject]: 40 });
        return [...prev, subject];
      }
      return prev;
    });
  };

  // For customized: allow changes
  const canStartCustom =
    customSubjects.length >= 1 &&
    customSubjects.every((sub) =>
      customQuestions[sub] && customQuestions[sub] >= 5 && customQuestions[sub] <= 180
    );

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
                    courses: standardFields.subjects
                      .map(s => s.toLowerCase())
                      .filter(s => s !== 'english'),
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
              {customSubjects.length > 0 && (
                <div className="space-y-2">
                  {customSubjects.map((sub) => (
                    <div key={sub} className="flex items-center gap-4">
                      <Label className="w-32">{sub}</Label>
                      <input
                        type="number"
                        min={5}
                        max={180}
                        step={1}
                        value={customQuestions[sub] || 40}
                        onChange={e => {
                          const value = Number(e.target.value);
                          setCustomQuestions((prev) => ({ ...prev, [sub]: value }));
                        }}
                        className="w-24 border rounded px-2 py-1"
                      />
                    </div>
                  ))}
                </div>
              )}
              <Button
                className="w-full mt-2"
                onClick={() => {
                  setOpen(false);
                  onStart?.({
                    courses: customSubjects.map(s => s.toLowerCase()),
                    questionsPerSubject: customSubjects.reduce((acc, sub) => {
                      acc[sub.toLowerCase()] = customQuestions[sub];
                      return acc;
                    }, {} as Record<string, number>),
                  });
                }}
                disabled={!canStartCustom}
              >
                Start Practice
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 