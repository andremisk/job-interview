"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Segment, Company, Position } from "@/types/database";

const supabase = createClient();

export function SessionSetup({ userId }: { userId: string }) {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyOpen, setCompanyOpen] = useState(false);
  const [companySearch, setCompanySearch] = useState("");
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [personalContext, setPersonalContext] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    supabase.from("segments").select("*").order("name").then(({ data }) => {
      if (data) setSegments(data as Segment[]);
    });
  }, []);

  useEffect(() => {
    if (!selectedSegment) return;
    supabase
      .from("companies")
      .select("*")
      .eq("segment_id", selectedSegment.id)
      .order("name")
      .then(({ data }) => {
        if (data) setCompanies(data as Company[]);
      });
  }, [selectedSegment]);

  useEffect(() => {
    if (!selectedCompany || !selectedSegment) return;
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from("positions")
        .select("*")
        .or(`company_id.eq.${selectedCompany.id},and(company_id.is.null,segment_id.eq.${selectedSegment.id})`)
        .order("level");
      if (data) setPositions(data as Position[]);
    }, 0);
    return () => clearTimeout(timer);
  }, [selectedCompany, selectedSegment]);

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(companySearch.toLowerCase())
  );

  async function handleCreate() {
    if (!selectedCompany || !selectedPosition) return;
    setCreating(true);

    const { data: session, error } = await supabase
      .from("interview_sessions")
      .insert({
        user_id: userId,
        company_id: selectedCompany.id,
        position_id: selectedPosition.id,
        status: "pending",
        question_count: 5,
        personal_context: personalContext.trim() || null,
      })
      .select()
      .single();

    if (error || !session) {
      setCreating(false);
      return;
    }

    router.push(`/session/${session.id}`);
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-12 w-full">
      <div className="mb-8 space-y-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex items-center gap-2">
              <div
                className={cn(
                  "h-5 w-5 rounded-full text-xs flex items-center justify-center font-medium",
                  step >= n
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {n}
              </div>
              {n < 3 && <div className={cn("h-px w-6", step > n ? "bg-foreground" : "bg-border")} />}
            </div>
          ))}
        </div>
        <h1 className="text-xl font-semibold tracking-tight">
          {step === 1 && "Choose an industry"}
          {step === 2 && "Select a company"}
          {step === 3 && "Pick the role"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {step === 1 && "Which sector is the company in?"}
          {step === 2 && "Search for your target company"}
          {step === 3 && "Specify the position and level you're applying for"}
        </p>
      </div>

      {/* Step 1: Segment */}
      {step === 1 && (
        <div className="space-y-3">
          {segments.map((seg) => (
            <button
              key={seg.id}
              onClick={() => {
                setSelectedSegment(seg);
                setSelectedCompany(null);
                setStep(2);
              }}
              className="w-full flex items-center justify-between p-4 rounded-lg border text-left hover:bg-accent transition-colors"
            >
              <div>
                <p className="text-sm font-medium">{seg.name}</p>
                {seg.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">{seg.description}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Step 2: Company */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Company</Label>
            <Popover open={companyOpen} onOpenChange={setCompanyOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={companyOpen}
                  className="w-full justify-between font-normal"
                >
                  {selectedCompany?.name ?? "Search companies…"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
                    <CommandEmpty>No companies found.</CommandEmpty>
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
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedCompany?.id === c.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div>
                            <p>{c.name}</p>
                            {c.location && (
                              <p className="text-xs text-muted-foreground">{c.location}</p>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {selectedCompany && (
            <div className="rounded-lg border bg-muted/30 p-4 text-sm space-y-1">
              <p className="font-medium">{selectedCompany.name}</p>
              {selectedCompany.description && (
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {selectedCompany.description}
                </p>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button onClick={() => setStep(3)} disabled={!selectedCompany} className="flex-1">
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Position */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Position</Label>
            <div className="space-y-2">
              {positions.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">Loading positions…</p>
              ) : (
                positions.map((pos) => (
                  <button
                    key={pos.id}
                    onClick={() => setSelectedPosition(pos)}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-lg border text-left text-sm transition-colors",
                      selectedPosition?.id === pos.id
                        ? "border-foreground bg-accent"
                        : "hover:bg-accent"
                    )}
                  >
                    <div>
                      <p className="font-medium">{pos.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">{pos.level}</p>
                    </div>
                    {selectedPosition?.id === pos.id && (
                      <Check className="h-4 w-4 shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Label htmlFor="personal-context">
              Personal context <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <textarea
              id="personal-context"
              value={personalContext}
              onChange={(e) => setPersonalContext(e.target.value)}
              placeholder="e.g. I'm applying to the workplace studio. My strongest projects are the civic library renovation and a mixed-use residential building. I know Revit and Rhino but am still learning Grasshopper."
              className="w-full min-h-[96px] rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Help the AI tailor questions to your specific background, projects, and the studio you are applying to.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!selectedPosition || creating}
              className="flex-1"
            >
              {creating && <Loader2 className="h-4 w-4 animate-spin" />}
              Start interview
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
