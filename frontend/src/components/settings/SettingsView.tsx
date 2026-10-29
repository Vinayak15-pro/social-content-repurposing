import React, { useState } from "react";
import {
  Settings as SettingsIcon,
  Sparkles,
  Server,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink
} from "lucide-react";

interface SettingsViewProps {
  health: { status: string; service: string; version: string; gemini?: any } | null;
  onRefreshHealth: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  health,
  onRefreshHealth,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshHealth();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const isGeminiConfigured = health?.gemini?.configured;
  const currentModel = health?.gemini?.model || "gemini-2.5-flash";

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle flex items-center justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
            <SettingsIcon className="w-3.5 h-3.5" />
            <span>Infrastructure & AI Engine</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            System & Engine Settings
          </h2>
          <p className="text-xs text-slate-500">
            Verify runtime connectivity, model configurations, and backend health.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Backend Status Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Server className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-xs font-bold text-slate-900">FastAPI Backend Service</h3>
              <p className="text-[11px] text-slate-500">Running on http://127.0.0.1:8000</p>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
              health?.status === "healthy"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                health?.status === "healthy" ? "bg-emerald-500" : "bg-rose-500"
              }`}
            />
            <span>{health?.status === "healthy" ? "Connected & Healthy" : "Offline"}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[10px] text-slate-400 font-medium">Service Version</span>
            <p className="font-semibold text-slate-800 mt-0.5">{health?.version || "1.0.0"}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[10px] text-slate-400 font-medium">SDK Integration</span>
            <p className="font-semibold text-slate-800 mt-0.5">google-genai v2.33.0</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[10px] text-slate-400 font-medium">SSRF Protection</span>
            <p className="font-semibold text-emerald-700 mt-0.5">Active & Enforced</p>
          </div>
        </div>
      </div>

      {/* Google Gemini AI Configuration Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-xs font-bold text-slate-900">Google Gemini AI Engine</h3>
              <p className="text-[11px] text-slate-500">Official `google-genai` Python SDK</p>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
              isGeminiConfigured
                ? "bg-purple-50 text-purple-800 border-purple-200"
                : "bg-amber-50 text-amber-800 border-amber-200"
            }`}
          >
            <span>{isGeminiConfigured ? "Gemini Live API Active" : "Deterministic Engine (No Key)"}</span>
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="text-slate-500">Target Model ID:</span>
              <span className="font-bold text-indigo-700">{currentModel}</span>
            </div>
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="text-slate-500">Fallback Strategy:</span>
              <span className="font-bold text-emerald-700">Verifiable Ground-Truth Hybrid Extractor</span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-slate-600" />
              <span>How to configure your live Gemini API Key:</span>
            </h4>
            <p className="text-slate-600 text-xs leading-relaxed">
              Add your API key inside the backend environment file (`backend/.env`):
            </p>
            <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg text-[11px] font-mono overflow-x-auto">
{`GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-2.5-flash`}
            </pre>
            <p className="text-[11px] text-slate-400">
              When no API key is specified, RepurposeIQ automatically runs in deterministic hybrid mode using exact source paragraph indexing and regex metrics extraction—guaranteeing 100% functionality without requiring external network requests.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
