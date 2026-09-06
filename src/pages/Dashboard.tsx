import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/layout/Sidebar";
import ChatAgent from "@/components/ai/ChatAgent";
import RailwayMapView from "@/components/dashboard/RailwayMapView";
import BlockRequestForm from "@/components/dashboard/BlockRequestForm";
import AIRecommendations from "@/components/dashboard/AIRecommendations";
import SimulationView from "@/components/dashboard/SimulationView";
import ApprovalInbox from "@/components/dashboard/ApprovalInbox";
import AnalyticsDashboard from "@/components/dashboard/AnalyticsDashboard";
import AssetHealthView from "@/components/dashboard/AssetHealthView";
import LiveTrainsPanel from "@/components/dashboard/LiveTrainsPanel";
import {
  TrendingUp,
  Plus,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  ChevronRight,
  Bell,
  Train,
  Settings,
  LogOut,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const notifications = [
  { id: 1, type: "conflict", title: "Block Conflict Detected", message: "BLK-0851 conflicts with BLK-0849 on Delhi-Mathura corridor", time: "2 min ago", read: false },
  { id: 2, type: "approval", title: "Block Approved", message: "BLK-0847 approved by Sr. DOM for P-Way engineering work", time: "15 min ago", read: false },
  { id: 3, type: "alert", title: "Asset Health Warning", message: "Track KM 168 health score dropped to 62/100 — rail wear threshold", time: "32 min ago", read: false },
  { id: 4, type: "success", title: "Block Completed", message: "BLK-0843 completed — 98% work done in 2h45m (under estimate)", time: "1 hr ago", read: true },
  { id: 5, type: "info", title: "AI Recommendation Ready", message: "New optimization available for Faridabad-Mathura track renewal", time: "2 hr ago", read: true },
];

/* ===== KPI CARDS DATA ===== */
const kpiCards = [
  {
    label: "Active Blocks",
    value: "12",
    change: "+3 today",
    icon: Train,
    color: "bg-primary/15 text-primary",
  },
  {
    label: "Block Utilization",
    value: "87%",
    change: "+12% vs last week",
    icon: TrendingUp,
    color: "bg-chart-3/15 text-chart-3",
  },
  {
    label: "Pending Approvals",
    value: "5",
    change: "2 urgent",
    icon: Clock,
    color: "bg-chart-4/15 text-chart-4",
  },
  {
    label: "Conflicts Detected",
    value: "2",
    change: "Auto-resolving",
    icon: AlertTriangle,
    color: "bg-destructive/15 text-destructive",
  },
];

/* ===== UPCOMING BLOCKS ===== */
const upcomingBlocks = [
  { id: "BLK-2024-0847", section: "Delhi–Mathura (KM 120-145)", dept: "P-Way Engineering", time: "02:00–05:00", status: "approved", urgency: "high" },
  { id: "BLK-2024-0848", section: "Mathura–Agra (KM 145-178)", dept: "Signal & Telecom", time: "01:30–04:30", status: "approved", urgency: "medium" },
  { id: "BLK-2024-0849", section: "Agra Cantt (KM 178-182)", dept: "OHE/Electrical", time: "23:00–02:00", status: "pending", urgency: "high" },
  { id: "BLK-2024-0850", section: "Delhi–Ghaziabad (KM 0-25)", dept: "P-Way Engineering", time: "00:00–03:00", status: "pending", urgency: "low" },
  { id: "BLK-2024-0851", section: "Ghaziabad–Meerut (KM 25-55)", dept: "Signal & Telecom", time: "03:00–06:00", status: "conflict", urgency: "medium" },
];

/* ===== ALERTS ===== */
const alerts = [
  { type: "conflict", msg: "Block BLK-0851 conflicts with BLK-0849 — AI suggests combining into joint block", time: "2 min ago" },
  { type: "warning", msg: "Asset health score dropped below threshold: Track KM 168 (rail wear detected by TRC)", time: "15 min ago" },
  { type: "info", msg: "Block BLK-0847 approved by Sr. DOM. Field crew notified.", time: "32 min ago" },
  { type: "success", msg: "Block BLK-0843 completed — 98% work done in 2h45m (vs estimated 3h)", time: "1 hr ago" },
];

/* ===== CHART DATA ===== */
const utilizationData = [
  { month: "Jan", utilization: 62, target: 90 },
  { month: "Feb", utilization: 68, target: 90 },
  { month: "Mar", utilization: 74, target: 90 },
  { month: "Apr", utilization: 71, target: 90 },
  { month: "May", utilization: 78, target: 90 },
  { month: "Jun", utilization: 82, target: 90 },
  { month: "Jul", utilization: 85, target: 90 },
  { month: "Aug", utilization: 87, target: 90 },
];

const delayTrendData = [
  { month: "Jan", delay: 340, projected: 200 },
  { month: "Feb", delay: 310, projected: 190 },
  { month: "Mar", delay: 280, projected: 175 },
  { month: "Apr", delay: 260, projected: 160 },
  { month: "May", delay: 220, projected: 150 },
  { month: "Jun", delay: 190, projected: 140 },
  { month: "Jul", delay: 165, projected: 130 },
  { month: "Aug", delay: 145, projected: 120 },
];

const deptPieData = [
  { name: "P-Way", value: 45, color: "oklch(0.75 0.15 55)" },
  { name: "S&T", value: 25, color: "oklch(0.65 0.18 250)" },
  { name: "OHE", value: 20, color: "oklch(0.70 0.14 160)" },
  { name: "Safety", value: 10, color: "oklch(0.65 0.22 25)" },
];

/* ===== STATUS MAP ===== */
const statusColors: Record<string, string> = {
  approved: "bg-chart-3/15 text-chart-3 border-chart-3/30",
  pending: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  conflict: "bg-destructive/15 text-destructive border-destructive/30",
  "in-progress": "bg-primary/15 text-primary border-primary/30",
};

const urgencyColors: Record<string, string> = {
  high: "bg-destructive/20 text-destructive",
  medium: "bg-chart-4/20 text-chart-4",
  low: "bg-chart-3/20 text-chart-3",
};

export default function Dashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifs, setNotifs] = useState(notifications);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setShowUserMenu(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifs.filter(n => !n.read).length;
  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  const role = sessionStorage.getItem('railblock_role') || 'planner';
  const roleLabels: Record<string, string> = { admin: 'DRM / Admin', approver: 'Sr. DOM', planner: 'Section Engineer', field: 'Field Crew', viewer: 'Safety Officer' };

  const path = location.pathname;
  const isHome = path === "/dashboard";

  const renderContent = () => {
    switch (path) {
      case "/dashboard/live-trains":
        return <LiveTrainsPanel />;
      case "/dashboard/map":
        return <RailwayMapView />;
      case "/dashboard/new-block":
        return <BlockRequestForm />;
      case "/dashboard/recommendations":
        return <AIRecommendations />;
      case "/dashboard/simulation":
        return <SimulationView />;
      case "/dashboard/approvals":
        return <ApprovalInbox />;
      case "/dashboard/analytics":
        return <AnalyticsDashboard />;
      case "/dashboard/assets":
        return <AssetHealthView />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="sticky top-0 z-40 h-16 flex items-center justify-between px-6 border-b border-border/50 bg-background/80 backdrop-blur-lg">
          <div>
            <h1 className="text-lg font-bold">
              {isHome ? "Command Center Overview" : getPageTitle(path)}
            </h1>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
                className="relative w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/15 transition-colors"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-12 w-96 rounded-2xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs text-primary hover:underline">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-auto">
                    {notifs.map(n => (
                      <div
                        key={n.id}
                        className={`px-4 py-3 border-b border-border/20 hover:bg-primary/5 transition-colors cursor-pointer ${!n.read ? 'bg-primary/5' : ''}`}
                        onClick={() => setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            n.type === 'conflict' ? 'bg-red-500/15' :
                            n.type === 'approval' ? 'bg-amber-500/15' :
                            n.type === 'success' ? 'bg-green-500/15' :
                            n.type === 'alert' ? 'bg-orange-500/15' : 'bg-blue-500/15'
                          }`}>
                            {n.type === 'conflict' ? <AlertTriangle className="w-4 h-4 text-red-400" /> :
                             n.type === 'approval' ? <Clock className="w-4 h-4 text-amber-400" /> :
                             n.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-green-400" /> :
                             <Bell className="w-4 h-4 text-blue-400" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{n.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">{n.time}</p>
                          </div>
                          {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
                className="flex items-center gap-2 hover:bg-primary/10 rounded-xl px-2 py-1.5 transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                  {user?.name?.[0] || "U"}
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium">{user?.name || "User"}</div>
                  <div className="text-[10px] text-muted-foreground">{roleLabels[role] || role}</div>
                </div>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-12 w-56 rounded-2xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-border/30">
                    <p className="font-semibold text-sm">{user?.name || "Guest User"}</p>
                    <p className="text-xs text-muted-foreground">{roleLabels[role] || role}</p>
                  </div>
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:bg-primary/5 transition-colors">
                    <Settings className="w-4 h-4" /> Settings
                  </button>
                  <button
                    onClick={() => { signOut(); navigate('/'); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/5 transition-colors border-t border-border/30"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">{renderContent()}</div>
      </main>

      {/* AI Chat Agent */}
      <ChatAgent />
    </div>
  );
}

function getPageTitle(path: string) {
  const titles: Record<string, string> = {
    "/dashboard/live-trains": "Live Trains — Indian Railways",
    "/dashboard/map": "GIS Map View",
    "/dashboard/new-block": "New Block Request",
    "/dashboard/recommendations": "AI Recommendations",
    "/dashboard/simulation": "Simulation & What-If",
    "/dashboard/approvals": "Approval Workflow",
    "/dashboard/analytics": "Analytics & Reports",
    "/dashboard/assets": "Asset Health Registry",
  };
  return titles[path] || "Command Center";
}

/* ===== DASHBOARD HOME COMPONENT ===== */
function DashboardHome() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, i) => (
          <div
            key={i}
            className="rounded-2xl p-5 border border-border/50 bg-card hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:scale-[1.01]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi.color}`}>
                <kpi.icon className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="text-3xl font-bold mb-1">{kpi.value}</div>
            <div className="text-sm text-muted-foreground">{kpi.label}</div>
            <div className="text-xs text-chart-3 mt-1 font-medium">{kpi.change}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Block Utilization Trend */}
        <div className="lg:col-span-2 rounded-2xl p-6 border border-border/50 bg-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-lg">Block Utilization Trend</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Monthly utilization rate vs target</p>
            </div>
            <button
              onClick={() => navigate("/dashboard/analytics")}
              className="text-xs text-primary flex items-center gap-1 hover:underline"
            >
              View full analytics <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={utilizationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.03 250)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "oklch(0.6 0 0)" }} />
              <YAxis tick={{ fontSize: 12, fill: "oklch(0.6 0 0)" }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  background: "oklch(0.18 0.03 250)",
                  border: "1px solid oklch(0.30 0.03 250)",
                  borderRadius: "12px",
                  color: "oklch(0.92 0 0)",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="utilization" fill="oklch(0.75 0.15 55)" radius={[6, 6, 0, 0]} name="Utilization %" />
              <Bar dataKey="target" fill="oklch(0.25 0.03 250)" radius={[6, 6, 0, 0]} name="Target %" opacity={0.4} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Department Distribution */}
        <div className="rounded-2xl p-6 border border-border/50 bg-card">
          <h3 className="font-semibold text-lg mb-1">Blocks by Department</h3>
          <p className="text-xs text-muted-foreground mb-4">Active & planned blocks</p>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={deptPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {deptPieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.18 0.03 250)",
                    border: "1px solid oklch(0.30 0.03 250)",
                    borderRadius: "12px",
                    color: "oklch(0.92 0 0)",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {deptPieData.map((d, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                <span className="text-muted-foreground">{d.name}</span>
                <span className="font-semibold ml-auto">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Delay Trend + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Delay Trend */}
        <div className="rounded-2xl p-6 border border-border/50 bg-card">
          <h3 className="font-semibold text-lg mb-1">Delay Reduction Trend</h3>
          <p className="text-xs text-muted-foreground mb-4">Actual vs AI-projected detention minutes</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={delayTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.03 250)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "oklch(0.6 0 0)" }} />
              <YAxis tick={{ fontSize: 11, fill: "oklch(0.6 0 0)" }} />
              <Tooltip
                contentStyle={{
                  background: "oklch(0.18 0.03 250)",
                  border: "1px solid oklch(0.30 0.03 250)",
                  borderRadius: "12px",
                  color: "oklch(0.92 0 0)",
                  fontSize: 12,
                }}
              />
              <Line type="monotone" dataKey="delay" stroke="oklch(0.65 0.22 25)" strokeWidth={2} dot={false} name="Actual Delay (min)" />
              <Line type="monotone" dataKey="projected" stroke="oklch(0.65 0.18 250)" strokeWidth={2} dot={false} strokeDasharray="5 5" name="AI Projected" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Alerts Feed */}
        <div className="lg:col-span-2 rounded-2xl p-6 border border-border/50 bg-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Live Alerts</h3>
            <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-xs font-semibold animate-pulse">
              Live
            </span>
          </div>
          <div className="space-y-3">
            {alerts.map((alert, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 hover:bg-primary/5 ${
                  alert.type === "conflict"
                    ? "border-destructive/30 bg-destructive/5"
                    : alert.type === "warning"
                    ? "border-chart-4/30 bg-chart-4/5"
                    : alert.type === "success"
                    ? "border-chart-3/30 bg-chart-3/5"
                    : "border-border/30"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    alert.type === "conflict"
                      ? "bg-destructive/15"
                      : alert.type === "warning"
                      ? "bg-chart-4/15"
                      : alert.type === "success"
                      ? "bg-chart-3/15"
                      : "bg-primary/15"
                  }`}
                >
                  {alert.type === "conflict" || alert.type === "warning" ? (
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                  ) : alert.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-chart-3" />
                  ) : (
                    <Clock className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-relaxed">{alert.msg}</p>
                  <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Blocks Table */}
      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/30">
          <div>
            <h3 className="font-semibold text-lg">Upcoming Blocks — Delhi Division</h3>
            <p className="text-xs text-muted-foreground">Next 24 hours</p>
          </div>
          <button
            onClick={() => navigate("/dashboard/map")}
            className="text-xs text-primary flex items-center gap-1 hover:underline"
          >
            View on map <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3">Block ID</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3">Section</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3">Department</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3">Window</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3">Urgency</th>
              </tr>
            </thead>
            <tbody>
              {upcomingBlocks.map((block, i) => (
                <tr key={i} className="border-b border-border/20 hover:bg-primary/5 transition-colors cursor-pointer">
                  <td className="px-6 py-3 text-sm font-mono font-medium">{block.id}</td>
                  <td className="px-6 py-3 text-sm">{block.section}</td>
                  <td className="px-6 py-3 text-sm text-muted-foreground">{block.dept}</td>
                  <td className="px-6 py-3 text-sm font-mono">{block.time}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColors[block.status]}`}>
                      {block.status}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${urgencyColors[block.urgency]}`}>
                      {block.urgency}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
