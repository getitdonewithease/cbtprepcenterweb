import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  ExternalLink,
  BookMarked,
  ArrowUpRight,
  BookText,
} from "lucide-react";

interface Resource {
  id: string;
  title: string;
  type: "textbook" | "online" | "video";
  link?: string;
  description: string;
}

interface Topic {
  id: string;
  name: string;
  subject: string;
  proficiency: number;
  resources: Resource[];
}

interface RecommendationPanelProps {
  topics?: Topic[];
  userName?: string;
}

const RecommendationPanel = ({
  topics = [
    {
      id: "1",
      name: "Quadratic Equations",
      subject: "Mathematics",
      proficiency: 35,
      resources: [
        {
          id: "1-1",
          title: "Essential Mathematics for JAMB",
          type: "textbook",
          description: "Chapter 4: Quadratic Equations and Functions",
        },
        {
          id: "1-2",
          title: "Khan Academy: Solving Quadratic Equations",
          type: "online",
          link: "https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations",
          description: "Free online course with practice problems",
        },
      ],
    },
    {
      id: "2",
      name: "Atomic Structure",
      subject: "Chemistry",
      proficiency: 42,
      resources: [
        {
          id: "2-1",
          title: "New School Chemistry for Senior Secondary Schools",
          type: "textbook",
          description: "Chapter 2: Atomic Structure and Bonding",
        },
        {
          id: "2-2",
          title: "Chemistry Tutorial Videos",
          type: "video",
          link: "https://www.youtube.com/playlist?list=chemistry-tutorials",
          description: "Video explanations of atomic structure concepts",
        },
      ],
    },
    {
      id: "3",
      name: "Mechanics",
      subject: "Physics",
      proficiency: 28,
      resources: [
        {
          id: "3-1",
          title: "Comprehensive Physics for JAMB",
          type: "textbook",
          description: "Unit 1: Mechanics and Properties of Matter",
        },
        {
          id: "3-2",
          title: "Physics Classroom",
          type: "online",
          link: "https://www.physicsclassroom.com/Physics-Tutorial/1-D-Kinematics",
          description: "Interactive tutorials on mechanics fundamentals",
        },
      ],
    },
    {
      id: "4",
      name: "Cell Biology",
      subject: "Biology",
      proficiency: 45,
      resources: [
        {
          id: "4-1",
          title: "Modern Biology for Senior Secondary Schools",
          type: "textbook",
          description: "Chapter 3: Cell Structure and Organization",
        },
        {
          id: "4-2",
          title: "Biology Online Resources",
          type: "online",
          link: "https://www.biologycorner.com/topics/cells/",
          description: "Comprehensive cell biology materials with diagrams",
        },
      ],
    },
  ],
  userName = "Student",
}: RecommendationPanelProps) => {
  // Group topics by subject
  const subjectGroups = topics.reduce(
    (acc, topic) => {
      if (!acc[topic.subject]) {
        acc[topic.subject] = [];
      }
      acc[topic.subject].push(topic);
      return acc;
    },
    {} as Record<string, Topic[]>,
  );

  const subjects = Object.keys(subjectGroups);

  return (
    <div className="w-full bg-white rounded-xl shadow-sm p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Study Recommendations
        </h2>
        <p className="text-gray-600">
          Based on your performance, we've identified these topics for
          improvement, {userName}.
        </p>
      </div>

      <Tabs defaultValue={subjects[0] || "all"} className="w-full">
        <TabsList className="mb-4">
          {subjects.map((subject) => (
            <TabsTrigger key={subject} value={subject}>
              {subject}
            </TabsTrigger>
          ))}
        </TabsList>

        {subjects.map((subject) => (
          <TabsContent key={subject} value={subject} className="space-y-4">
            {subjectGroups[subject].map((topic) => (
              <Card key={topic.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">{topic.name}</CardTitle>
                      <CardDescription>{topic.subject}</CardDescription>
                    </div>
                    <Badge
                      variant={
                        topic.proficiency < 40 ? "destructive" : "secondary"
                      }
                    >
                      {topic.proficiency}% Proficiency
                    </Badge>
                  </div>
                  <Progress value={topic.proficiency} className="h-2 mt-2" />
                </CardHeader>
                <CardContent>
                  <h4 className="text-sm font-medium mb-2">
                    Recommended Resources:
                  </h4>
                  <div className="space-y-3">
                    {topic.resources.map((resource) => (
                      <div
                        key={resource.id}
                        className="flex items-start gap-3 p-3 rounded-md bg-gray-50"
                      >
                        {resource.type === "textbook" && (
                          <BookText className="h-5 w-5 text-blue-600" />
                        )}
                        {resource.type === "online" && (
                          <ExternalLink className="h-5 w-5 text-green-600" />
                        )}
                        {resource.type === "video" && (
                          <BookMarked className="h-5 w-5 text-red-600" />
                        )}
                        <div className="flex-1">
                          <h5 className="font-medium text-sm">
                            {resource.title}
                          </h5>
                          <p className="text-xs text-gray-600">
                            {resource.description}
                          </p>
                        </div>
                        {resource.link && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2"
                            asChild
                          >
                            <a
                              href={resource.link}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ArrowUpRight className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>

      <Separator className="my-6" />

      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-medium">Need more help?</h3>
          <p className="text-xs text-gray-600">
            Our AI tutor can provide personalized explanations
          </p>
        </div>
        <Button className="gap-2">
          <BookOpen className="h-4 w-4" />
          Upgrade to Premium
        </Button>
      </div>
    </div>
  );
};

export default RecommendationPanel; 