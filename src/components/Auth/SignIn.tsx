// This file is no longer in use. The SignIn feature has been refactored to features/auth/ui/SignInForm.tsx
// import { useState } from "react";
// import { Link } from "react-router-dom";
// import { Button } from "../ui/button";
// import { Input } from "../ui/input";
// import { Label } from "../ui/label";
// import { Brain, Mail, Lock, AlertCircle } from "lucide-react";
// import api from "../../lib/apiConfig";

// const SignIn = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleSignIn = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError("");
//     setIsLoading(true);

//     try {
//       const res = await api.post("/api/v1/token", { email, password });
//       const data = res.data;

//       if (!data.accessToken) {
//         throw new Error(data.message || "Failed to sign in");
//       }

//       // Store token in localStorage
//       localStorage.setItem("token", data.accessToken);

//       // Redirect to home page on success
//       window.location.href = "/dashboard";
//     } catch (err: any) {
//       setError(err.response?.data?.message || err.message || "Failed to sign in");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleGoogleSignIn = () => {
//     // Implement Google Sign-In logic here
//     console.log("Signing in with Google");
//   };

//   return (
//     <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
//       <div className="w-full max-w-md space-y-8">
//         <div className="text-center">
//           <div className="flex justify-center">
//             <Brain className="h-12 w-12 text-primary" />
//           </div>
//           <h1 className="mt-4 text-3xl font-bold">UTME Prep</h1>
//           <h2 className="mt-2 text-xl">Sign in to your account</h2>
//           <p className="mt-2 text-muted-foreground">
//             Enter your details to access your account
//           </p>
//         </div>

//         {error && (
//           <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-center gap-2">
//             <AlertCircle className="h-4 w-4" />
//             <p className="text-sm">{error}</p>
//           </div>
//         )}

//         <form onSubmit={handleSignIn} method="POST" className="mt-8 space-y-6">
//           <div className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="email">Email</Label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
//                 <Input
//                   id="email"
//                   type="email"
//                   name="email"
//                   placeholder="you@example.com"
//                   className="pl-10"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   required
//                   autoComplete="username"
//                 />
//               </div>
//             </div>

//             <div className="space-y-2">
//               <div className="flex items-center justify-between">
//                 <Label htmlFor="password">Password</Label>
//                 <Link
//                   to="/forgot-password"
//                   className="text-sm text-primary hover:underline"
//                 >
//                   Forgot password?
//                 </Link>
//               </div>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
//                 <Input
//                   id="password"
//                   type="password"
//                   name="password"
//                   placeholder="••••••••"
//                   className="pl-10"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   required
//                   autoComplete="current-password"
//                 />
//               </div>
//             </div>
//           </div>

//           <Button type="submit" className="w-full" disabled={isLoading}>
//             {isLoading ? "Signing in..." : "Sign in"}
//           </Button>

//           <div className="relative">
//             <div className="absolute inset-0 flex items-center">
//               <div className="w-full border-t border-border"></div>
//             </div>
//             <div className="relative flex justify-center text-xs uppercase">
//               <span className="bg-background px-2 text-muted-foreground">
//                 Or continue with
//               </span>
//             </div>
//           </div>

//           <Button
//             type="button"
//             variant="outline"
//             className="w-full flex items-center justify-center gap-2"
//             onClick={handleGoogleSignIn}
//           >
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               viewBox="0 0 24 24"
//               className="h-5 w-5"
//             >
//               <path
//                 d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
//                 fill="#4285F4"
//               />
//               <path
//                 d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
//                 fill="#34A853"
//               />
//               <path
//                 d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
//                 fill="#FBBC05"
//               />
//               <path
//                 d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
//                 fill="#EA4335"
//               />
//             </svg>
//             Sign in with Google
//           </Button>
//         </form>

//         <div className="text-center mt-4">
//           <p className="text-sm text-muted-foreground">
//             Don't have an account?{" "}
//             <Link to="/signup" className="text-primary hover:underline">
//               Sign up
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SignIn;
