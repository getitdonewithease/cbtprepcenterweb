import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Progress } from "../../../components/ui/progress";
import { Textarea } from "../../../components/ui/textarea";
import {
  Brain,
  ArrowLeft,
  ArrowRight,
  User,
  Mail,
  Lock,
  Phone,
  GraduationCap,
  BookOpen,
  Target,
  Clock,
  AlertCircle,
} from "lucide-react";
import { SignUpData } from "../types/authTypes";
import { authService } from "../services/authService";

const NIGERIAN_UNIVERSITIES = [
  "University of Lagos (UNILAG)",
  "University of Ibadan (UI)",
  "Obafemi Awolowo University (OAU)",
  "University of Nigeria, Nsukka (UNN)",
  "Ahmadu Bello University (ABU)",
  "University of Benin (UNIBEN)",
  "Federal University of Technology, Akure (FUTA)",
  "Covenant University",
  "Babcock University",
  "Redeemer's University",
  "Other",
];

const POPULAR_COURSES = [
  "Medicine and Surgery",
  "Law",
  "Engineering (Computer)",
  "Engineering (Electrical)",
  "Engineering (Mechanical)",
  "Engineering (Civil)",
  "Pharmacy",
  "Accounting",
  "Economics",
  "Business Administration",
  "Computer Science",
  "Mass Communication",
  "Psychology",
  "Architecture",
  "Nursing",
  "Other",
];

const UTME_SUBJECTS = [
  "Mathematics",
  "English Language",
  "Physics",
  "Chemistry",
  "Biology",
  "Geography",
  "Economics",
  "Government",
  "Literature in English",
  "History",
  "Christian Religious Studies",
  "Islamic Religious Studies",
  "Commerce",
  "Agricultural Science",
];

const STUDY_TIMES = [
  "Early Morning (5AM - 8AM)",
  "Morning (8AM - 12PM)",
  "Afternoon (12PM - 4PM)",
  "Evening (4PM - 8PM)",
  "Night (8PM - 12AM)",
  "Late Night (12AM - 5AM)",
];

export function SignUpForm() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<SignUpData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
    department: "",
    courses: [],
    universityOfChoice: "",
    courseOfChoice: "",
    numberOfUTMEWritten: 0,
    targetScore: 250,
    studyHoursPerDay: 4,
    preferredStudyTime: "",
    weakSubjects: [],
  });

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const updateFormData = (field: keyof SignUpData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");

    try {
      await authService.handleSignUp(formData);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.firstName &&
          formData.lastName &&
          formData.email &&
          formData.password &&
          formData.phoneNumber
        );
      case 2:
        return formData.universityOfChoice && formData.courseOfChoice;
      case 3:
        return formData.numberOfUTMEWritten >= 0;
      case 4:
        return (
          formData.targetScore > 0 &&
          formData.studyHoursPerDay > 0 &&
          formData.preferredStudyTime
        );
      case 5:
        return formData.courses.length > 0;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <User className="h-12 w-12 text-primary mx-auto mb-2" />
              <h2 className="text-2xl font-bold">Personal Information</h2>
              <p className="text-muted-foreground">
                Let's start with your basic details
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => updateFormData("firstName", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => updateFormData("lastName", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@example.com"
                  className="pl-10"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={formData.password}
                  onChange={(e) => updateFormData("password", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="08012345678"
                  className="pl-10"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    updateFormData("phoneNumber", e.target.value)
                  }
                  required
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <GraduationCap className="h-12 w-12 text-primary mx-auto mb-2" />
              <h2 className="text-2xl font-bold">Academic Goals</h2>
              <p className="text-muted-foreground">
                Tell us about your university and course preferences
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="university">University of Choice</Label>
              <Select
                value={formData.universityOfChoice}
                onValueChange={(value) =>
                  updateFormData("universityOfChoice", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your preferred university" />
                </SelectTrigger>
                <SelectContent>
                  {NIGERIAN_UNIVERSITIES.map((university) => (
                    <SelectItem key={university} value={university}>
                      {university}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="course">Course of Choice</Label>
              <Select
                value={formData.courseOfChoice}
                onValueChange={(value) =>
                  updateFormData("courseOfChoice", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your preferred course" />
                </SelectTrigger>
                <SelectContent>
                  {POPULAR_COURSES.map((course) => (
                    <SelectItem key={course} value={course}>
                      {course}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department/Field of Study</Label>
              <Input
                id="department"
                placeholder="e.g., Sciences, Arts, Commercial"
                value={formData.department}
                onChange={(e) => updateFormData("department", e.target.value)}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <BookOpen className="h-12 w-12 text-primary mx-auto mb-2" />
              <h2 className="text-2xl font-bold">UTME Experience</h2>
              <p className="text-muted-foreground">
                Help us understand your UTME journey
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="utmeCount">
                How many times have you written UTME?
              </Label>
              <Select
                value={formData.numberOfUTMEWritten.toString()}
                onValueChange={(value) =>
                  updateFormData("numberOfUTMEWritten", parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select number of attempts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">This will be my first time</SelectItem>
                  <SelectItem value="1">Once</SelectItem>
                  <SelectItem value="2">Twice</SelectItem>
                  <SelectItem value="3">Three times</SelectItem>
                  <SelectItem value="4">Four times or more</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.numberOfUTMEWritten > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Previous Experience
                </h3>
                <p className="text-blue-700 text-sm">
                  Great! Your previous experience will help us tailor better
                  practice sessions for you.
                </p>
              </div>
            )}

            {formData.numberOfUTMEWritten === 0 && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">
                  First Timer
                </h3>
                <p className="text-green-700 text-sm">
                  Welcome! We'll make sure you're well-prepared for your first
                  UTME experience.
                </p>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Target className="h-12 w-12 text-primary mx-auto mb-2" />
              <h2 className="text-2xl font-bold">Study Preferences</h2>
              <p className="text-muted-foreground">
                Let's personalize your study plan
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetScore">
                Target UTME Score (out of 400)
              </Label>
              <Input
                id="targetScore"
                type="number"
                min="100"
                max="400"
                placeholder="250"
                value={formData.targetScore}
                onChange={(e) =>
                  updateFormData("targetScore", parseInt(e.target.value) || 0)
                }
              />
              <p className="text-xs text-muted-foreground">
                Most competitive courses require 250+ points
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="studyHours">
                How many hours can you study per day?
              </Label>
              <Select
                value={formData.studyHoursPerDay.toString()}
                onValueChange={(value) =>
                  updateFormData("studyHoursPerDay", parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select study hours" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 hour</SelectItem>
                  <SelectItem value="2">2 hours</SelectItem>
                  <SelectItem value="3">3 hours</SelectItem>
                  <SelectItem value="4">4 hours</SelectItem>
                  <SelectItem value="5">5 hours</SelectItem>
                  <SelectItem value="6">6+ hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="studyTime">Preferred Study Time</Label>
              <Select
                value={formData.preferredStudyTime}
                onValueChange={(value) =>
                  updateFormData("preferredStudyTime", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="When do you study best?" />
                </SelectTrigger>
                <SelectContent>
                  {STUDY_TIMES.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Clock className="h-12 w-12 text-primary mx-auto mb-2" />
              <h2 className="text-2xl font-bold">Subject Selection</h2>
              <p className="text-muted-foreground">
                Choose your UTME subjects and areas for improvement
              </p>
            </div>

            <div className="space-y-2">
              <Label>Select your 4 UTME subjects</Label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {UTME_SUBJECTS.map((subject) => (
                  <label
                    key={subject}
                    className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={formData.courses.includes(subject)}
                      onChange={(e) => {
                        if (e.target.checked && formData.courses.length < 4) {
                          updateFormData("courses", [
                            ...formData.courses,
                            subject,
                          ]);
                        } else if (!e.target.checked) {
                          updateFormData(
                            "courses",
                            formData.courses.filter((c) => c !== subject),
                          );
                        }
                      }}
                      disabled={
                        !formData.courses.includes(subject) &&
                        formData.courses.length >= 4
                      }
                    />
                    <span className="text-sm">{subject}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Selected: {formData.courses.length}/4 subjects
              </p>
            </div>

            <div className="space-y-2">
              <Label>
                Which subjects do you find most challenging? (Optional)
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {formData.courses.map((subject) => (
                  <label
                    key={subject}
                    className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={formData.weakSubjects.includes(subject)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateFormData("weakSubjects", [
                            ...formData.weakSubjects,
                            subject,
                          ]);
                        } else {
                          updateFormData(
                            "weakSubjects",
                            formData.weakSubjects.filter((s) => s !== subject),
                          );
                        }
                      }}
                    />
                    <span className="text-sm">{subject}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Brain className="h-12 w-12 text-primary" />
          </div>
          <h1 className="mt-4 text-3xl font-bold">Join UTME Prep</h1>
          <p className="mt-2 text-muted-foreground">
            Create your account and start your journey to UTME success
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Step {currentStep} of {totalSteps}
            </span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        <Card className="bg-white">
          <CardContent className="p-6">
            {error && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-center gap-2 mb-4">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {renderStep()}

            <div className="flex justify-between mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>

              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  className="flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!isStepValid() || isLoading}
                  className="flex items-center gap-2"
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/signin" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
