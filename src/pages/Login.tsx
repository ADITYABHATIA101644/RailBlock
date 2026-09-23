import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ArrowRight, Loader2, Mail, Lock, Train, Shield, Eye, EyeOff } from "lucide-react";
import { Suspense, lazy, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";

const GlobeScene = lazy(() => import("@/components/three/GlobeScene"));

function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const loginMutation = useMutation(api.security.login);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await loginMutation({
        email: email.toLowerCase().trim(),
        password,
        ip: undefined,
        userAgent: navigator.userAgent,
      });

      // Store session
      localStorage.setItem("railblock_session_token", result.sessionToken);
      if (result.role) {
        sessionStorage.setItem("railblock_role", result.role);
      }

      toast.success("Welcome back!", {
        description: `Signed in as ${result.name || result.email}`,
      });

      // Send users back to where they came from (e.g. a dashboard sub-page)
      // or to the dashboard by default. Guard against open redirects.
      const destination =
        returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//")
          ? returnTo
          : "/dashboard";
      navigate(destination);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed";
      setError(msg);

      // Parse remaining attempts from error message
      const match = msg.match(/(\d+) attempt/);
      if (match) {
        setAttemptsRemaining(parseInt(match[1]));
      }

      if (msg.includes("locked")) {
        toast.error("Account Locked", {
          description: msg,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = email.includes("@") && password.length >= 1;

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0b0c0e 0%, #0e111b 50%, #0d172b 100%)' }}>
      {/* 3D globe backdrop */}
      <div className="absolute inset-0 opacity-60 pointer-events-none">
        <Suspense fallback={null}>
          <GlobeScene />
        </Suspense>
      </div>

      {/* Aurora glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(98,95,255,0.4) 0%, transparent 70%)' }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-15 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,125,218,0.35) 0%, transparent 70%)' }} />

      {/* Left branding */}
      <div className="hidden lg:flex absolute left-16 top-1/2 -translate-y-1/2 flex-col gap-8 max-w-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(40,98,215,0.15)', border: '1px solid rgba(40,98,215,0.3)' }}>
            <Train className="w-7 h-7" style={{ color: '#2862d7' }} />
          </div>
          <div>
            <div className="text-2xl font-bold" style={{ fontFamily: 'var(--font-figtree)', color: '#ffffff' }}>RailBlock AI</div>
            <div className="text-xs" style={{ fontFamily: 'var(--font-inter)', color: '#abaebb' }}>Command Center</div>
          </div>
        </div>
        <div className="space-y-4">
          {[
            { icon: Shield, text: "Government-grade security with audit trails", color: "#2862d7" },
            { icon: Lock, text: "PBKDF2 password hashing with 100K iterations", color: "#85a6e9" },
            { icon: Mail, text: "Rate limiting & account lockout protection", color: "#305fbd" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-sm" style={{ fontFamily: 'var(--font-inter)', color: '#abaebb' }}>
              <item.icon className="w-4 h-4 shrink-0" style={{ color: item.color }} />
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Login Card */}
      <Card className="min-w-[400px] max-w-[480px] relative z-10" style={{ background: 'rgba(13,23,43,0.88)', border: '1px solid #24375a', backdropFilter: 'blur(24px)', boxShadow: 'rgba(0,0,0,0.5) 0px 4px 30px 0px' }}>
        <CardHeader className="text-center pt-8">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(40,98,215,0.15)', border: '1px solid rgba(40,98,215,0.3)' }}>
              <Lock className="w-8 h-8" style={{ color: '#2862d7' }} />
            </div>
          </div>
          <CardTitle className="text-xl font-bold" style={{ fontFamily: 'var(--font-figtree)', color: '#ffffff' }}>Sign In</CardTitle>
          <CardDescription style={{ fontFamily: 'var(--font-inter)', color: '#abaebb' }}>
            Access the Block Planning Command Center
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="px-8 space-y-4" style={{ fontFamily: 'var(--font-inter)' }}>
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: '#abaebb' }}>Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4" style={{ color: '#3c3f44' }} />
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@railways.gov.in"
                  type="email"
                  className="pl-9 h-11"
                  style={{ background: 'rgba(14,17,27,0.8)', border: '1px solid #172540', color: '#ffffff' }}
                  required
                  disabled={isLoading}
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: '#abaebb' }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4" style={{ color: '#3c3f44' }} />
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="pl-9 pr-10 h-11"
                  style={{ background: 'rgba(14,17,27,0.8)', border: '1px solid #172540', color: '#ffffff' }}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5"
                  style={{ color: '#3c3f44' }}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Attempts warning */}
            {attemptsRemaining !== null && attemptsRemaining <= 3 && (
              <div className="p-2 rounded-lg text-xs" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#F59E0B' }}>
                {attemptsRemaining} attempt{attemptsRemaining !== 1 ? "s" : ""} remaining before account lockout
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444' }}>
                {error}
              </div>
            )}

            {/* Security info */}
            <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'rgba(40,98,215,0.05)', border: '1px solid rgba(40,98,215,0.1)' }}>
              <Shield className="w-3.5 h-3.5 shrink-0" style={{ color: '#2862d7' }} />
              <span className="text-[10px]" style={{ color: '#abaebb' }}>
                Sessions expire after 24 hours. Failed attempts are logged.
              </span>
            </div>
          </CardContent>

          <CardFooter className="flex-col gap-3 px-8 pb-8" style={{ fontFamily: 'var(--font-inter)' }}>
            <Button
              type="submit"
              className="w-full h-11 rounded-full font-medium"
              style={{ background: '#ffffff', color: '#050606', fontFamily: 'var(--font-inter)' }}
              disabled={isLoading || !isValid}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <p className="text-sm text-center" style={{ color: '#abaebb' }}>
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="font-medium hover:underline" style={{ color: '#2862d7' }}>
                Create account
              </Link>
            </p>

            <Link to="/" className="text-xs hover:underline" style={{ color: '#3c3f44' }}>
              ← Back to home
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0b0c0e' }}>
        <Loader2 className="h-6 w-6 animate-spin" style={{ color: '#2862d7' }} />
      </div>
    }>
      <Login />
    </Suspense>
  );
}
