import React from "react";
import {
  LayoutDashboard,
  PlusCircle,
  FolderKanban,
  ShieldCheck,
  Settings as SettingsIcon,
  Sparkles,
  FileSearch,
  Layers,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { ViewMode, Campaign } from "@/types";

interface SidebarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  activeCampaign: Campaign | null;
  health: { status: string; gemini?: { configured: boolean; model: string } } | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  activeCampaign,
  health,
}) => {
  const isGeminiReady = health?.gemini?.configured;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 select-none z-20">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-semibold text-slate-900 text-sm tracking-tight">RepurposeIQ</h1>
            <p className="text-[11px] text-slate-500 font-medium">Content Pipeline</p>
          </div>
        </div>
        <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
          v1.0
        </span>
      </div>

      {/* Primary Navigation */}
      <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        <div>
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Workspace
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => onNavigate("dashboard")}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                currentView === "dashboard"
                  ? "bg-indigo-50 text-indigo-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => onNavigate("create")}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                currentView === "create"
                  ? "bg-indigo-50 text-indigo-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Campaign</span>
            </button>

            <button
              onClick={() => onNavigate("library")}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                currentView === "library"
                  ? "bg-indigo-50 text-indigo-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <FolderKanban className="w-4 h-4" />
              <span>Content Library</span>
            </button>

            <button
              onClick={() => onNavigate("brand")}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                currentView === "brand"
                  ? "bg-indigo-50 text-indigo-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Brand Guidelines</span>
            </button>

            <button
              onClick={() => onNavigate("settings")}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                currentView === "settings"
                  ? "bg-indigo-50 text-indigo-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <SettingsIcon className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Active Campaign Scope (When a campaign exists) */}
        {activeCampaign && (
          <div className="pt-2 border-t border-slate-100">
            <div className="px-3 pb-2 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Active Campaign
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <div className="px-3 py-1.5 mb-2 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs font-medium text-slate-800 truncate" title={activeCampaign.title}>
                {activeCampaign.title}
              </p>
              <p className="text-[10px] text-slate-400">
                {activeCampaign.selected_platforms.length} platform assets
              </p>
            </div>

            <nav className="space-y-1">
              <button
                onClick={() => onNavigate("content")}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                  currentView === "content"
                    ? "bg-indigo-50 text-indigo-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>Generated Content</span>
              </button>

              <button
                onClick={() => onNavigate("traceability")}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                  currentView === "traceability"
                    ? "bg-indigo-50 text-indigo-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <FileSearch className="w-4 h-4 text-emerald-600" />
                <span>Source Traceability</span>
                <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {activeCampaign.traceability_report.length}
                </span>
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Backend & AI Provider Status Bar */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/70">
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                health?.status === "healthy" ? "bg-emerald-500" : "bg-rose-500"
              }`}
            />
            <span className="font-medium">
              {health?.status === "healthy" ? "FastAPI Online" : "Backend Offline"}
            </span>
          </div>
          <span className="text-[10px] font-medium text-slate-400">
            {isGeminiReady ? "Gemini 2.5 Active" : "Hybrid Mode"}
          </span>
        </div>
      </div>
    </aside>
  );
};

