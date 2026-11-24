import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Mail, MailCheck } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { forgotPasswordSchema, type ForgotPasswordValues } from "../utils/authSchemas";
import {
  AuthErrorBanner,
  AuthField,
  PanelHeading,
  TextButton,
  primaryButtonClass,
  secondaryButtonClass,
} from "./authUi";

const RESEND_COOLDOWN_SECONDS = 60;

interface ForgotPasswordPanelProps {
  initialEmail?: string;
  onBackToSignIn: (email: string) => void;
}

const ForgotPasswordPanel = ({ initialEmail = "", onBackToSignIn }: ForgotPasswordPanelProps) => {
  const { isLoading, error, forgotPassword } = useAuth();
  const [sentTo, setSentTo] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: initialEmail },
  });

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [cooldown]);

  const send = async (email: string) => {
    const wasSent = await forgotPassword(email.trim());
    if (wasSent) {
      setSentTo(email.trim());
      setCooldown(RESEND_COOLDOWN_SECONDS);
    }
  };

  const onSubmit = handleSubmit((values) => send(values.email));

  // ── Sent: stay on screen until the user moves on (the toast alone was easy to miss) ──
  if (sentTo) {
    return (
      <div className="space-y-7">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-orange/10 text-brand-text">
          <MailCheck className="h-6 w-6" aria-hidden="true" />
        </div>
        <PanelHeading
          title="Check your email"
          subtitle={
            <>
              If there&apos;s a Fasiti account for <span className="font-semibold text-foreground">{sentTo}</span>,
              we&apos;ve sent a link to reset your password. It can take a few minutes to arrive.
            </>
          }
        />
        <ul className="space-y-2 rounded-2xl border bg-card p-5 text-sm text-muted-foreground shadow-soft">
          <li>Not in your inbox? Check your spam or promotions folder.</li>
          <li>Make sure the address above is the one you signed up with.</li>
        </ul>
        <AuthErrorBanner message={error} />
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            className={secondaryButtonClass}
            disabled={cooldown > 0 || isLoading}
            onClick={() => send(sentTo)}
          >
            {cooldown > 0 ? `Send again in ${cooldown}s` : isLoading ? "Sending…" : "Send again"}
          </button>
          <button type="button" className={secondaryButtonClass} onClick={() => setSentTo("")}>
            Use a different email
          </button>
        </div>
        <TextButton onClick={() => onBackToSignIn(sentTo)}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to sign in
        </TextButton>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <PanelHeading
        title="Reset your password"
        subtitle="Enter the email you signed up with and we'll send you a reset link."
      />

      <AuthErrorBanner message={error} />

      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <AuthField
          label="Email"
          icon={Mail}
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <button type="submit" className={primaryButtonClass} disabled={isLoading}>
          {isLoading ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <TextButton onClick={() => onBackToSignIn(getValues("email"))}>
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to sign in
      </TextButton>
    </div>
  );
};

export default ForgotPasswordPanel;
