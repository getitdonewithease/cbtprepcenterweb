import React from "react";
import { Link } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserContext } from "../contexts/UserContext";

const REQUIRED_SUBJECTS = 4;

const getSubjectCount = (courses: unknown) => {
  if (!Array.isArray(courses)) {
    return 0;
  }
  return courses.filter(Boolean).length;
};

interface UserSubjectsWarningProps {
  className?: string;
}

const UserSubjectsWarning: React.FC<UserSubjectsWarningProps> = ({ className }) => {
  const { user, userLoading, userError } = useUserContext();

  if (userLoading || userError || !user) {
    return null;
  }

  const subjectCount = getSubjectCount(user.courses);
  if (subjectCount >= REQUIRED_SUBJECTS) {
    return null;
  }

  return (
    <Alert
      className={cn(
        "border-amber-300/70 bg-amber-50 text-amber-900",
        className,
      )}
    >
      <AlertTriangle className="h-4 w-4 text-amber-700" />
      <AlertTitle className="text-amber-900">Select your 4 subjects</AlertTitle>
      <AlertDescription className="text-amber-900">
        Your profile has {subjectCount} subject{subjectCount === 1 ? "" : "s"} selected.
        Please choose 4 subjects in your profile before starting a practice test.{" "}
        <Link to="/settings" className="font-medium underline">
          Update profile
        </Link>
        .
      </AlertDescription>
    </Alert>
  );
};

export default UserSubjectsWarning;
