import { CheckCircle2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useConfirmEmail } from "../hooks/useConfirmEmail";

export default function ConfirmEmailPage() {
  const { result } = useConfirmEmail();

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-4">
        {result.status === "loading" && (
          <Alert>
            <AlertTitle>Confirming email…</AlertTitle>
            <AlertDescription>Please wait while we verify your email.</AlertDescription>
          </Alert>
        )}

        {result.status === "success" && (
          <Alert>
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <AlertTitle>Email confirmed</AlertTitle>
            <AlertDescription>
              {result.message || "Your email has been confirmed successfully."}
            </AlertDescription>
          </Alert>
        )}

        {result.status === "error" && (
          <Alert variant="destructive">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle>Could not confirm email</AlertTitle>
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
