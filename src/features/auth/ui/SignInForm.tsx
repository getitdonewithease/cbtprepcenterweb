import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import {
  Mail,
  Lock,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../../../components/ui/use-toast';
import { notify } from '@/core/notifications/notify';
import { GoogleLogin } from '@react-oauth/google';
import { CbtDemo } from '@/components/LandingPage/FeatureDemos';
import { SignUpData } from '../types/authTypes';

const orange = "hsl(var(--brand-orange))";

// ── Static data ───────────────────────────────────────────────────────────────

const NIGERIAN_UNIVERSITIES = [
  "University of Lagos (UNILAG)",
  "University of Ibadan (UI)",
  "Obafemi Awolowo University (OAU)",
  "Lagos State University (LASU)",
  "Ahmadu Bello University (ABU)",
  "University of Nigeria, Nsukka (UNN)",
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
  "Pharmacy",
  "Computer Science",
  "Engineering (Computer)",
  "Engineering (Electrical)",
  "Engineering (Mechanical)",
  "Engineering (Civil)",
  "Accounting",
  "Economics",
  "Business Administration",
  "Mass Communication",
  "Psychology",
  "Architecture",
  "Nursing",
  "Other",
];

const UTME_SUBJECTS = [
  { display: "English",                    value: "english"       },
  { display: "Mathematics",               value: "mathematics"   },
  { display: "Physics",                   value: "physics"       },
  { display: "Chemistry",                 value: "chemistry"     },
  { display: "Biology",                   value: "biology"       },
  { display: "Geography",                 value: "geography"     },
  { display: "Economics",                 value: "economics"     },
  { display: "Government",                value: "government"    },
  { display: "Literature in English",     value: "englishlit"    },
  { display: "History",                   value: "history"       },
  { display: "Christian Religious Studies", value: "crk"         },
  { display: "Islamic Religious Studies", value: "irk"           },
  { display: "Commerce",                  value: "commerce"      },
  { display: "Accounting",               value: "accounting"    },
  { display: "Civic Education",           value: "civiledu"      },
  { display: "Current Affairs",           value: "currentaffairs"},
  { display: "Insurance",                 value: "insurance"     },
];

const STUDY_HOURS = ['1', '2', '3', '4', '5', '6'];

const STEP_NAMES = ['Personal', 'Subjects', 'Target', 'Habit'];

const STEP_META = [
  { label: "Personal Info",    subtitle: "Create your Fasiti account"    },
  { label: "Your Subjects",    subtitle: "Choose exactly 4 UTME subjects" },
  { label: "Your Target",      subtitle: "Where are you aiming?"          },
  { label: "Your Study Habit", subtitle: "How do you like to study?"      },
];

// ── Component ─────────────────────────────────────────────────────────────────

interface AuthPageProps {
  defaultMode?: 'signin' | 'signup';
}

export function SignInForm({ defaultMode = 'signin' }: AuthPageProps) {
  // Mode
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(defaultMode);

  // Sign-in state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Sign-up state
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<SignUpData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    department: '',
    courses: [],
    universityOfChoice: '',
    courseOfChoice: '',
    numberOfUTMEWritten: 0,
    targetScore: 250,
    studyHoursPerDay: 4,
    preferredStudyTime: '',
    weakSubjects: [],
  });

  const { isLoading, error, signIn, signInWithGoogle, signUp, signUpWithGoogle, forgotPassword } = useAuth();
  const { toast } = useToast();

  // ── Helpers ───────────────────────────────────────────────────────────────

  const updateFormData = (
    field: keyof SignUpData,
    value: string | number | string[],
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const deriveFirstNameFromEmail = (emailValue: string): string => {
    const localPart = emailValue.split('@')[0]?.trim() ?? '';
    if (!localPart) return '';

    const alphabetic = localPart.replace(/[^a-zA-Z]/g, '');
    const baseName = alphabetic || localPart;

    return baseName.charAt(0).toUpperCase() + baseName.slice(1).toLowerCase();
  };

  const switchMode = (next: 'signin' | 'signup' | 'forgot') => {
    setMode(next);
    if (next === 'signup') setStep(1);
    if (next !== 'forgot') setForgotSent(false);
    if (next === 'forgot') setForgotEmail(email);
  };

  const isStepValid = (): boolean => {
    if (step === 1) {
      return Boolean(
        formData.email.trim() &&
        formData.password.length >= 8,
      );
    }
    if (step === 2) return formData.courses.length === 4;
    return true;
  };

  // ── Sign-in handlers ──────────────────────────────────────────────────────

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn({ email, password });
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const wasSubmitted = await forgotPassword(forgotEmail.trim());
    setForgotSent(wasSubmitted);
  };

  // ── Sign-up handlers ──────────────────────────────────────────────────────

  const goForward = () => { setDirection('forward'); setStep(s => s + 1); };
  const goBack    = () => { setDirection('backward'); setStep(s => s - 1); };

  const handleSubmit = async () => {
    const firstName = deriveFirstNameFromEmail(formData.email);
    const payload: SignUpData = {
      ...formData,
      firstName,
      lastName: '',
    };

    await signUp(payload, payload.password);
  };

  const toggleSubject = (value: string) => {
    const isSelected = formData.courses.includes(value);
    if (isSelected) {
      updateFormData('courses', formData.courses.filter(c => c !== value));
      updateFormData('weakSubjects', (formData.weakSubjects ?? []).filter(s => s !== value));
    } else if (formData.courses.length < 4) {
      updateFormData('courses', [...formData.courses, value]);
    }
  };

  const toggleWeakSubject = (value: string) => {
    const weak = formData.weakSubjects ?? [];
    updateFormData(
      'weakSubjects',
      weak.includes(value) ? weak.filter(s => s !== value) : [...weak, value],
    );
  };

  // ── Step renders ──────────────────────────────────────────────────────────

  const renderStep = () => {
    switch (step) {
      // ── Step 1: Personal Info ──────────────────────────────────────────
      case 1:
        return (
          <div className="space-y-4">
            {/* Google first — fastest path */}
            <div className="w-full">
              <GoogleLogin
                text="signup_with"
                onSuccess={async credentialResponse => {
                  if (credentialResponse.credential) {
                    await signUpWithGoogle(credentialResponse.credential, '', toast);
                  } else {
                    notify.error('No credential received from Google');
                  }
                }}
                onError={() => notify.error('Google sign-up failed. Please try again.')}
                width="100%"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or fill in below</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="su-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="su-email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  value={formData.email}
                  onChange={e => updateFormData('email', e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="su-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="su-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 8 characters"
                  className="pl-10 pr-10"
                  value={formData.password}
                  onChange={e => updateFormData('password', e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-2.5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword
                    ? <EyeOff className="h-4 w-4" />
                    : <Eye className="h-4 w-4" />
                  }
                </button>
              </div>
              {formData.password && formData.password.length < 8 && (
                <p className="text-xs text-muted-foreground">
                  {8 - formData.password.length} more character{8 - formData.password.length !== 1 ? 's' : ''} needed
                </p>
              )}
            </div>
          </div>
        );

      // ── Step 2: Subject selection ──────────────────────────────────────
      case 2:
        return (
          <div className="space-y-5">
            <div>
              <p className="mb-3 text-xs font-medium text-muted-foreground">
                {formData.courses.length === 0 && 'Tap a subject to select it'}
                {formData.courses.length > 0 && formData.courses.length < 4 && (
                  <span style={{ color: orange }}>
                    {formData.courses.length}/4 — {4 - formData.courses.length} more to go
                  </span>
                )}
                {formData.courses.length === 4 && (
                  <span style={{ color: orange }}>✓ All 4 subjects selected</span>
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                {UTME_SUBJECTS.map(subject => {
                  const selected = formData.courses.includes(subject.value);
                  const disabled = !selected && formData.courses.length >= 4;
                  return (
                    <button
                      key={subject.value}
                      type="button"
                      onClick={() => toggleSubject(subject.value)}
                      disabled={disabled}
                      className="rounded-full border px-3 py-1.5 text-sm transition-all disabled:opacity-40"
                      style={selected
                        ? { borderColor: orange, backgroundColor: "hsl(25 95% 53% / 0.12)", color: "hsl(var(--foreground))", fontWeight: 600 }
                        : { borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }
                      }
                    >
                      {subject.display}
                    </button>
                  );
                })}
              </div>
            </div>

            {formData.courses.length === 4 && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2 border-t pt-4"
              >
                <Label className="text-sm">
                  Which need more work?{' '}
                  <span className="font-normal text-muted-foreground">(optional)</span>
                </Label>
                <div className="flex flex-wrap gap-2">
                  {formData.courses.map(val => {
                    const subject = UTME_SUBJECTS.find(s => s.value === val);
                    const isWeak = (formData.weakSubjects ?? []).includes(val);
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => toggleWeakSubject(val)}
                        className="rounded-full border px-3 py-1.5 text-sm transition-all"
                        style={isWeak
                          ? { borderColor: orange, backgroundColor: "hsl(25 95% 53% / 0.12)", color: "hsl(var(--foreground))", fontWeight: 600 }
                          : { borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }
                        }
                      >
                        {subject?.display ?? val}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>
        );

      // ── Step 3: Academic goals ─────────────────────────────────────────
      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>University of choice</Label>
              <Select
                value={formData.universityOfChoice}
                onValueChange={v => updateFormData('universityOfChoice', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Which university are you targeting?" />
                </SelectTrigger>
                <SelectContent>
                  {NIGERIAN_UNIVERSITIES.map(u => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Course of choice</Label>
              <Select
                value={formData.courseOfChoice}
                onValueChange={v => updateFormData('courseOfChoice', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="What do you want to study?" />
                </SelectTrigger>
                <SelectContent>
                  {POPULAR_COURSES.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Times written UTME</Label>
              <Select
                value={String(formData.numberOfUTMEWritten)}
                onValueChange={v => updateFormData('numberOfUTMEWritten', parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="How many times have you sat UTME?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">This will be my first time</SelectItem>
                  <SelectItem value="1">Once</SelectItem>
                  <SelectItem value="2">Twice</SelectItem>
                  <SelectItem value="3">Three times</SelectItem>
                  <SelectItem value="4">Four or more</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div
              className="rounded-lg border px-4 py-3 text-sm text-muted-foreground"
              style={{ borderColor: "hsl(25 95% 53% / 0.35)", backgroundColor: "hsl(25 95% 53% / 0.06)" }}
            >
              {formData.numberOfUTMEWritten === 0
                ? "We'll make sure you're well prepared for your first attempt."
                : "Great — your previous experience helps us tailor better sessions."}
            </div>
          </div>
        );

      // ── Step 4: Study habit ────────────────────────────────────────────
      case 4:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="targetScore">Target UTME score</Label>
              <Input
                id="targetScore"
                type="number"
                min="100"
                max="400"
                placeholder="e.g. 280"
                value={formData.targetScore || ''}
                onChange={e => updateFormData('targetScore', parseInt(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">Out of 400 — most competitive courses require 250+</p>
            </div>

            <div className="space-y-2">
              <Label>Daily study hours</Label>
              <Select
                value={String(formData.studyHoursPerDay)}
                onValueChange={v => updateFormData('studyHoursPerDay', parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="How many hours can you commit per day?" />
                </SelectTrigger>
                <SelectContent>
                  {STUDY_HOURS.map(h => (
                    <SelectItem key={h} value={h}>
                      {h === '6' ? '6+ hours' : `${h} hour${h === '1' ? '' : 's'}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ── Step heading (dynamic for step 2) ────────────────────────────────────

  const stepHeading = () => {
    if (step === 2 && formData.email.trim()) {
      const derivedFirstName = deriveFirstNameFromEmail(formData.email);
      if (!derivedFirstName) return STEP_META[step - 1];

      return {
        label: `Hey ${derivedFirstName}, pick your subjects`,
        subtitle: 'Choose exactly 4 UTME subjects',
      };
    }
    return STEP_META[step - 1];
  };

  // ── Main render ───────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen grid md:grid-cols-2">

      {/* ── Left panel — desktop only ── */}
      <div className="relative hidden overflow-hidden border-r bg-background p-12 md:flex md:flex-col">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 20% 50%, hsl(25,95%,53%), transparent)",
            opacity: 0.18,
          }}
        />

        <div className="relative flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: orange }} />
          <span className="text-xl font-black tracking-tight">Fasiti</span>
        </div>

        <div className="relative flex flex-1 flex-col justify-center gap-5">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: orange }}>
              UTME Prep Platform
            </p>
            <CbtDemo />
          </div>
          <div
            className="inline-flex items-center self-start rounded-full border px-4 py-1.5 text-sm font-medium"
            style={{ borderColor: "hsl(25 95% 53% / 0.35)", color: orange }}
          >
            Trusted by 10,000+ UTME candidates
          </div>
        </div>

        <p className="relative text-xs text-muted-foreground">Study smart, Ace With Ease</p>
      </div>

      {/* ── Right panel ── */}
      <div className="flex flex-col justify-center overflow-y-auto px-8 py-12 md:px-16">

        {/* Mobile brand mark */}
        <div className="mb-10 flex items-center gap-1.5 md:hidden">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: orange }} />
          <span className="text-xl font-black tracking-tight">Fasiti</span>
        </div>

        <div className="mx-auto w-full max-w-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >

              {/* ════ Sign-in ════ */}
              {mode === 'signin' && (
                <>
                  <div className="mb-8">
                    <h1 className="text-2xl font-black">Welcome back</h1>
                    <p className="mt-1.5 text-sm text-muted-foreground">Sign in to continue</p>
                  </div>

                  {error && (
                    <div className="mb-6 flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-destructive">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <p className="text-sm">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleSignIn} method="POST" className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          name="email"
                          placeholder="you@example.com"
                          className="pl-10"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          required
                          autoComplete="username"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <button
                          type="button"
                          onClick={() => switchMode('forgot')}
                          className="text-sm underline-offset-4 transition-colors hover:underline"
                          style={{ color: orange }}
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="password"
                          type="password"
                          name="password"
                          placeholder="••••••••"
                          className="pl-10"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          required
                          autoComplete="current-password"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full text-white"
                      style={{ backgroundColor: orange }}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Signing in…' : 'Sign in'}
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                      </div>
                    </div>

                    <div className="w-full">
                      <GoogleLogin
                        onSuccess={async credentialResponse => {
                          if (credentialResponse.credential) {
                            await signInWithGoogle(credentialResponse.credential, '');
                          } else {
                            notify.error('Google sign-in failed. Please try again.');
                          }
                        }}
                        onError={() => notify.error('Google sign-in failed. Please try again.')}
                        width="100%"
                      />
                    </div>
                  </form>

                  <p className="mt-8 text-center text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('signup')}
                      className="font-medium underline-offset-4 transition-colors hover:underline"
                      style={{ color: orange }}
                    >
                      Sign up
                    </button>
                  </p>
                </>
              )}

              {/* ════ Sign-up ════ */}
              {mode === 'signup' && (
                <>
                  {/* Progress bar with step labels */}
                  <div className="mb-8">
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Step {step} of 4</span>
                    </div>
                    <div className="h-0.5 w-full rounded-full bg-border">
                      <div
                        className="h-0.5 rounded-full transition-all duration-300"
                        style={{ width: `${(step / 4) * 100}%`, backgroundColor: orange }}
                      />
                    </div>
                    <div className="mt-2 grid grid-cols-4 text-center">
                      {STEP_NAMES.map((name, i) => (
                        <span
                          key={name}
                          className="text-[10px] font-medium transition-colors duration-300"
                          style={{ color: i + 1 <= step ? orange : 'hsl(var(--muted-foreground))' }}
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Step heading */}
                  <div className="mb-6">
                    <h1 className="text-2xl font-black">{stepHeading().label}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">{stepHeading().subtitle}</p>
                  </div>

                  {/* Step content */}
                  <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                      key={step}
                      custom={direction}
                      variants={{
                        enter: (d: string) => ({ opacity: 0, x: d === 'forward' ? 24 : -24 }),
                        center: { opacity: 1, x: 0 },
                        exit:  (d: string) => ({ opacity: 0, x: d === 'forward' ? -24 : 24 }),
                      }}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.22 }}
                    >
                      {renderStep()}
                    </motion.div>
                  </AnimatePresence>

                  {/* Navigation */}
                  <div className="mt-8 flex items-center justify-between">
                    {step > 1 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={goBack}
                        disabled={isLoading}
                        className="flex items-center gap-1.5 pl-0 text-muted-foreground"
                      >
                        <ArrowLeft className="h-4 w-4" /> Back
                      </Button>
                    ) : (
                      <div />
                    )}

                    {step < 4 ? (
                      <Button
                        type="button"
                        onClick={goForward}
                        disabled={!isStepValid() || isLoading}
                        className="flex items-center gap-1.5 text-white"
                        style={{ backgroundColor: orange }}
                      >
                        Next <ArrowRight className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="flex items-center gap-1.5 text-white"
                        style={{ backgroundColor: orange }}
                      >
                        {isLoading ? 'Creating account…' : 'Create account'}{' '}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <p className="mt-6 text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('signin')}
                      className="font-medium underline-offset-4 transition-colors hover:underline"
                      style={{ color: orange }}
                    >
                      Sign in
                    </button>
                  </p>
                </>
              )}

              {/* ════ Forgot Password ════ */}
              {mode === 'forgot' && (
                <>
                  <div className="mb-8">
                    <h1 className="text-2xl font-black">Forgot password</h1>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      Enter your account email and we will send a reset link.
                    </p>
                  </div>

                  <form onSubmit={handleForgotPassword} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="forgot-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="forgot-email"
                          type="email"
                          placeholder="you@example.com"
                          className="pl-10"
                          value={forgotEmail}
                          onChange={e => setForgotEmail(e.target.value)}
                          required
                          autoComplete="email"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full text-white"
                      style={{ backgroundColor: orange }}
                      disabled={!forgotEmail.trim() || isLoading}
                    >
                      {isLoading ? 'Sending...' : 'Send reset link'}
                    </Button>

                    <button
                      type="button"
                      onClick={() => switchMode('signin')}
                      className="mx-auto flex items-center gap-1.5 text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to sign in
                    </button>
                  </form>
                </>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
