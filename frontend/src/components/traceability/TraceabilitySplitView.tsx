import React, { useState } from "react";
import {
  FileSearch,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  Info,
  Filter,
  ArrowRight,
  Bookmark,
  ExternalLink,
  ShieldCheck,
  Search
} from "lucide-react";
import { Campaign, ClaimVerification, TraceabilityStatus } from "@/types";
import { getStatusBadgeClasses } from "@/lib/utils";

interface TraceabilitySplitViewProps {
  campaign: Campaign;
}

export const TraceabilitySplitView: React.FC<TraceabilitySplitViewProps> = ({
  campaign,
}) => {
  const claims = campaign.traceability_report || [];
  const paragraphs = campaign.source_analysis?.paragraphs || [];

  // Filter state
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClaimId, setSelectedClaimId] = useState<string>(
    claims[0]?.claim_id || ""
  );

  // Filter logic
  const filteredClaims = claims.filter((c) => {
    if (selectedStatus !== "ALL" && c.status !== selectedStatus) return false;
    if (selectedPlatform !== "ALL" && c.platform !== selectedPlatform) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.claim_text.toLowerCase().includes(q) ||
        c.claim_location.toLowerCase().includes(q) ||
        (c.matching_excerpt && c.matching_excerpt.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const activeClaim =
    claims.find((c) => c.claim_id === selectedClaimId) ||
    filteredClaims[0] ||
    claims[0];

  // Metrics summary
  const supportedCount = claims.filter((c) => c.status === "Supported by Source").length;
  const partialCount = claims.filter((c) => c.status === "Partially Supported").length;
  const notFoundCount = claims.filter((c) => c.status === "Not Found in Source").length;
  const creativeCount = claims.filter(
    (c) => c.status === "Creative Suggestion — Not a Factual Claim"
  ).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 py-2">
      {/* Signature Feature Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Signature Fact-Grounding Engine</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Source-to-Post Traceability Workspace
            </h2>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              Every factual assertion in generated social copy is audited against approved source paragraphs. Select any claim below to inspect its exact verbatim source passage and confidence score.
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
              {supportedCount} Supported
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-medium">
              {partialCount} Partial
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 font-medium">
              {notFoundCount} Not Found
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200 font-medium">
              {creativeCount} Creative
            </span>
          </div>
        </div>

        {/* Advisory Note */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-start gap-2">
          <Info className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
          <span>
            Traceability assists editorial and legal review by pointing out source citations. It does not replace human editorial sign-off before official publication.
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-subtle flex flex-wrap items-center justify-between gap-3">
        {/* Status Filters */}
        <div className="flex items-center gap-1 overflow-x-auto text-xs">
          <button
            onClick={() => setSelectedStatus("ALL")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              selectedStatus === "ALL"
                ? "bg-slate-900 text-white font-semibold"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            All Claims ({claims.length})
          </button>
          <button
            onClick={() => setSelectedStatus("Supported by Source")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              selectedStatus === "Supported by Source"
                ? "bg-emerald-600 text-white font-semibold"
                : "text-slate-600 hover:bg-emerald-50"
            }`}
          >
            Supported ({supportedCount})
          </button>
          <button
            onClick={() => setSelectedStatus("Partially Supported")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              selectedStatus === "Partially Supported"
                ? "bg-amber-600 text-white font-semibold"
                : "text-slate-600 hover:bg-amber-50"
            }`}
          >
            Partially Supported ({partialCount})
          </button>
          <button
            onClick={() => setSelectedStatus("Not Found in Source")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              selectedStatus === "Not Found in Source"
                ? "bg-rose-600 text-white font-semibold"
                : "text-slate-600 hover:bg-rose-50"
            }`}
          >
            Not Found ({notFoundCount})
          </button>
          <button
            onClick={() => setSelectedStatus("Creative Suggestion — Not a Factual Claim")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              selectedStatus === "Creative Suggestion — Not a Factual Claim"
                ? "bg-indigo-600 text-white font-semibold"
                : "text-slate-600 hover:bg-indigo-50"
            }`}
          >
            Creative Suggestions ({creativeCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-60">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search claims or excerpts..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* Main Split-Panel Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Claims Directory (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-4 shadow-subtle space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Generated Claims ({filteredClaims.length})
            </h3>
            <span className="text-[11px] text-slate-400">Click claim to trace</span>
          </div>

          {filteredClaims.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No claims match your selected filter criteria.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
              {filteredClaims.map((claim) => {
                const isSelected = activeClaim?.claim_id === claim.claim_id;
                const badge = getStatusBadgeClasses(claim.status);

                return (
                  <div
                    key={claim.claim_id}
                    onClick={() => setSelectedClaimId(claim.claim_id)}
                    className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-tight">
                        {claim.platform} • {claim.claim_location}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}
                      >
                        {claim.status}
                      </span>
                    </div>

                    <p className="text-slate-800 font-medium leading-relaxed line-clamp-3">
                      &ldquo;{claim.claim_text}&rdquo;
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span>
                        Confidence: {Math.round(claim.confidence_score * 100)}%
                      </span>
                      {claim.source_paragraph_index !== null && claim.source_paragraph_index !== undefined ? (
                        <span className="text-indigo-600 font-medium flex items-center gap-1">
                          <span>Para {claim.source_paragraph_index + 1}</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      ) : (
                        <span className="text-slate-400">Non-Factual</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Evidence Verification & Source Inspector (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Claim Spotlight Card */}
          {activeClaim ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Claim Verification Dossier
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                    {activeClaim.platform} — {activeClaim.claim_location}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                      getStatusBadgeClasses(activeClaim.status).bg
                    } ${getStatusBadgeClasses(activeClaim.status).text} ${
                      getStatusBadgeClasses(activeClaim.status).border
                    }`}
                  >
                    {activeClaim.status}
                  </span>
                </div>
              </div>

              {/* Exact Claim Text */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-500">
                  Target Social Claim:
                </span>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium leading-relaxed">
                  &ldquo;{activeClaim.claim_text}&rdquo;
                </div>
              </div>

              {/* Ground Truth Source Excerpt */}
              {activeClaim.matching_excerpt ? (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Verbatim Supporting Source Excerpt:</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      Paragraph {Number(activeClaim.source_paragraph_index) + 1}
                    </span>
                  </div>
                  <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl text-xs text-emerald-950 font-serif leading-relaxed italic">
                    &ldquo;{activeClaim.matching_excerpt}&rdquo;
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 italic">
                  {activeClaim.is_creative_suggestion
                    ? "This statement is a stylistic hook, transitional question, or call to action. No factual verification against source paragraphs is required."
                    : "No matching passage found in the approved source document."}
                </div>
              )}

              {/* Verification Rationale & Fix */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="text-xs space-y-1">
                  <span className="font-semibold text-slate-700">Audit Finding:</span>
                  <p className="text-slate-600 leading-relaxed">
                    {activeClaim.verification_explanation}
                  </p>
                </div>

                {activeClaim.suggested_fix && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                    <span className="font-semibold flex items-center gap-1 text-amber-800">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Suggested Remediation:</span>
                    </span>
                    <p className="text-amber-800">{activeClaim.suggested_fix}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-500">
              Select a claim on the left to view evidence.
            </div>
          )}

          {/* Full Source Document Browser */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Approved Source Document Material
                </h3>
                <p className="text-[11px] text-slate-500">
                  Total of {paragraphs.length} paragraphs indexed with precise offsets
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {campaign.source_analysis?.word_count} words
              </span>
            </div>

            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
              {paragraphs.map((p) => {
                const isMatchingPara =
                  activeClaim &&
                  activeClaim.source_paragraph_index === p.index;

                return (
                  <div
                    key={p.index}
                    className={`p-3.5 rounded-xl border text-xs transition-all ${
                      isMatchingPara
                        ? "border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500"
                        : "border-slate-100 bg-slate-50/50 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1.5">
                      <span className="font-bold text-slate-600">
                        Paragraph {p.index + 1}
                        {p.section_title ? ` • ${p.section_title}` : ""}
                      </span>
                      {isMatchingPara && (
                        <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-semibold">
                          Active Citation
                        </span>
                      )}
                    </div>
                    <p className="text-slate-800 font-serif leading-relaxed">
                      {p.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

