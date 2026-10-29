import React, { useState } from "react";
import {
  FolderKanban,
  Search,
  FileText,
  Clock,
  Sparkles,
  FileSearch,
  Download,
  Trash2,
  ExternalLink,
  ChevronDown
} from "lucide-react";
import { Campaign, ViewMode } from "@/types";
import { formatDate } from "@/lib/utils";
import { api } from "@/lib/api";

interface ContentLibraryViewProps {
  campaigns: Campaign[];
  onSelectCampaign: (campaign: Campaign, view: ViewMode) => void;
  onDeleteCampaign: (id: string) => void;
  onNavigate: (view: ViewMode) => void;
}

export const ContentLibraryView: React.FC<ContentLibraryViewProps> = ({
  campaigns,
  onSelectCampaign,
  onDeleteCampaign,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [exportMenuId, setExportMenuId] = useState<string | null>(null);

  const filtered = campaigns.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.campaign_goal.toLowerCase().includes(q) ||
      c.target_audience.toLowerCase().includes(q) ||
      c.keywords.some((k) => k.toLowerCase().includes(q))
    );
  });

  const handleExport = (campaignId: string, format: "markdown" | "json" | "csv") => {
    const url = api.getExportUrl(campaignId, format);
    window.open(url, "_blank");
    setExportMenuId(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-2">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100">
            <FolderKanban className="w-4 h-4 text-indigo-600" />
            <span>Repurposed Assets Catalog</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Campaign Content Library
          </h2>
          <p className="text-xs text-slate-500">
            Search, export, and review all generated social media drafts and their associated fact audits.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campaigns or keywords..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* Campaigns List */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <FileText className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-700">No campaigns found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery ? "No campaigns matched your search filter." : "You haven't repurposed any documents yet."}
          </p>
          <button
            onClick={() => onNavigate("create")}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm"
          >
            Create New Campaign
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2">
                  <h4
                    onClick={() => onSelectCampaign(c, "content")}
                    className="font-bold text-slate-900 text-sm hover:text-indigo-600 cursor-pointer"
                  >
                    {c.title}
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                    {c.id}
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-1">
                  Goal: {c.campaign_goal} • Target: {c.target_audience}
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(c.created_at)}
                  </span>
                  <span>•</span>
                  <span>{c.source_analysis?.word_count} words</span>
                  <span>•</span>
                  <span className="text-emerald-600 font-medium">
                    {c.traceability_report?.length || 0} claims audited
                  </span>
                  <span>•</span>
                  <span className="text-indigo-600 font-medium">
                    {c.selected_platforms.length} platform assets
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onSelectCampaign(c, "content")}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-sm"
                >
                  View Drafts
                </button>

                <button
                  onClick={() => onSelectCampaign(c, "traceability")}
                  className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg"
                >
                  Fact Audit
                </button>

                <div className="relative">
                  <button
                    onClick={() => setExportMenuId(exportMenuId === c.id ? null : c.id)}
                    className="p-1.5 text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg"
                    title="Export options"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  {exportMenuId === c.id && (
                    <div className="absolute right-0 mt-1.5 w-36 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-30">
                      <button
                        onClick={() => handleExport(c.id, "markdown")}
                        className="w-full px-3 py-1.5 text-xs text-left hover:bg-slate-50 text-slate-700"
                      >
                        Markdown (.md)
                      </button>
                      <button
                        onClick={() => handleExport(c.id, "json")}
                        className="w-full px-3 py-1.5 text-xs text-left hover:bg-slate-50 text-slate-700"
                      >
                        JSON (.json)
                      </button>
                      <button
                        onClick={() => handleExport(c.id, "csv")}
                        className="w-full px-3 py-1.5 text-xs text-left hover:bg-slate-50 text-slate-700"
                      >
                        Claims CSV (.csv)
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onDeleteCampaign(c.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent rounded-lg"
                  title="Delete campaign"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

