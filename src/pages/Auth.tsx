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
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, Loader2, Mail, UserX, Train, Shield, ChevronRight } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

interface AuthProps {
  redirectAfterAuth?: string;
}

const railwayRoles = [
  {
    id: "admin",
    title: "Divisional Railway Manager",
    shortTitle: "DRM / Admin",
    description: "Full system access, override authority, KPI dashboards",
    icon: Shield,
    color: "bg-red-500/15 text-red-400 border-red-500/30",
    permissions: ["All modules", "System config", "Override approvals"],
  },
  {
    id: "approver",
    title: "Sr. DOM / Section Controller",
    shortTitle: "Approver",
    description: "Approve/reject blocks, manage conflicts, view traffic",
    icon: ChevronRight,
    color: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    permissions: ["Approve blocks", "Conflict resolution", "Traffic view"],
  },
  {
    id: "planner",
    title: "Section Engineer / P-Way",
    shortTitle: "Planner",
    description: "Create block requests, view AI recommendations, run simulations",
    icon: Train,
    color: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    permissions: ["Create blocks", "AI recommendations", "Simulations"],
  },
  {
    id: "field",
    title: "Field Crew / Gang Supervisor",
    shortTitle: "Field Crew",
    description: "Block start/end, GPS tracking, work completion checklists",
    icon: UserX,
    color: "bg-green-500/15 text-green-400 border-green-500/30",
    permissions: ["Block start/end", "GPS tracking", "Checklists"],
  },
  {
    id: "viewer",
    title: "Safety Officer / Auditor",
    shortTitle: "Viewer",
    description: "Read-only access, audit trails, compliance reports",
    icon: Shield,
    color: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    permissions: ["Read-only", "Audit trails", "Reports"],
  },
];

function resolveRedirectAfterAuth(
  returnTo: string | null,
  fallback = "/dashboard",
) {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return fallback;
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(
    searchParams.get("returnTo"),
    redirectAfterAuth,
  );
  const [step, setStep] = useState<"roleSelect" | "signIn" | { email: string }>("roleSelect");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirect);
    }
  }, [authLoading, isAuthenticated, navigate, redirect]);

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    setStep("signIn");
  };

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      // Store selected role in session for RBAC
      if (selectedRole) {
        sessionStorage.setItem("railblock_role", selectedRole);
      }
      await signIn("email-otp", formData);
      setStep({ email: formData.get("email") as string });
      setIsLoading(false);
    } catch (error) {
      console.error("Email sign-in error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to send verification code. Please try again.",
      );
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      navigate(redirect);
    } catch (error) {
      console.error("OTP verification error:", error);
      setError("The verification code you entered is incorrect.");
      setIsLoading(false);
      setOtp("");
    }
  };

  const handleGuestLogin = async (roleId?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      if (roleId) {
        sessionStorage.setItem("railblock_role", roleId);
      }
      await signIn("anonymous");
      navigate(redirect);
    } catch (error) {
      console.error("Guest login error:", error);
      setError(`Failed to sign in as guest: ${error instanceof Error ? error.message : "Unknown error"}`);
      setIsLoading(false);
    }
  };

  const selectedRoleData = railwayRoles.find(r => r.id === selectedRole);

  return (
    <div className="min-h-screen flex items-center justify-center rail-gradient relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0 animate-grid-scroll"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 39px, oklch(0.75 0.15 55 / 0.08) 39px, oklch(0.75 0.15 55 / 0.08) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, oklch(0.75 0.15 55 / 0.08) 39px, oklch(0.75 0.15 55 / 0.08) 40px)",
          }}
        />
      </div>

      {/* Floating orbs */}
      <div className="absolute top-[20%] left-[15%] w-64 h-64 rounded-full bg-primary/10 blur-[100px] animate-float" />
      <div className="absolute bottom-[20%] right-[15%] w-80 h-80 rounded-full bg-chart-4/8 blur-[120px] animate-float-delayed" />

      {/* Left side branding */}
      <div className="hidden lg:flex absolute left-16 top-1/2 -translate-y-1/2 flex-col gap-8 max-w-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Train className="w-7 h-7 text-primary" />
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">RailBlock AI</div>
            <div className="text-xs text-muted-foreground">Command Center</div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Shield className="w-4 h-4 text-primary shrink-0" />
            <span>Government-grade security & audit trails</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Train className="w-4 h-4 text-chart-3 shrink-0" />
            <span>AI-optimized block planning across 17 zones</span>
          </div>
        </div>
      </div>

      {/* Auth Card */}
      <Card className="min-w-[380px] max-w-[480px] border border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl relative z-10">
        {/* Step: Role Selection */}
        {step === "roleSelect" && (
          <>
            <CardHeader className="text-center pt-8">
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center animate-pulse-glow">
                  <Train className="w-8 h-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-xl font-bold">Welcome to RailBlock AI</CardTitle>
              <CardDescription className="text-muted-foreground">
                Select your role to sign in with appropriate permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="space-y-2">
                {railwayRoles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSelect(role.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all hover:bg-primary/5 active:scale-[0.98] text-left ${role.color}`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-background/30 flex items-center justify-center shrink-0">
                      <role.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm">{role.shortTitle}</div>
                      <div className="text-xs opacity-70 truncate">{role.description}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 opacity-50 shrink-0" />
                  </button>
                ))}
              </div>

              <div className="mt-4 relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-3 text-muted-foreground">Quick Access</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full mt-4 h-11 border-border/50 bg-background/30 hover:bg-background/50"
                onClick={() => handleGuestLogin("planner")}
                disabled={isLoading}
              >
                <UserX className="mr-2 h-4 w-4" />
                Guest Demo (Planner Role)
              </Button>
            </CardContent>
          </>
        )}

        {/* Step: Email Sign-in */}
        {step === "signIn" && (
          <>
            <CardHeader className="text-center pt-8">
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center animate-pulse-glow">
                  <Train className="w-8 h-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-xl font-bold">Sign In</CardTitle>
              <CardDescription className="text-muted-foreground">
                {selectedRoleData ? (
                  <>
                    Signing in as{" "}
                    <span className="font-medium text-foreground">{selectedRoleData.title}</span>
                  </>
                ) : (
                  "Sign in to access the Block Planning Command Center"
                )}
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleEmailSubmit}>
              <CardContent className="px-8">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      name="email"
                      placeholder="railway.gov.in email"
                      type="email"
                      className="pl-9 h-11 bg-background/50"
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    size="icon"
                    className="h-11 w-11 shrink-0 bg-primary hover:bg-primary/90"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowRight className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {error && (
                  <p className="mt-2 text-sm text-destructive">{error}</p>
                )}

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border/50" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-3 text-muted-foreground">Or</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-4 h-11 border-border/50 bg-background/30 hover:bg-background/50"
                    onClick={() => handleGuestLogin(selectedRole || "planner")}
                    disabled={isLoading}
                  >
                    <UserX className="mr-2 h-4 w-4" />
                    Continue as Guest ({selectedRoleData?.shortTitle || "Planner"})
                  </Button>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full mt-3 text-muted-foreground"
                  onClick={() => { setStep("roleSelect"); setSelectedRole(null); }}
                  disabled={isLoading}
                >
                  ← Choose different role
                </Button>
              </CardContent>
            </form>
          </>
        )}

        {/* Step: OTP Verification */}
        {typeof step === "object" && (
          <>
            <CardHeader className="text-center pt-8">
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-xl font-bold">Check your email</CardTitle>
              <CardDescription>
                We&apos;ve sent a verification code to{" "}
                <span className="font-medium text-foreground">{step.email}</span>
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleOtpSubmit}>
              <CardContent className="px-8 pb-4">
                <input type="hidden" name="email" value={step.email} />
                <input type="hidden" name="code" value={otp} />

                <div className="flex justify-center">
                  <InputOTP
                    value={otp}
                    onChange={setOtp}
                    maxLength={6}
                    disabled={isLoading}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && otp.length === 6 && !isLoading) {
                        const form = (e.target as HTMLElement).closest("form");
                        if (form) form.requestSubmit();
                      }
                    }}
                  >
                    <InputOTPGroup>
                      {Array.from({ length: 6 }).map((_, index) => (
                        <InputOTPSlot key={index} index={index} />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                {error && (
                  <p className="mt-3 text-sm text-destructive text-center">
                    {error}
                  </p>
                )}
                <p className="text-sm text-muted-foreground text-center mt-4">
                  Didn&apos;t receive a code?{" "}
                  <Button
                    variant="link"
                    className="p-0 h-auto text-primary"
                    onClick={() => setStep("signIn")}
                  >
                    Try again
                  </Button>
                </p>
              </CardContent>
              <CardFooter className="flex-col gap-2 px-8 pb-8">
                <Button
                  type="submit"
                  className="w-full h-11 bg-primary hover:bg-primary/90"
                  disabled={isLoading || otp.length !== 6}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify & Enter
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep("signIn")}
                  disabled={isLoading}
                  className="w-full text-muted-foreground"
                >
                  Use different email
                </Button>
              </CardFooter>
            </form>
          </>
        )}
      </Card>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}
