import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { Lock, Mail } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { signInSchema, type SignInValues } from "../utils/authSchemas";
import {
  AuthErrorBanner,
  AuthField,
  OrDivider,
  PanelHeading,
  TextButton,
  primaryButtonClass,
} from "./authUi";

interface SignInPanelProps {
  initialEmail?: string;
  onCreateAccount: () => void;
  onForgotPassword: (email: string) => void;
}

const SignInPanel = ({ initialEmail = "", onCreateAccount, onForgotPassword }: SignInPanelProps) => {
  // Each panel owns its auth state, so an error never follows the user into another view
  const { isLoading, error, signIn, signInWithGoogle } = useAuth();
  const [googleError, setGoogleError] = useState("");

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: initialEmail, password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setGoogleError("");
    await signIn({ email: values.email.trim(), password: values.password });
  });

  return (
    <div className="space-y-7">
      <PanelHeading title="Welcome back" subtitle="Sign in to keep practising." />

      <AuthErrorBanner message={googleError || error} />

      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <AuthField
          label="Email"
          icon={Mail}
          type="email"
          autoComplete="username"
          inputMode="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <div className="space-y-2">
          <AuthField
            label="Password"
            icon={Lock}
            isPassword
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />
          <div className="flex justify-end">
            <TextButton className="text-sm" onClick={() => onForgotPassword(getValues("email"))}>
              Forgot password?
            </TextButton>
          </div>
        </div>

        <button type="submit" className={primaryButtonClass} disabled={isLoading}>
          {isLoading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <OrDivider label="or" />

      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            if (credentialResponse.credential) {
              setGoogleError("");
              await signInWithGoogle(credentialResponse.credential, "");
            } else {
              setGoogleError("Google sign-in didn't work. Try again, or sign in with your email and password.");
            }
          }}
          onError={() =>
            setGoogleError("Google sign-in didn't work. Try again, or sign in with your email and password.")
          }
          text="signin_with"
          shape="pill"
          width="320"
        />
      </div>

      <p className="text-center text-sm text-muted-foreground">
        New to Fasiti?{" "}
        <TextButton onClick={onCreateAccount}>Create a free account</TextButton>
      </p>
    </div>
  );
};

export default SignInPanel;
