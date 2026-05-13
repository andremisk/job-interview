"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, Loader2, Plus, Upload, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Segment, Company, Position, Level } from "@/types/database";

const supabase = createClient();

const DEV_BYPASS = process.env.NEXT_PUBLIC_DEV_BYPASS === "true";

const MOCK_SEGMENTS: Segment[] = [
  { id: "mock-design", name: "Design", slug: "design", description: "Architecture, UX, graphic design, and creative studios", created_at: "" },
  { id: "mock-finance", name: "Finance", slug: "finance", description: "Banking, investment, fintech, and financial services", created_at: "" },
  { id: "mock-healthcare", name: "Healthcare", slug: "healthcare", description: "Hospitals, biotech, pharma, and health tech", created_at: "" },
  { id: "mock-law", name: "Law", slug: "law", description: "Law firms, legal tech, and compliance-focused organizations", created_at: "" },
  { id: "mock-tech", name: "Technology", slug: "technology", description: "Software, hardware, and tech product companies", created_at: "" },
];

const MOCK_COMPANIES: Record<string, Company[]> = {
  "mock-design": [
    { id: "mock-figma", name: "Figma", slug: "figma", location: "San Francisco, CA", description: "Collaborative design platform.", segment_id: "mock-design", website: null, industry: "Design", culture_notes: null, notable_facts: null, logo_url: null, created_at: "", updated_at: "" },
    { id: "mock-canva", name: "Canva", slug: "canva", location: "Sydney, AU", description: "Online design and publishing tool.", segment_id: "mock-design", website: null, industry: "Design", culture_notes: null, notable_facts: null, logo_url: null, created_at: "", updated_at: "" },
  ],
  "mock-tech": [
    { id: "mock-vercel", name: "Vercel", slug: "vercel", location: "San Francisco, CA", description: "Frontend cloud platform.", segment_id: "mock-tech", website: null, industry: "Technology", culture_notes: null, notable_facts: null, logo_url: null, created_at: "", updated_at: "" },
    { id: "mock-linear", name: "Linear", slug: "linear", location: "San Francisco, CA", description: "Issue tracking for software teams.", segment_id: "mock-tech", website: null, industry: "Technology", culture_notes: null, notable_facts: null, logo_url: null, created_at: "", updated_at: "" },
    { id: "mock-notion", name: "Notion", slug: "notion", location: "San Francisco, CA", description: "All-in-one workspace.", segment_id: "mock-tech", website: null, industry: "Technology", culture_notes: null, notable_facts: null, logo_url: null, created_at: "", updated_at: "" },
  ],
  "mock-finance": [
    { id: "mock-stripe", name: "Stripe", slug: "stripe", location: "San Francisco, CA", description: "Payments infrastructure.", segment_id: "mock-finance", website: null, industry: "Finance", culture_notes: null, notable_facts: null, logo_url: null, created_at: "", updated_at: "" },
  ],
};

const MOCK_POSITIONS: Record<string, Position[]> = {
  "mock-figma": [
    { id: "mock-pos-1", title: "Junior Frontend Engineer", level: "junior", company_id: "mock-figma", segment_id: "mock-design", description: null, responsibilities: null, requirements: null, created_at: "" },
    { id: "mock-pos-2", title: "Mid-Level Software Engineer", level: "mid", company_id: "mock-figma", segment_id: "mock-design", description: null, responsibilities: null, requirements: null, created_at: "" },
    { id: "mock-pos-3", title: "Senior Software Engineer", level: "senior", company_id: "mock-figma", segment_id: "mock-design", description: null, responsibilities: null, requirements: null, created_at: "" },
  ],
  "mock-vercel": [
    { id: "mock-pos-4", title: "Junior Frontend Engineer", level: "junior", company_id: "mock-vercel", segment_id: "mock-tech", description: null, responsibilities: null, requirements: null, created_at: "" },
    { id: "mock-pos-5", title: "Senior Software Engineer", level: "senior", company_id: "mock-vercel", segment_id: "mock-tech", description: null, responsibilities: null, requirements: null, created_at: "" },
  ],
};

const LEVELS: { value: Level; label: string }[] = [
  { value: "intern", label: "Intern" },
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid-level" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead" },
];

type CustomCompany = { id: "custom"; name: string };

export function SessionSetup({ userId }: { userId: string }) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Industry / segment
  const [segments, setSegments] = useState<Segment[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);
  const [showCustomIndustry, setShowCustomIndustry] = useState(false);
  const [customIndustry, setCustomIndustry] = useState("");
  const [isOtherIndustry, setIsOtherIndustry] = useState(false);

  // Company
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | CustomCompany | null>(null);
  const [companyOpen, setCompanyOpen] = useState(false);
  const [companySearch, setCompanySearch] = useState("");
  const [customCompanyInput, setCustomCompanyInput] = useState("");

  // Position
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [showCustomPosition, setShowCustomPosition] = useState(false);
  const [customPositionTitle, setCustomPositionTitle] = useState("");
  const [customPositionLevel, setCustomPositionLevel] = useState<Level>("mid");

  // Context
  const [personalContext, setPersonalContext] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const [creating, setCreating] = useState(false);
  const [resumeParsing, setResumeParsing] = useState(false);
  const resumeFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (DEV_BYPASS) { setSegments(MOCK_SEGMENTS); return; }
    supabase.from("segments").select("*").order("name").then(({ data }) => {
      if (data && data.length > 0) setSegments(data as Segment[]);
      else setSegments(MOCK_SEGMENTS);
    });
  }, []);

  useEffect(() => {
    if (!selectedSegment) return;
    if (DEV_BYPASS) {
      setCompanies(MOCK_COMPANIES[selectedSegment.id] ?? []);
      return;
    }
    supabase
      .from("companies")
      .select("*")
      .eq("segment_id", selectedSegment.id)
      .order("name")
      .then(({ data }) => {
        if (data && data.length > 0) setCompanies(data as Company[]);
        else setCompanies(MOCK_COMPANIES[selectedSegment.id] ?? []);
      });
  }, [selectedSegment]);

  useEffect(() => {
    const isCustom = isOtherIndustry || selectedCompany?.id === "custom";
    if (isCustom || !selectedCompany || !selectedSegment) return;
    if (DEV_BYPASS) {
      setPositions(MOCK_POSITIONS[selectedCompany.id] ?? []);
      return;
    }
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from("positions")
        .select("*")
        .or(`company_id.eq.${selectedCompany.id},and(company_id.is.null,segment_id.eq.${selectedSegment.id})`)
        .order("level");
      if (data && data.length > 0) setPositions(data as Position[]);
      else setPositions(MOCK_POSITIONS[selectedCompany.id] ?? []);
    }, 0);
    return () => clearTimeout(timer);
  }, [selectedCompany, selectedSegment, isOtherIndustry]);

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(companySearch.toLowerCase())
  );

  const isCustomCompany = selectedCompany?.id === "custom";
  const isFullyCustom = isOtherIndustry || isCustomCompany;

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setResumeParsing(true);
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/parse-resume", { method: "POST", body: form });
      const data = await res.json();
      if (data.text) setResumeText(data.text);
    } finally {
      setResumeParsing(false);
    }
  }

  function goToStep2WithOtherIndustry() {
    setIsOtherIndustry(true);
    setSelectedSegment(null);
    setSelectedCompany(null);
    setCompanies([]);
    setPositions([]);
    setStep(2);
  }

  function goToStep3() {
    if (isFullyCustom) {
      setShowCustomPosition(true);
    }
    setStep(3);
  }

  async function handleCreate() {
    if (DEV_BYPASS) {
      alert("Dev mode: session would be created here. Supabase + AI are disabled.");
      return;
    }
    setCreating(true);

    const body: Record<string, unknown> = {
      questionCount: 5,
      personalContext: personalContext.trim() || undefined,
      resumeText: resumeText.trim() || undefined,
      jobDescription: jobDescription.trim() || undefined,
    };

    if (isOtherIndustry) {
      body.customIndustry = customIndustry.trim();
    } else {
      body.segmentId = selectedSegment?.id;
    }

    if (isCustomCompany) {
      body.customCompanyName = selectedCompany?.name;
    } else {
      body.companyId = selectedCompany?.id;
    }

    if (showCustomPosition) {
      body.customPositionTitle = customPositionTitle.trim();
      body.customPositionLevel = customPositionLevel;
    } else {
      body.positionId = selectedPosition?.id;
    }

    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.sessionId) {
        setCreating(false);
        return;
      }
      router.push(`/session/${data.sessionId}`);
    } catch {
      setCreating(false);
    }
  }

  const step2Valid = selectedCompany !== null;
  const step3Valid =
    (selectedPosition !== null && !showCustomPosition) ||
    (showCustomPosition && customPositionTitle.trim().length > 0);

  const stepLabels = ["Industry", "Company", "Role"];

  return (
    <div className="max-w-lg mx-auto px-6 py-12 w-full">

      {/* ── Step indicator ── */}
      <div className="mb-10">
        <div className="flex items-start mb-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex items-start flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div className={cn(
                  "h-8 w-8 rounded-full text-xs flex items-center justify-center font-semibold border-2 transition-all shrink-0",
                  step > n
                    ? "bg-zinc-900 border-zinc-900 text-white"
                    : step === n
                    ? "bg-white border-zinc-900 text-zinc-900"
                    : "bg-white border-zinc-200 text-zinc-400"
                )}>
                  {step > n ? <Check className="h-3.5 w-3.5" /> : n}
                </div>
                <span className={cn(
                  "text-[10px] font-medium",
                  step === n ? "text-zinc-900" : "text-zinc-400"
                )}>
                  {stepLabels[n - 1]}
                </span>
              </div>
              {n < 3 && (
                <div className={cn(
                  "h-px flex-1 mt-4 mx-2",
                  step > n ? "bg-zinc-900" : "bg-zinc-200"
                )} />
              )}
            </div>
          ))}
        </div>
        <h1 className="text-xl font-semibold tracking-tight">
          {step === 1 && "Choose an industry"}
          {step === 2 && "Select a company"}
          {step === 3 && "Pick the role"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {step === 1 && "Which sector is the company in?"}
          {step === 2 && "Search for your target company"}
          {step === 3 && "Specify the position and level you’re applying for"}
        </p>
      </div>

      {/* ── Step 1: Industry ── */}
      {step === 1 && (
        <div className="space-y-2">
          {segments.map((seg) => (
            <button
              key={seg.id}
              onClick={() => {
                setSelectedSegment(seg);
                setIsOtherIndustry(false);
                setShowCustomIndustry(false);
                setCustomIndustry("");
                setSelectedCompany(null);
                setPositions([]);
                setStep(2);
              }}
              className="w-full flex items-center justify-between p-4 rounded-xl border bg-white hover:border-zinc-300 hover:shadow-sm shadow-zinc-100 text-left transition-all group"
            >
              <div>
                <p className="text-sm font-medium">{seg.name}</p>
                {seg.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">{seg.description}</p>
                )}
              </div>
              <ChevronRight className="h-4 w-4 text-zinc-300 group-hover:text-zinc-500 transition-colors shrink-0 ml-3" />
            </button>
          ))}

          <button
            onClick={() => setShowCustomIndustry((v) => !v)}
            className={cn(
              "w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all group",
              showCustomIndustry
                ? "border-zinc-900 bg-zinc-50"
                : "bg-white hover:border-zinc-300 hover:shadow-sm shadow-zinc-100"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="h-7 w-7 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
                <Plus className="h-3.5 w-3.5 text-zinc-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Other</p>
                <p className="text-xs text-muted-foreground mt-0.5">Enter your own industry or sector</p>
              </div>
            </div>
            <ChevronRight className={cn(
              "h-4 w-4 shrink-0 ml-3 transition-all",
              showCustomIndustry ? "rotate-90 text-zinc-600" : "text-zinc-300 group-hover:text-zinc-500"
            )} />
          </button>

          {showCustomIndustry && (
            <div className="space-y-3 pt-1 px-1">
              <input
                autoFocus
                type="text"
                value={customIndustry}
                onChange={(e) => setCustomIndustry(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && customIndustry.trim()) goToStep2WithOtherIndustry();
                }}
                placeholder="e.g. Real Estate, Non-profit, Education…"
                className="w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-zinc-900 shadow-sm"
              />
              <Button
                disabled={!customIndustry.trim()}
                onClick={goToStep2WithOtherIndustry}
                className="w-full rounded-lg"
              >
                Continue
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ── Step 2: Company ── */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Company</Label>

            {isOtherIndustry ? (
              <input
                autoFocus
                type="text"
                value={customCompanyInput}
                onChange={(e) => {
                  setCustomCompanyInput(e.target.value);
                  if (e.target.value.trim()) {
                    setSelectedCompany({ id: "custom", name: e.target.value.trim() });
                  } else {
                    setSelectedCompany(null);
                  }
                }}
                placeholder="Company name…"
                className="w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-zinc-900 shadow-sm"
              />
            ) : (
              <Popover open={companyOpen} onOpenChange={setCompanyOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={companyOpen}
                    className="w-full justify-between font-normal rounded-lg h-10 shadow-sm"
                  >
                    {selectedCompany?.name ?? "Search companies…"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-40" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Search…"
                      value={companySearch}
                      onValueChange={setCompanySearch}
                    />
                    <CommandList>
                      <CommandEmpty>
                        {companySearch.trim() ? (
                          <button
                            className="w-full px-3 py-2.5 text-sm text-left hover:bg-zinc-50 transition-colors flex items-center gap-2"
                            onClick={() => {
                              setSelectedCompany({ id: "custom", name: companySearch.trim() });
                              setCompanyOpen(false);
                              setCompanySearch("");
                              setPositions([]);
                            }}
                          >
                            <Plus className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                            Use &ldquo;{companySearch}&rdquo;
                          </button>
                        ) : (
                          <span className="block px-3 py-2.5 text-sm text-muted-foreground">
                            No companies found.
                          </span>
                        )}
                      </CommandEmpty>
                      <CommandGroup>
                        {filteredCompanies.map((c) => (
                          <CommandItem
                            key={c.id}
                            value={c.name}
                            onSelect={() => {
                              setSelectedCompany(c);
                              setCompanyOpen(false);
                              setCompanySearch("");
                            }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", selectedCompany?.id === c.id ? "opacity-100" : "opacity-0")} />
                            <div>
                              <p>{c.name}</p>
                              {c.location && <p className="text-xs text-muted-foreground">{c.location}</p>}
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
          </div>

          {selectedCompany && !isCustomCompany && "description" in selectedCompany && selectedCompany.description && (
            <div className="rounded-xl border bg-zinc-50 p-4 text-sm space-y-1">
              <p className="font-medium">{selectedCompany.name}</p>
              <p className="text-muted-foreground text-xs leading-relaxed">{selectedCompany.description}</p>
            </div>
          )}

          {isCustomCompany && selectedCompany && (
            <div className="rounded-xl border bg-zinc-50 p-4 text-sm flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-zinc-900 flex items-center justify-center shrink-0">
                <span className="text-white text-[10px] font-bold">{selectedCompany.name.slice(0, 2).toUpperCase()}</span>
              </div>
              <div>
                <p className="font-medium">{selectedCompany.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">AI will generate role-appropriate questions</p>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button variant="outline" onClick={() => setStep(1)} className="rounded-lg">
              Back
            </Button>
            <Button onClick={goToStep3} disabled={!step2Valid} className="flex-1 rounded-lg">
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 3: Position + Context ── */}
      {step === 3 && (
        <div className="space-y-5">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Position</Label>
            <div className="space-y-2">
              {!isFullyCustom && positions.length === 0 && (
                <p className="text-sm text-muted-foreground py-1">Loading positions…</p>
              )}

              {positions.map((pos) => (
                <button
                  key={pos.id}
                  onClick={() => { setSelectedPosition(pos); setShowCustomPosition(false); }}
                  className={cn(
                    "w-full flex items-center justify-between p-3.5 rounded-xl border text-left text-sm transition-all",
                    selectedPosition?.id === pos.id && !showCustomPosition
                      ? "border-zinc-900 bg-zinc-50 shadow-sm"
                      : "bg-white hover:border-zinc-300 hover:shadow-sm shadow-zinc-100"
                  )}
                >
                  <div>
                    <p className="font-medium">{pos.title}</p>
                    <p className="text-xs text-muted-foreground capitalize mt-0.5">{pos.level}</p>
                  </div>
                  {selectedPosition?.id === pos.id && !showCustomPosition
                    ? <Check className="h-4 w-4 shrink-0 text-zinc-900" />
                    : <ChevronRight className="h-4 w-4 text-zinc-300 shrink-0" />
                  }
                </button>
              ))}

              <button
                onClick={() => { setShowCustomPosition(true); setSelectedPosition(null); }}
                className={cn(
                  "w-full flex items-center justify-between p-3.5 rounded-xl border text-left text-sm transition-all",
                  showCustomPosition
                    ? "border-zinc-900 bg-zinc-50 shadow-sm"
                    : "bg-white hover:border-zinc-300 hover:shadow-sm shadow-zinc-100"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
                    <Plus className="h-3.5 w-3.5 text-zinc-500" />
                  </div>
                  <span className="font-medium">Other</span>
                </div>
                <ChevronRight className={cn("h-4 w-4 shrink-0 transition-all", showCustomPosition ? "rotate-90 text-zinc-600" : "text-zinc-300")} />
              </button>

              {showCustomPosition && (
                <div className="rounded-xl border bg-zinc-50 p-4 space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-500">Job title</Label>
                    <input
                      autoFocus
                      type="text"
                      value={customPositionTitle}
                      onChange={(e) => setCustomPositionTitle(e.target.value)}
                      placeholder="e.g. Product Designer, Data Analyst…"
                      className="w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-zinc-900 shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-zinc-500">Level</Label>
                    <div className="flex flex-wrap gap-2">
                      {LEVELS.map((l) => (
                        <button
                          key={l.value}
                          type="button"
                          onClick={() => setCustomPositionLevel(l.value)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg border text-xs font-medium transition-all",
                            customPositionLevel === l.value
                              ? "bg-zinc-900 text-white border-zinc-900"
                              : "bg-white hover:border-zinc-400"
                          )}
                        >
                          {l.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Job description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                Job description <span className="normal-case text-zinc-400">(optional)</span>
              </Label>
            </div>
            <textarea
              id="job-description"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description to get questions tailored to the exact requirements…"
              className="w-full min-h-[80px] rounded-lg border bg-white px-3.5 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none shadow-sm"
            />
          </div>

          {/* Resume */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                Resume <span className="normal-case text-zinc-400">(optional)</span>
              </Label>
              <div>
                <input ref={resumeFileRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={handleFileUpload} />
                <button
                  type="button"
                  onClick={() => resumeFileRef.current?.click()}
                  disabled={resumeParsing}
                  className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 border rounded-md px-2.5 py-1.5 transition-colors disabled:opacity-50 bg-white"
                >
                  {resumeParsing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                  {resumeParsing ? "Reading…" : "Upload PDF / Word"}
                </button>
              </div>
            </div>
            <textarea
              id="resume-text"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume — AI will ask questions based on your specific experience and background…"
              className="w-full min-h-[96px] rounded-lg border bg-white px-3.5 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none shadow-sm"
            />
          </div>

          {/* Personal context */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
              Personal context <span className="normal-case text-zinc-400">(optional)</span>
            </Label>
            <textarea
              id="personal-context"
              value={personalContext}
              onChange={(e) => setPersonalContext(e.target.value)}
              placeholder="e.g. I’m applying to the workplace studio. My strongest projects are the civic library renovation and a mixed-use residential building. I know Revit and Rhino but am still learning Grasshopper."
              className="w-full min-h-[80px] rounded-lg border bg-white px-3.5 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none shadow-sm"
            />
            <p className="text-xs text-muted-foreground">
              Help the AI tailor questions to your background, projects, and the company you are applying to.
            </p>
          </div>

          <div className="flex gap-2 pt-1">
            <Button variant="outline" onClick={() => setStep(2)} className="rounded-lg">
              Back
            </Button>
            <Button onClick={handleCreate} disabled={!step3Valid || creating} className="flex-1 rounded-lg">
              {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Start interview
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
