import React, { useState } from 'react';
import { BarChart3, Download, Calendar, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Filter } from 'lucide-react';
import { toast } from 'sonner';

// Real Indian Railway Zones
const railwayZones = [
  { code: 'NR', name: 'Northern Railway', hq: 'New Delhi', stations: 892, health: 82, color: '#3B82F6' },
  { code: 'NCR', name: 'North Central', hq: 'Prayagraj', stations: 521, health: 78, color: '#10B981' },
  { code: 'NER', name: 'North Eastern', hq: 'Gorakhpur', stations: 345, health: 71, color: '#F59E0B' },
  { code: 'NFR', name: 'Northeast Frontier', hq: 'Guwahati', stations: 287, health: 68, color: '#EC4899' },
  { code: 'ER', name: 'Eastern Railway', hq: 'Kolkata', stations: 456, health: 75, color: '#8B5CF6' },
  { code: 'ECR', name: 'East Central', hq: 'Hajipur', stations: 312, health: 73, color: '#06B6D4' },
  { code: 'SCR', name: 'South Central', hq: 'Hyderabad', stations: 623, health: 80, color: '#EF4444' },
  { code: 'SR', name: 'Southern Railway', hq: 'Chennai', stations: 509, health: 85, color: '#F97316' },
  { code: 'SWR', name: 'South Western', hq: 'Hubballi', stations: 445, health: 79, color: '#84CC16' },
  { code: 'SECR', name: 'South East Central', hq: 'Bilaspur', stations: 378, health: 72, color: '#14B8A6' },
  { code: 'WCR', name: 'West Central', hq: 'Jabalpur', stations: 334, health: 76, color: '#A855F7' },
  { code: 'CR', name: 'Central Railway', hq: 'Mumbai', stations: 543, health: 83, color: '#2563EB' },
  { code: 'WR', name: 'Western Railway', hq: 'Mumbai', stations: 487, health: 81, color: '#059669' },
  { code: 'NWR', name: 'North Western', hq: 'Jaipur', stations: 412, health: 77, color: '#DC2626' },
  { code: 'KR', name: 'Konkan Railway', hq: 'Navi Mumbai', stations: 198, health: 88, color: '#0EA5E9' },
  { code: 'DFR', name: 'DFCCIL', hq: 'Noida', stations: 156, health: 91, color: '#6366F1' },
  { code: 'MTR', name: 'Mumbai Metro', hq: 'Mumbai', stations: 89, health: 94, color: '#D946EF' },
];

const months = [
  'September 2026', 'August 2026', 'July 2026', 'June 2026',
  'May 2026', 'April 2026', 'March 2026', 'February 2026',
  'January 2026', 'December 2025', 'November 2025', 'October 2025'
];

const departments = [
  { name: 'P-Way (Engineering)', blocks: 284, utilization: 87, color: '#3B82F6' },
  { name: 'Signal & Telecom', blocks: 196, utilization: 91, color: '#10B981' },
  { name: 'OHE (Electrical)', blocks: 142, utilization: 79, color: '#F59E0B' },
  { name: 'Bridge & Building', blocks: 98, utilization: 83, color: '#8B5CF6' },
  { name: 'Works Department', blocks: 67, utilization: 76, color: '#EF4444' },
];

const kpis = [
  { label: 'Block Utilization', value: '87.3%', trend: '+4.2%', up: true, icon: BarChart3, color: 'text-blue-400' },
  { label: 'Avg Delay Reduction', value: '34%', trend: '-12 min', up: true, icon: TrendingDown, color: 'text-emerald-400' },
  { label: 'Conflict Resolution', value: '96%', trend: '+8%', up: true, icon: CheckCircle, color: 'text-green-400' },
  { label: 'Pending Approvals', value: '23', trend: '+3', up: false, icon: AlertTriangle, color: 'text-amber-400' },
  { label: 'Active Blocks', value: '47', trend: '-5', up: true, icon: TrendingDown, color: 'text-purple-400' },
];

const monthlyTrend = [
  { month: 'Sep', utilization: 82, delays: 45 },
  { month: 'Oct', utilization: 84, delays: 42 },
  { month: 'Nov', utilization: 83, delays: 38 },
  { month: 'Dec', utilization: 85, delays: 35 },
  { month: 'Jan', utilization: 86, delays: 32 },
  { month: 'Feb', utilization: 85, delays: 30 },
  { month: 'Mar', utilization: 87, delays: 28 },
  { month: 'Apr', utilization: 88, delays: 25 },
  { month: 'May', utilization: 87, delays: 23 },
  { month: 'Jun', utilization: 86, delays: 22 },
  { month: 'Jul', utilization: 87, delays: 20 },
  { month: 'Aug', utilization: 87, delays: 18 },
];

export default function AnalyticsDashboard() {
  const [selectedMonth, setSelectedMonth] = useState('September 2026');
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  const handleExport = () => {
    toast.success('Report exported!', {
      description: `Analytics report for ${selectedMonth} — All India divisions downloaded.`,
    });
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    toast.info('Period updated', { description: `Showing data for ${month}` });
  };

  return (
    <div className="h-full flex flex-col gap-4 p-4 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            All-India Analytics Dashboard
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            17 Zones • 70+ Divisions • 68,000+ km network
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <select
              value={selectedMonth}
              onChange={(e) => handleMonthChange(e.target.value)}
              className="pl-8 pr-4 py-2 rounded-lg border border-border/50 bg-card/50 text-foreground text-sm appearance-none cursor-pointer"
            >
              {months.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-3">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-border/50 bg-card/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              <span className={`text-xs font-medium ${kpi.up ? 'text-emerald-400' : 'text-amber-400'}`}>
                {kpi.trend}
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Department Utilization */}
        <div className="rounded-xl border border-border/50 bg-card/50 p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">Department-wise Block Utilization</h3>
          <div className="space-y-3">
            {departments.map(dept => (
              <div key={dept.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">{dept.name}</span>
                  <span className="text-xs text-foreground font-medium">{dept.utilization}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${dept.utilization}%`, backgroundColor: dept.color }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">{dept.blocks} blocks this month</p>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="rounded-xl border border-border/50 bg-card/50 p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">Monthly Utilization & Delay Trend</h3>
          <div className="h-48 flex items-end gap-1">
            {monthlyTrend.map((data, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex gap-0.5 items-end" style={{ height: '160px' }}>
                  <div
                    className="flex-1 rounded-t bg-primary/60 hover:bg-primary/80 transition-colors cursor-pointer"
                    style={{ height: `${data.utilization * 1.6}px` }}
                    title={`Utilization: ${data.utilization}%`}
                  />
                  <div
                    className="flex-1 rounded-t bg-amber-500/60 hover:bg-amber-500/80 transition-colors cursor-pointer"
                    style={{ height: `${(100 - data.delays) * 1.6}px` }}
                    title={`Delays: ${data.delays} min avg`}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">{data.month}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-primary/60" />
              <span className="text-xs text-muted-foreground">Utilization %</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-500/60" />
              <span className="text-xs text-muted-foreground">On-time %</span>
            </div>
          </div>
        </div>

        {/* Delay Attribution Pie */}
        <div className="rounded-xl border border-border/50 bg-card/50 p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">Delay Attribution by Cause</h3>
          <div className="space-y-3">
            {[
              { cause: 'Weather Related', pct: 28, color: '#3B82F6' },
              { cause: 'Asset Failure', pct: 24, color: '#EF4444' },
              { cause: 'Block Overrun', pct: 18, color: '#F59E0B' },
              { cause: 'Traffic Congestion', pct: 15, color: '#8B5CF6' },
              { cause: 'Operational', pct: 10, color: '#10B981' },
              { cause: 'Other', pct: 5, color: '#6B7280' },
            ].map(item => (
              <div key={item.cause} className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-muted-foreground flex-1">{item.cause}</span>
                <div className="flex-1 h-2 rounded-full bg-muted/30 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${item.pct}%`, backgroundColor: item.color }} />
                </div>
                <span className="text-sm text-foreground font-medium w-10 text-right">{item.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Predictive Demand */}
        <div className="rounded-xl border border-border/50 bg-card/50 p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">Predictive Block Demand — Next Quarter</h3>
          <div className="space-y-3">
            {[
              { type: 'P-Way Maintenance', demand: 312, trend: '+12%', urgency: 'high' },
              { type: 'OHE Replacement', demand: 187, trend: '+8%', urgency: 'medium' },
              { type: 'Signal Upgradation', demand: 145, trend: '+22%', urgency: 'high' },
              { type: 'Bridge Inspection', demand: 89, trend: '-5%', urgency: 'low' },
              { type: 'New Line Construction', demand: 67, trend: '+45%', urgency: 'high' },
            ].map(item => (
              <div key={item.type} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex-1">
                  <p className="text-sm text-foreground">{item.type}</p>
                  <p className="text-xs text-muted-foreground">{item.demand} blocks predicted</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                  item.trend.startsWith('+') ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {item.trend}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded ml-2 ${
                  item.urgency === 'high' ? 'bg-red-500/20 text-red-400' :
                  item.urgency === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {item.urgency}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Zone Health Heatmap */}
      <div className="rounded-xl border border-border/50 bg-card/50 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">All-India Zone Health Heatmap</h3>
          <Filter className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="grid grid-cols-6 gap-2">
          {railwayZones.map(zone => (
            <button
              key={zone.code}
              onClick={() => setSelectedZone(selectedZone === zone.code ? null : zone.code)}
              className={`p-3 rounded-lg border transition-all text-left ${
                selectedZone === zone.code
                  ? 'border-primary bg-primary/10'
                  : 'border-border/30 hover:border-border/60 bg-card/30'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: zone.color }} />
                <span className="text-xs font-bold text-foreground">{zone.code}</span>
              </div>
              <div className="flex items-center gap-1">
                <div
                  className="w-8 h-2 rounded-full overflow-hidden bg-muted/30"
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${zone.health}%`,
                      backgroundColor: zone.health >= 80 ? '#22C55E' : zone.health >= 70 ? '#F59E0B' : '#EF4444',
                    }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">{zone.health}%</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 truncate">{zone.hq}</p>
            </button>
          ))}
        </div>
        {selectedZone && (() => {
          const zone = railwayZones.find(z => z.code === selectedZone);
          if (!zone) return null;
          return (
            <div className="mt-4 p-4 rounded-lg bg-muted/20 border border-border/30">
              <h4 className="text-sm font-semibold text-foreground mb-2">{zone.name} Division Detail</h4>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Headquarters</p>
                  <p className="text-foreground">{zone.hq}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Total Stations</p>
                  <p className="text-foreground">{zone.stations}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Health Score</p>
                  <p className={`font-medium ${zone.health >= 80 ? 'text-green-400' : zone.health >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
                    {zone.health}%
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Status</p>
                  <p className={`font-medium ${zone.health >= 80 ? 'text-green-400' : zone.health >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
                    {zone.health >= 80 ? 'Operational' : zone.health >= 70 ? 'Needs Attention' : 'Critical'}
                  </p>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
