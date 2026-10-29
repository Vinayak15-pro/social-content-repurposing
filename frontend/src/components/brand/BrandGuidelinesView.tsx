import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Save,
  Plus,
  Trash2,
  AlertTriangle,
  XCircle,
  Info,
  CheckCircle2,
  Sliders,
  FileText
} from "lucide-react";
import { BrandGuidelines, BrandViolation, Campaign } from "@/types";
import { api } from "@/lib/api";

interface BrandGuidelinesViewProps {
  activeCampaign: Campaign | null;
}

export const BrandGuidelinesView: React.FC<BrandGuidelinesViewProps> = ({
  activeCampaign,
}) => {
  const [guidelines, setGuidelines] = useState<BrandGuidelines>({
    brand_name: "Acme Corp",
    tone_and_personality: ["Authoritative", "Approachable", "Insightful", "Data-driven"],
    target_audience: "B2B Technology Leaders, Engineering Directors, and VP Product",
    preferred_terminology: {
      "customer": "client partner",
      "bot": "AI automation agent",
      "cheap": "cost-efficient",
      "features": "capabilities"
    },
    required_phrases: ["enterprise-ready", "SOC2 Type II certified"],
    prohibited_words: ["cheap", "guaranteed 100%", "miracle", "foolproof", "unmatched", "silver bullet"],
    unsupported_claims: ["#1 in the universe", "zero bugs", "instant 10x ROI"],
    cta_preferences: [
      "Explore the technical architecture",
      "Request a bespoke demonstration",
      "Read the complete engineering benchmark"
    ],
    writing_style: "Concise, active voice, concrete metrics before qualitative claims.",
    campaign_instructions: null
  });

  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [newRequiredPhrase, setNewRequiredPhrase] = useState("");
  const [newProhibitedWord, setNewProhibitedWord] = useState("");
  const [newOldTerm, setNewOldTerm] = useState("");
  const [newReplacementTerm, setNewReplacementTerm] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getBrandGuidelines();
        if (data) setGuidelines(data);
      } catch {
        // fallback to default
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const updated = await api.updateBrandGuidelines(guidelines);
      setGuidelines(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  const addRequiredPhrase = () => {
    if (!newRequiredPhrase.trim()) return;
    setGuidelines({
      ...guidelines,
      required_phrases: [...guidelines.required_phrases, newRequiredPhrase.trim()]
    });
    setNewRequiredPhrase("");
  };

  const removeRequiredPhrase = (index: number) => {
    setGuidelines({
      ...guidelines,
      required_phrases: guidelines.required_phrases.filter((_, i) => i !== index)
    });
  };

  const addProhibitedWord = () => {
    if (!newProhibitedWord.trim()) return;
    setGuidelines({
      ...guidelines,
      prohibited_words: [...guidelines.prohibited_words, newProhibitedWord.trim()]
    });
    setNewProhibitedWord("");
  };

  const removeProhibitedWord = (index: number) => {
    setGuidelines({
      ...guidelines,
      prohibited_words: guidelines.prohibited_words.filter((_, i) => i !== index)
    });
  };

  const addTerminology = () => {
    if (!newOldTerm.trim() || !newReplacementTerm.trim()) return;
    setGuidelines({
      ...guidelines,
      preferred_terminology: {
        ...guidelines.preferred_terminology,
        [newOldTerm.trim()]: newReplacementTerm.trim()
      }
    });
    setNewOldTerm("");
    setNewReplacementTerm("");
  };

  const removeTerminology = (key: string) => {
    const next = { ...guidelines.preferred_terminology };
    delete next[key];
    setGuidelines({ ...guidelines, preferred_terminology: next });
  };

  const violations: BrandViolation[] = activeCampaign?.brand_violations || [];

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-2">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Editorial Voice & Policy Enforcement</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Brand Guidelines & Compliance Center
          </h2>
          <p className="text-xs text-slate-500">
            Define corporate voice, mandatory phrases, disallowed words, and preferred terminology. All repurposed content is automatically validated against these standards.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
        >
          <Save className="w-4 h-4" />
          <span>{isLoading ? "Saving..." : "Save Brand Settings"}</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Brand guidelines saved successfully and applied across future repurposing runs.</span>
        </div>
      )}

      {/* Active Campaign Compliance Audit Panel */}
      {activeCampaign && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span>Active Campaign Brand Audit:</span>
                <span className="font-normal text-slate-500">{activeCampaign.title}</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Deterministic and semantic compliance checks for this campaign&apos;s generated copy
              </p>
            </div>

            <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${
              violations.length === 0
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}>
              {violations.length === 0 ? "100% Brand Compliant" : `${violations.length} Brand Notices`}
            </span>
          </div>

          {violations.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              <p className="font-semibold text-slate-800">Zero Brand Violations Detected</p>
              <p className="text-[11px] text-slate-400">All generated drafts adhere to required terminology, tone, and prohibited phrase constraints.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {violations.map((v, i) => (
                <div key={i} className="py-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        v.severity === "error"
                          ? "bg-rose-100 text-rose-800"
                          : v.severity === "warning"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {v.severity}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{v.rule_name}</span>
                      <span className="text-xs text-slate-400">• {v.platform}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600">{v.explanation}</p>

                  {v.passage && v.passage !== "N/A" && (
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800">
                      Flagged: &ldquo;{v.passage}&rdquo;
                    </div>
                  )}

                  <div className="text-xs text-indigo-700 font-medium">
                    Recommendation: {v.recommendation}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Editable Brand Configuration Form */}
      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Identity & Tone */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            Brand Identity & Tone
          </h3>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Brand / Company Name
            </label>
            <input
              type="text"
              value={guidelines.brand_name}
              onChange={(e) => setGuidelines({ ...guidelines, brand_name: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Core Target Audience
            </label>
            <input
              type="text"
              value={guidelines.target_audience}
              onChange={(e) => setGuidelines({ ...guidelines, target_audience: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Editorial Writing Style
            </label>
            <textarea
              rows={3}
              value={guidelines.writing_style}
              onChange={(e) => setGuidelines({ ...guidelines, writing_style: e.target.value })}
              className="w-full p-3 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {/* Card 2: Preferred Terminology */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            Preferred Terminology (Substitutions)
          </h3>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {Object.entries(guidelines.preferred_terminology).map(([oldTerm, newTerm]) => (
              <div key={oldTerm} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                <span>
                  Replace &ldquo;<span className="font-semibold text-rose-700">{oldTerm}</span>&rdquo; with &ldquo;<span className="font-semibold text-emerald-700">{newTerm}</span>&rdquo;
                </span>
                <button
                  type="button"
                  onClick={() => removeTerminology(oldTerm)}
                  className="text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2 border-t border-slate-100">
            <input
              type="text"
              value={newOldTerm}
              onChange={(e) => setNewOldTerm(e.target.value)}
              placeholder="e.g. client"
              className="w-1/2 px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg"
            />
            <input
              type="text"
              value={newReplacementTerm}
              onChange={(e) => setNewReplacementTerm(e.target.value)}
              placeholder="e.g. client partner"
              className="w-1/2 px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg"
            />
            <button
              type="button"
              onClick={addTerminology}
              className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs shrink-0"
            >
              Add
            </button>
          </div>
        </div>

        {/* Card 3: Required Phrases */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            Mandatory Required Phrases
          </h3>
          <p className="text-[11px] text-slate-500">
            Social campaigns will flag a notice if these compliance phrases are missing.
          </p>

          <div className="flex flex-wrap gap-2">
            {guidelines.required_phrases.map((phrase, idx) => (
              <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs">
                <span>{phrase}</span>
                <button
                  type="button"
                  onClick={() => removeRequiredPhrase(idx)}
                  className="hover:text-rose-600"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <input
              type="text"
              value={newRequiredPhrase}
              onChange={(e) => setNewRequiredPhrase(e.target.value)}
              placeholder="e.g. SOC2 Type II certified"
              className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
            />
            <button
              type="button"
              onClick={addRequiredPhrase}
              className="px-3 py-1.5 bg-slate-900 text-white text-xs rounded-lg shrink-0"
            >
              Add Phrase
            </button>
          </div>
        </div>

        {/* Card 4: Disallowed Words & Claims */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            Prohibited Words & Over-Promises
          </h3>
          <p className="text-[11px] text-slate-500">
            Terms that must never be generated in brand content.
          </p>

          <div className="flex flex-wrap gap-2">
            {guidelines.prohibited_words.map((word, idx) => (
              <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 text-xs">
                <span>{word}</span>
                <button
                  type="button"
                  onClick={() => removeProhibitedWord(idx)}
                  className="hover:text-rose-900"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <input
              type="text"
              value={newProhibitedWord}
              onChange={(e) => setNewProhibitedWord(e.target.value)}
              placeholder="e.g. guaranteed 100%"
              className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
            />
            <button
              type="button"
              onClick={addProhibitedWord}
              className="px-3 py-1.5 bg-slate-900 text-white text-xs rounded-lg shrink-0"
            >
              Add Term
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

