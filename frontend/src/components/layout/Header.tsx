import React, { useState } from "react";
import {
  Download,
  Plus,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  FileText,
  FileCode,
  Table
} from "lucide-react";
import { ViewMode, Campaign } from "@/types";
import { api } from "@/lib/api";

interface HeaderProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  activeCampaign: Campaign | null;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  activeCampaign,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);

  const getTitle = () => {
    switch (currentView) {
      case "dashboard":
        return "Dashboard Overview";
      case "create":
        return "Create Repurposing Campaign";
      case "content":
        return "Generated Social Assets";
      case "traceability":
        return "Source-Fact Traceability Audit";
      case "brand":
        return "Brand Guidelines & Compliance";
      case "library":
        return "Campaign Content Library";
      case "settings":
        return "System Settings & AI Configuration";
      default:
        return "RepurposeIQ Studio";
    }
  };

  const getSubtitle = () => {
    switch (currentView) {
      case "dashboard":
        return "Monitor repurposing throughput, fact-grounding metrics, and recent campaigns";
      case "create":
        return "Transform approved articles, case studies, and product docs into platform-native copy";
      case "content":
        return "Review, edit, and fine-tune platform drafts before sharing";
      case "traceability":
        return "Verify factual grounding: map claims back to exact source paragraphs and evidence";
      case "brand":
        return "Enforce brand voice, required phrases, prohibited terms, and editorial tone";
      case "library":
        return "Browse, export, and manage your catalog of past repurposed assets";
      case "settings":
        return "Configure Google Gemini model parameters and backend connections";
      default:
        return "";
    }
  };

  const handleExport = (format: "markdown" | "json" | "csv") => {
    if (!activeCampaign) return;
    const url = api.getExportUrl(activeCampaign.id, format);
    window.open(url, "_blank");
    setShowExportMenu(false);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h2 className="text-base font-semibold text-slate-900 leading-tight">
          {getTitle()}
        </h2>
        <p className="text-xs text-slate-500 hidden sm:block">
          {getSubtitle()}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {activeCampaign && (currentView === "content" || currentView === "traceability") && (
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-30 animate-in fade-in slide-in-from-top-1">
                <button
                  onClick={() => handleExport("markdown")}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 text-left"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Markdown (.md)</span>
                </button>
                <button
                  onClick={() => handleExport("json")}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 text-left"
                >
                  <FileCode className="w-3.5 h-3.5 text-amber-600" />
                  <span>Full JSON (.json)</span>
                </button>
                <button
                  onClick={() => handleExport("csv")}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 text-left"
                >
                  <Table className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Claims Audit (.csv)</span>
                </button>
              </div>
            )}
          </div>
        )}

        {currentView !== "create" && (
          <button
            onClick={() => onNavigate("create")}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-100 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Campaign</span>
          </button>
        )}
      </div>
    </header>
  );
};
