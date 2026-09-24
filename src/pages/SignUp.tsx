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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { classifyAuthError } from "@/lib/auth-errors";
import { runWithRetry } from "@/lib/mutation-retry";
import { ArrowRight, Loader2, Mail, Lock, User, Train, Shield, Eye, EyeOff } from "lucide-react";
import { Suspense, lazy, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

const GlobeScene = lazy(() => import("@/components/three/GlobeScene"));

const railwayRoles = [
  { id: "admin", label: "DRM / Admin" },
  { id: "approver", label: "Sr. DOM / Approver" },
  { id: "planner", label: "Section Engineer / Planner" },
  { id: "field", label: "Field Crew" },
  { id: "viewer", label: "Safety Officer / Viewer" },
];

const railwayZones = [
  "NR", "NCR", "NER", "NFR", "ER", "ECR", "SCR", "SR", "SWR", "SECR", "WCR", "CR", "WR", "NWR",
];

const railwayDepartments = [
  "P-Way Engineering",
  "Signal & Telecom",
  "OHE / Electrical",
  "Operating",
  "Safety",
  "Maintenance Planning",
  "Traffic Control",
  "Accounts",
];

const railwayDivisions = [
  "Delhi", "Mumbai", "Chennai", "Kolkata", "Bengaluru", "Hyderabad",
  "Lucknow", "Jaipur", "Ahmedabad", "Pune", "Nagpur", "Bhopal",
  "Patna", "Guwahati", "Bhubaneswar", "Secunderabad",
];

function SignUp() {
  const navigate = useNavigate();
  const signUpMutation = useMutation(api.security.signUp);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("planner");
  const [department, setDepartment] = useState("");
  const [division, setDivision] = useState("");
  const [zone, setZone] = useState("NR");

  // Password strength indicator
  const getPasswordStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[!@#$%^&*]/.test(pw)) score++;
    return score;
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong", "Very Strong", "Excellent"];
  const strengthColors = ["", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-lime-500", "bg-green-500", "bg-emerald-500"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (passwordStrength < 3) {
      setError("Password is too weak. Use uppercase, lowercase, numbers, and special characters.");
      return;
    }

    setIsLoading(true);
    setRetrying(false);
    try {
      // Auto-retry transient backend/network failures — same policy as login.
      await runWithRetry(
        () =>
          signUpMutation({
            email: email.toLowerCase().trim(),
            password,
            name: name.trim(),
            role: role as "admin" | "approver" | "planner" | "field" | "viewer",
            department: department || undefined,
            division: division || undefined,
            zone: zone || undefined,
            ip: undefined,
            userAgent: navigator.userAgent,
          }),
        {
          shouldRetry: (err) => classifyAuthError(err).retryable,
          onRetry: () => setRetrying(true),
          maxAttempts: 3,
        },
      );
      setRetrying(false);

      toast.success("Account created successfully!", {
        description: "You can now sign in with your credentials.",
      });

      navigate("/login");
    } catch (err) {
      setRetrying(false);
      setError(classifyAuthError(err).message);
    } finally {
      setIsLoading(false);
    }
  };

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
            { icon: Train, text: "AI-optimized block planning across 17 zones", color: "#85a6e9" },
            { icon: Lock, text: "Encrypted sessions & role-based access control", color: "#305fbd" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-sm" style={{ fontFamily: 'var(--font-inter)', color: '#abaebb' }}>
              <item.icon className="w-4 h-4 shrink-0" style={{ color: item.color }} />
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sign Up Card */}
      <Card className="min-w-[420px] max-w-[520px] relative z-10" style={{ background: 'rgba(13,23,43,0.88)', border: '1px solid #24375a', backdropFilter: 'blur(24px)', boxShadow: 'rgba(0,0,0,0.5) 0px 4px 30px 0px' }}>
        <CardHeader className="text-center pt-8">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(40,98,215,0.15)', border: '1px solid rgba(40,98,215,0.3)' }}>
              <User className="w-8 h-8" style={{ color: '#2862d7' }} />
            </div>
          </div>
          <CardTitle className="text-xl font-bold" style={{ fontFamily: 'var(--font-figtree)', color: '#ffffff' }}>Create Account</CardTitle>
          <CardDescription style={{ fontFamily: 'var(--font-inter)', color: '#abaebb' }}>
            Register for the Block Planning Command Center
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="px-8 space-y-4" style={{ fontFamily: 'var(--font-inter)' }}>
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: '#abaebb' }}>Full Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4" style={{ color: '#3c3f44' }} />
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rajesh Kumar"
                  className="pl-9 h-11"
                  style={{ background: 'rgba(14,17,27,0.8)', border: '1px solid #172540', color: '#ffffff' }}
                  required
                  disabled={isLoading}
                  autoFocus
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: '#abaebb' }}>Email Address *</label>
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
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: '#abaebb' }}>Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4" style={{ color: '#3c3f44' }} />
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 8 chars, upper, lower, number, special"
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
              {/* Password strength bar */}
              {password.length > 0 && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: '#172540' }}>
                    <div
                      className={`h-full rounded-full transition-all ${strengthColors[passwordStrength]}`}
                      style={{ width: `${(passwordStrength / 6) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-medium" style={{ color: passwordStrength >= 4 ? '#22C55E' : passwordStrength >= 3 ? '#F59E0B' : '#EF4444' }}>
                    {strengthLabels[passwordStrength]}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: '#abaebb' }}>Confirm Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4" style={{ color: '#3c3f44' }} />
                <Input
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter your password"
                  className="pl-9 pr-10 h-11"
                  style={{ background: 'rgba(14,17,27,0.8)', border: '1px solid #172540', color: '#ffffff' }}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-2.5"
                  style={{ color: '#3c3f44' }}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-[10px]" style={{ color: '#EF4444' }}>Passwords do not match</p>
              )}
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: '#abaebb' }}>Role *</label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="h-11" style={{ background: 'rgba(14,17,27,0.8)', border: '1px solid #172540', color: '#ffffff' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ background: '#0d172b', border: '1px solid #172540' }}>
                  {railwayRoles.map(r => (
                    <SelectItem key={r.id} value={r.id} style={{ color: '#c7c9d1' }}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Zone + Department (2 columns) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: '#abaebb' }}>Zone</label>
                <Select value={zone} onValueChange={setZone}>
                  <SelectTrigger className="h-10" style={{ background: 'rgba(14,17,27,0.8)', border: '1px solid #172540', color: '#ffffff' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent style={{ background: '#0d172b', border: '1px solid #172540' }}>
                    {railwayZones.map(z => (
                      <SelectItem key={z} value={z} style={{ color: '#c7c9d1' }}>{z}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: '#abaebb' }}>Department</label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger className="h-10" style={{ background: 'rgba(14,17,27,0.8)', border: '1px solid #172540', color: '#ffffff' }}>
                    <SelectValue placeholder="Optional" />
                  </SelectTrigger>
                  <SelectContent style={{ background: '#0d172b', border: '1px solid #172540' }}>
                    {railwayDepartments.map(d => (
                      <SelectItem key={d} value={d} style={{ color: '#c7c9d1' }}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Division */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: '#abaebb' }}>Division</label>
              <Select value={division} onValueChange={setDivision}>
                <SelectTrigger className="h-10" style={{ background: 'rgba(14,17,27,0.8)', border: '1px solid #172540', color: '#ffffff' }}>
                  <SelectValue placeholder="Optional" />
                </SelectTrigger>
                <SelectContent style={{ background: '#0d172b', border: '1px solid #172540' }}>
                  {railwayDivisions.map(d => (
                    <SelectItem key={d} value={d} style={{ color: '#c7c9d1' }}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Retry indicator */}
            {retrying && (
              <div className="flex items-center justify-center gap-2 text-xs" style={{ color: '#85a6e9' }}>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Reconnecting to the railway backend…
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444' }}>
                {error}
              </div>
            )}
          </CardContent>

          <CardFooter className="flex-col gap-3 px-8 pb-8" style={{ fontFamily: 'var(--font-inter)' }}>
            <Button
              type="submit"
              className="w-full h-11 rounded-full font-medium"
              style={{ background: '#ffffff', color: '#050606', fontFamily: 'var(--font-inter)' }}
              disabled={isLoading || !name || !email || !password || !confirmPassword || password !== confirmPassword}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <p className="text-sm text-center" style={{ color: '#abaebb' }}>
              Already have an account?{" "}
              <Link to="/login" className="font-medium hover:underline" style={{ color: '#2862d7' }}>
                Sign in
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

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0b0c0e' }}>
        <Loader2 className="h-6 w-6 animate-spin" style={{ color: '#2862d7' }} />
      </div>
    }>
      <SignUp />
    </Suspense>
  );
}
