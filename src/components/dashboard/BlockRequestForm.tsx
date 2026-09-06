import { useState } from "react";
import { toast } from "sonner";
import {
  Zap,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Brain,
  Clock,
  MapPin,
  Wrench,
  Users,
} from "lucide-react";

const sections = [
  "Delhi Junction → New Delhi (KM 0-8)",
  "New Delhi → Hazrat Nizamuddin (KM 8-16)",
  "Nizamuddin → Faridabad (KM 16-42)",
  "Faridabad → Mathura Junction (KM 42-120)",
  "Mathura Jn → Agra Cantt (KM 120-160)",
  "Agra Cantt → Agra Fort (KM 160-165)",
];

const workTypes = [
  "Track Renewal (Rails)",
  "Ballast Cleaning & Tamping",
  "OHE Replacement",
  "Signal Upgradation",
  "Bridge Inspection",
  "Level Crossing Repair",
  "USFD Defect Rectification",
  "Emergency Breakdown",
];

const blockTypes = [
  { id: "full", label: "Full Block", desc: "Complete line block for both directions" },
  { id: "single", label: "Single Line Block", desc: "One direction only, other line open" },
  { id: "power", label: "Power Block", desc: "OHE de-energized section" },
  { id: "short", label: "Short Duration", desc: "Under 60 minutes, limited scope" },
];

const defaultForm = {
  section: "",
  workType: "",
  blockType: "full",
  duration: "3",
  urgency: "medium",
  crewSize: "12",
  reason: "",
};

export default function BlockRequestForm() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(defaultForm);
  const [aiSuggested, setAiSuggested] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const steps = [
    { label: "Section & Type", icon: MapPin },
    { label: "Work Details", icon: Wrench },
    { label: "AI Analysis", icon: Brain },
    { label: "Review & Submit", icon: CheckCircle2 },
  ];

  const handleAiSuggest = () => {
    setAiSuggested(true);
    setForm((f) => ({
      ...f,
      duration: "2h 45m",
      urgency: "high",
      crewSize: "8",
      reason: "AI detected rail fatigue approaching threshold (score: 62/100) — TRC data indicates lateral displacement exceeding limits at KM 168. Recommended immediate block to prevent potential derailment risk.",
    }));
  };

  const canAdvance = () => {
    if (step === 0) return form.section !== "";
    if (step === 1) return form.workType !== "";
    if (step === 2) return true; // AI step is optional
    return true;
  };

  const handleNext = () => {
    if (!canAdvance()) {
      if (step === 0) toast.warning("Please select a railway section first");
      if (step === 1) toast.warning("Please select a work type first");
      return;
    }
    setStep((s) => Math.min(3, s + 1));
  };

  const handleSubmit = () => {
    const blockId = `BLK-2024-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    setSubmitted(true);
    toast.success(`Block request ${blockId} submitted!`, {
      description: `${form.section} — ${form.workType}. Sent for approval.`,
    });
  };

  const handleReset = () => {
    setStep(0);
    setForm(defaultForm);
    setAiSuggested(false);
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="rounded-2xl p-12 border border-chart-3/30 bg-chart-3/5 text-center">
          <div className="w-20 h-20 rounded-3xl bg-chart-3/15 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-chart-3" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Block Request Submitted!</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Your request for <strong>{form.section}</strong> has been submitted for approval. You&apos;ll receive a notification once it&apos;s reviewed.
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-8">
            <div className="p-3 rounded-xl bg-card border border-border/50">
              <div className="text-xs text-muted-foreground">Section</div>
              <div className="text-sm font-medium mt-0.5">{form.section.split(" (")[0]}</div>
            </div>
            <div className="p-3 rounded-xl bg-card border border-border/50">
              <div className="text-xs text-muted-foreground">Work Type</div>
              <div className="text-sm font-medium mt-0.5">{form.workType}</div>
            </div>
            <div className="p-3 rounded-xl bg-card border border-border/50">
              <div className="text-xs text-muted-foreground">Duration</div>
              <div className="text-sm font-medium mt-0.5">{aiSuggested ? "2h 45m (AI)" : `${form.duration}h`}</div>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all"
          >
            Create Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress steps */}
      <div className="flex items-center gap-2 px-4">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold transition-all ${
                i <= step ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary/40"
              }`}
            >
              {i < step ? <CheckCircle2 className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
            </div>
            <span className={`text-sm font-medium hidden md:block ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mx-2 ${i < step ? "bg-primary" : "bg-border"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Form content */}
      <div className="rounded-2xl p-6 border border-border/50 bg-card">
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-1">Select Railway Section</h3>
              <p className="text-sm text-muted-foreground">Choose the section requiring maintenance</p>
            </div>
            <div className="grid gap-3">
              {sections.map((sec, i) => (
                <button
                  key={i}
                  onClick={() => setForm({ ...form, section: sec })}
                  className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                    form.section === sec
                      ? "border-primary bg-primary/10"
                      : "border-border/50 hover:border-primary/30 hover:bg-primary/5"
                  }`}
                >
                  <MapPin className={`w-5 h-5 shrink-0 ${form.section === sec ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="text-sm font-medium">{sec}</span>
                  {form.section === sec && <CheckCircle2 className="w-5 h-5 text-primary ml-auto" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-1">Work Details</h3>
              <p className="text-sm text-muted-foreground">Specify the type of maintenance work</p>
            </div>

            {/* Block Type */}
            <div>
              <label className="text-sm font-medium mb-2 block">Block Type</label>
              <div className="grid grid-cols-2 gap-3">
                {blockTypes.map((bt) => (
                  <button
                    key={bt.id}
                    onClick={() => setForm({ ...form, blockType: bt.id })}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      form.blockType === bt.id
                        ? "border-primary bg-primary/10"
                        : "border-border/50 hover:border-primary/30"
                    }`}
                  >
                    <div className="text-sm font-semibold">{bt.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{bt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Work Type */}
            <div>
              <label className="text-sm font-medium mb-2 block">Work Type</label>
              <div className="grid grid-cols-2 gap-3">
                {workTypes.map((wt, i) => (
                  <button
                    key={i}
                    onClick={() => setForm({ ...form, workType: wt })}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all text-sm ${
                      form.workType === wt
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "border-border/50 hover:border-primary/30 text-muted-foreground"
                    }`}
                  >
                    <Wrench className="w-4 h-4 shrink-0" />
                    {wt}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration & Crew */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Estimated Duration (hours)</label>
                <input
                  type="number"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  min={0.5}
                  max={8}
                  step={0.5}
                  className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-border/50 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Crew Size</label>
                <input
                  type="number"
                  value={form.crewSize}
                  onChange={(e) => setForm({ ...form, crewSize: e.target.value })}
                  min={2}
                  max={50}
                  className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-border/50 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">AI Analysis & Recommendation</h3>
                <p className="text-sm text-muted-foreground">Click to get AI-powered block optimization</p>
              </div>
            </div>

            {!aiSuggested ? (
              <button
                onClick={handleAiSuggest}
                className="w-full p-8 rounded-2xl border-2 border-dashed border-primary/30 hover:border-primary/50 bg-primary/5 hover:bg-primary/10 transition-all flex flex-col items-center gap-3"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center animate-pulse-glow">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
                <span className="text-lg font-semibold text-primary">Run AI Optimization</span>
                <span className="text-sm text-muted-foreground">Analyze traffic density, asset health, and generate optimal block window</span>
              </button>
            ) : (
              <div className="space-y-4">
                {/* AI Recommendation Card */}
                <div className="rounded-2xl p-6 border border-primary/30 bg-primary/5">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-5 h-5 text-chart-3" />
                    <span className="font-semibold text-chart-3">AI Recommended Block Window</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 rounded-xl bg-background/30">
                      <Clock className="w-5 h-5 text-primary mx-auto mb-1" />
                      <div className="text-lg font-bold">02:00 – 04:45</div>
                      <div className="text-xs text-muted-foreground">Optimal Window</div>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-background/30">
                      <Users className="w-5 h-5 text-chart-3 mx-auto mb-1" />
                      <div className="text-lg font-bold">8 Crew</div>
                      <div className="text-xs text-muted-foreground">Recommended</div>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-background/30">
                      <Zap className="w-5 h-5 text-chart-4 mx-auto mb-1" />
                      <div className="text-lg font-bold">94%</div>
                      <div className="text-xs text-muted-foreground">Confidence</div>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-background/20 text-sm leading-relaxed">
                    <strong>Rationale:</strong> {form.reason}
                  </div>
                </div>

                {/* Traffic density */}
                <div className="rounded-xl p-4 border border-border/50 bg-card">
                  <h4 className="font-medium text-sm mb-2">Traffic Density Analysis</h4>
                  <div className="flex items-end gap-1 h-16">
                    {[0.8, 0.6, 0.4, 0.3, 0.2, 0.2, 0.3, 0.5, 0.8, 1.0, 1.5, 2.0, 3.5, 5.0, 6.0, 5.5, 4.0, 3.0, 2.0, 1.5, 1.0, 0.8, 0.6, 0.5].map((v, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t transition-all"
                        style={{
                          height: `${(v / 6) * 100}%`,
                          background: i >= 2 && i <= 6 ? "oklch(0.65 0.18 250)" : i >= 9 && i <= 16 ? "oklch(0.65 0.22 25 / 0.5)" : "oklch(0.30 0.03 250)",
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                    <span>00:00</span>
                    <span className="text-chart-3 font-medium">AI Recommended</span>
                    <span>23:00</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-1">Review & Submit</h3>
              <p className="text-sm text-muted-foreground">Verify all details before submitting</p>
            </div>

            <div className="rounded-2xl border border-border/50 overflow-hidden">
              <div className="grid grid-cols-2 gap-px bg-border/30">
                {[
                  { label: "Section", value: form.section || "Not selected" },
                  { label: "Work Type", value: form.workType || "Not selected" },
                  { label: "Block Type", value: blockTypes.find((b) => b.id === form.blockType)?.label || "" },
                  { label: "Estimated Duration", value: aiSuggested ? "2h 45m (AI)" : `${form.duration} hours` },
                  { label: "Urgency", value: aiSuggested ? "high (AI)" : form.urgency },
                  { label: "Crew Size", value: aiSuggested ? "8 (AI recommended)" : form.crewSize },
                ].map((item, i) => (
                  <div key={i} className="bg-card p-4">
                    <div className="text-xs text-muted-foreground">{item.label}</div>
                    <div className="text-sm font-medium mt-0.5">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {aiSuggested && (
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-primary">AI Rationale</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{form.reason}</p>
              </div>
            )}

            <div className="flex items-center gap-2 p-3 rounded-xl bg-chart-3/5 border border-chart-3/20">
              <CheckCircle2 className="w-5 h-5 text-chart-3 shrink-0" />
              <span className="text-sm text-chart-3 font-medium">No conflicts detected with existing blocks</span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        {step < 3 ? (
          <button
            onClick={handleNext}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              canAdvance()
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-primary/20 text-primary/50 cursor-not-allowed"
            }`}
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-chart-3 text-white hover:bg-chart-3/90 transition-all active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" /> Submit Block Request
          </button>
        )}
      </div>
    </div>
  );
}
