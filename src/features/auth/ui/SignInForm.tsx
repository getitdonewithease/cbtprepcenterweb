import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import ForgotPasswordPanel from "./ForgotPasswordPanel";
import SignInPanel from "./SignInPanel";
import SignUpWizard from "./SignUpWizard";

/**
 * Auth page for /signin, /signup and /forgot-password. Each view has its own URL, so
 * browser Back moves between them and a refresh keeps the user where they were.
 * The panels own their own state: errors never carry from one view into another.
 */

export type AuthMode = "signin" | "signup" | "forgot";

const PATHS: Record<AuthMode, string> = {
  signin: "/signin",
  signup: "/signup",
  forgot: "/forgot-password",
};

interface AuthPageProps {
  defaultMode?: AuthMode;
}

interface AuthLocationState {
  email?: string;
}

export function SignInForm({ defaultMode = "signin" }: AuthPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion() ?? false;
  const carriedEmail = (location.state as AuthLocationState | null)?.email ?? "";

  const goTo = (mode: AuthMode, email?: string) => {
    navigate(PATHS[mode], { state: email ? { email } : undefined });
  };

  return (
    <AuthLayout>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={defaultMode}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0, transition: { duration: 0.12 } }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          {defaultMode === "signin" && (
            <SignInPanel
              initialEmail={carriedEmail}
              onCreateAccount={() => goTo("signup")}
              onForgotPassword={(email) => goTo("forgot", email)}
            />
          )}
          {defaultMode === "signup" && <SignUpWizard onSignIn={() => goTo("signin")} />}
          {defaultMode === "forgot" && (
            <ForgotPasswordPanel
              initialEmail={carriedEmail}
              onBackToSignIn={(email) => goTo("signin", email)}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </AuthLayout>
  );
}
