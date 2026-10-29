import React from "react";
import {
  Plus,
  Sparkles,
  FileSearch,
  ArrowRight,
  Clock,
  Layers,
  ShieldCheck,
  CheckCircle2,
  FileText,
  AlertCircle
} from "lucide-react";
import { Campaign, ViewMode } from "@/types";
import { formatDate } from "@/lib/utils";

interface DashboardViewProps {
  campaigns: Campaign[];
  onNavigate: (view: ViewMode) => void;
  onSelectCampaign: (campaign: Campaign, targetView?: ViewMode) => void;
  onLoadSample: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  campaigns,
  onNavigate,
  onSelectCampaign,
  onLoadSample,
}) => {
  const totalCampaigns = campaigns.length;
  const totalAssets = campaigns.reduce(
    (acc, c) => acc + c.selected_platforms.length,
    0
  );
  const totalClaimsAudited = campaigns.reduce(
    (acc, c) => acc + c.traceability_report.length,
    0
  );
  const totalSupportedClaims = campaigns.reduce(
    (acc, c) =>
      acc +
      c.traceability_report.filter(
        (r) => r.status === "Supported by Source"
      ).length,
    0
  );
  const groundedRatio =
    totalClaimsAudited > 0
      ? Math.round((totalSupportedClaims / totalClaimsAudited) * 100)
      : 100;

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-2">
      {/* Welcome Hero Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Factual Grounding & Multi-Platform Repurposing</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Turn approved long-form content into high-converting social assets
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            RepurposeIQ converts technical whitepapers, blog posts, case studies, and product releases into LinkedIn posts, Instagram carousels, and Reels/Shorts scripts—with verifiable source-to-post evidence traceability.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
          <button
            onClick={() => onNavigate("create")}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-200 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Campaign</span>
          </button>
          <button
            onClick={onLoadSample}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-all"
          >
            <span>Try Sample Study</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards (Only reflects actual stored data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Campaigns</span>
            <span className="p-2 rounded-lg bg-slate-100 text-slate-600">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{totalCampaigns}</p>
          <p className="text-[11px] text-slate-400 mt-1">Generated and stored locally</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Repurposed Assets</span>
            <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{totalAssets}</p>
          <p className="text-[11px] text-slate-400 mt-1">LinkedIn, IG & video scripts</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Audited Claims</span>
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <FileSearch className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{totalClaimsAudited}</p>
          <p className="text-[11px] text-slate-400 mt-1">Mapped to source excerpts</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Grounding Confidence</span>
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-2">
            {totalClaimsAudited > 0 ? `${groundedRatio}%` : "100%"}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Direct source alignment</p>
        </div>
      </div>

      {/* Recent Campaigns Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">Recent Repurposing Campaigns</h3>
            <p className="text-xs text-slate-500">Review generated platform drafts and evidence traceability</p>
          </div>
          {campaigns.length > 0 && (
            <button
              onClick={() => onNavigate("library")}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>View all in library</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {campaigns.length === 0 ? (
          /* Clean empty state */
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-slate-800 text-sm">No campaigns generated yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Ready to repurpose your first article or case study? Paste your content or load a pre-built case study template.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => onNavigate("create")}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm"
              >
                Create First Campaign
              </button>
              <button
                onClick={onLoadSample}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
              >
                Load Sample Case Study
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {campaigns.slice(0, 5).map((campaign) => (
              <div
                key={campaign.id}
                className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 p-3 rounded-xl transition-colors"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <h4
                      onClick={() => onSelectCampaign(campaign, "content")}
                      className="font-semibold text-slate-900 text-xs hover:text-indigo-600 cursor-pointer"
                    >
                      {campaign.title}
                    </h4>
                    {campaign.brand_violations.length > 0 && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        {campaign.brand_violations.length} Brand Notice
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    Goal: {campaign.campaign_goal} • Target: {campaign.target_audience}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(campaign.created_at)}
                    </span>
                    <span>•</span>
                    <span>{campaign.source_analysis.word_count} source words</span>
                    <span>•</span>
                    <span className="text-emerald-600 font-medium">
                      {campaign.traceability_report.length} claims verified
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onSelectCampaign(campaign, "content")}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-sm"
                  >
                    View Drafts
                  </button>
                  <button
                    onClick={() => onSelectCampaign(campaign, "traceability")}
                    className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg"
                  >
                    Traceability Audit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

