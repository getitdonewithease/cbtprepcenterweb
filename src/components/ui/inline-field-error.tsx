import { AlertCircle } from "lucide-react";

interface InlineFieldErrorProps {
  message?: string | null;
  id?: string;
}

export function InlineFieldError({ message, id }: InlineFieldErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <p
      id={id}
      className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-destructive"
      role="alert"
    >
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      <span>{message}</span>
    </p>
  );
}
