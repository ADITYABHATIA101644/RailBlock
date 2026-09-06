import { useNavigate, useLocation } from "react-router";
import {
  Train,
  LayoutDashboard,
  Map,
  Plus,
  GitBranch,
  Activity,
  Shield,
  BarChart3,
  Heart,
  Settings,
  ChevronLeft,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Map, label: "GIS Map View", path: "/dashboard/map" },
  { icon: Plus, label: "New Block Request", path: "/dashboard/new-block" },
  { icon: GitBranch, label: "AI Recommendations", path: "/dashboard/recommendations" },
  { icon: Activity, label: "Simulation", path: "/dashboard/simulation" },
  { icon: Shield, label: "Approvals", path: "/dashboard/approvals" },
  { icon: BarChart3, label: "Analytics", path: "/dashboard/analytics" },
  { icon: Heart, label: "Asset Health", path: "/dashboard/assets" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <aside
      className={`h-screen sticky top-0 flex flex-col transition-all duration-300 z-50 ${
        collapsed ? "w-[72px]" : "w-64"
      }`}
      style={{
        background: "linear-gradient(180deg, oklch(0.12 0.03 250) 0%, oklch(0.10 0.025 250) 100%)",
        borderRight: "1px solid oklch(0.22 0.03 250)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-border/30 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
          <Train className="w-5 h-5 text-primary" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="text-sm font-bold text-foreground whitespace-nowrap">RailBlock AI</div>
            <div className="text-[10px] text-muted-foreground whitespace-nowrap">Command Center</div>
          </div>
        )}
        <button
          onClick={onToggle}
          className="ml-auto w-7 h-7 rounded-lg flex items-center justify-center hover:bg-primary/10 transition-colors text-muted-foreground"
        >
          <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary/15 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
              }`}
            >
              <item.icon className={`w-5 h-5 shrink-0 ${isActive ? "text-primary" : ""}`} />
              {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Settings & Logout */}
      <div className="px-2 py-3 border-t border-border/30 space-y-1">
        <button
          onClick={() => navigate("/dashboard")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-all duration-200"
        >
          <Settings className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </button>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
