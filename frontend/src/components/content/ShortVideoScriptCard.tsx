import React, { useState } from "react";
import {
  Copy,
  Check,
  RefreshCw,
  FileSearch,
  Video,
  Clock,
  Sparkles,
  Play,
  Volume2,
  Type,
  Camera,
  Edit3,
  Eye
} from "lucide-react";
import { ShortVideoScript, Campaign } from "@/types";

interface ShortVideoScriptCardProps {
  script: ShortVideoScript;
  campaign: Campaign;
  onUpdateContent: (updatedText: string) => void;
  onRegenerate: (customInstruction?: string) => void;
  onAuditTraceability: () => void;
  isRegenerating: boolean;
}

export const ShortVideoScriptCard: React.FC<ShortVideoScriptCardProps> = ({
  script,
  campaign,
  onUpdateContent,
  onRegenerate,
  onAuditTraceability,
  isRegenerating,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(script.full_content);
  const [hasCopied, setHasCopied] = useState(false);
  const [showRegenModal, setShowRegenModal] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(isEditing ? editedText : script.full_content);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleSaveEdit = () => {
    onUpdateContent(editedText);
    setIsEditing(false);
  };

  const handleTriggerRegen = () => {
    onRegenerate(customPrompt.trim() || undefined);
    setShowRegenModal(false);
    setCustomPrompt("");
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-subtle">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
            Short-Video Script ({script.duration_seconds}s)
          </span>
          <span className="text-xs text-slate-500 font-medium">
            {script.target_platforms.join(" • ")}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              isEditing
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {isEditing ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
            <span>{isEditing ? "Storyboard View" : "Edit Script Text"}</span>
          </button>

          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-lg shadow-sm"
          >
            {hasCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{hasCopied ? "Copied!" : "Copy Full Script"}</span>
          </button>

          <button
            onClick={() => setShowRegenModal(true)}
            disabled={isRegenerating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 rounded-lg shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? "animate-spin" : ""}`} />
            <span>Regenerate</span>
          </button>

          <button
            onClick={onAuditTraceability}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-lg shadow-sm"
          >
            <FileSearch className="w-3.5 h-3.5" />
            <span>Audit Traceability</span>
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Raw Script Editor</span>
            <span className="text-[11px] text-slate-400">Timestamps, narration, and on-screen cues</span>
          </div>
          <textarea
            rows={14}
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="w-full p-4 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 leading-relaxed"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setEditedText(script.full_content);
                setIsEditing(false);
              }}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg shadow-sm"
            >
              Save Script Edits
            </button>
          </div>
        </div>
      ) : (
        /* Video Storyboard Timeline */
        <div className="space-y-4 max-w-3xl mx-auto">
          {/* Script Title & Opening Hook Card */}
          <div className="bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200 rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 fill-rose-600" />
                <span>3-Second Scroll-Stopping Hook</span>
              </span>
              <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>~{script.duration_seconds}s Total Runtime</span>
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-900 leading-snug">
              &ldquo;{script.opening_hook}&rdquo;
            </p>
          </div>

          {/* Scenes Timeline */}
          <div className="space-y-3">
            {script.scenes.map((scene) => (
              <div
                key={scene.scene_number}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle hover:border-slate-300 transition-colors space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">
                      {scene.scene_number}
                    </span>
                    <span>Scene {scene.scene_number}</span>
                  </span>
                  <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {scene.timestamp_range}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {/* Spoken Narration */}
                  <div className="p-3 bg-slate-50 rounded-xl space-y-1 md:col-span-1">
                    <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                      <Volume2 className="w-3 h-3 text-indigo-600" />
                      <span>Spoken Narration</span>
                    </div>
                    <p className="text-slate-800 font-medium leading-relaxed">
                      &ldquo;{scene.spoken_narration}&rdquo;
                    </p>
                  </div>

                  {/* On-Screen Text */}
                  <div className="p-3 bg-indigo-50/50 border border-indigo-100/60 rounded-xl space-y-1 md:col-span-1">
                    <div className="text-[11px] font-semibold text-indigo-700 flex items-center gap-1">
                      <Type className="w-3 h-3 text-indigo-600" />
                      <span>On-Screen Kinetic Text</span>
                    </div>
                    <p className="font-bold text-indigo-950 uppercase tracking-tight">
                      {scene.on_screen_text}
                    </p>
                  </div>

                  {/* Visual & B-Roll */}
                  <div className="p-3 bg-amber-50/50 border border-amber-100/60 rounded-xl space-y-1 md:col-span-1">
                    <div className="text-[11px] font-semibold text-amber-700 flex items-center gap-1">
                      <Camera className="w-3 h-3 text-amber-600" />
                      <span>Visuals / B-Roll Cue</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed text-[11px]">
                      {scene.visual_and_broll}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Video CTA Outro */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono text-indigo-300 uppercase tracking-wider">Outro Call-To-Action</span>
              <p className="text-xs font-semibold text-slate-100">{script.cta}</p>
            </div>
            <span className="text-xs px-2.5 py-1 bg-white/10 rounded-lg text-slate-300 font-mono">
              Final 5 Seconds
            </span>
          </div>
        </div>
      )}

      {/* Modal for Regeneration */}
      {showRegenModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 text-rose-600">
              <Sparkles className="w-5 h-5" />
              <h3 className="text-sm font-bold text-slate-900">Regenerate Video Script</h3>
            </div>
            
            <p className="text-xs text-slate-500 leading-relaxed">
              Regenerate the scene-by-scene script without altering your LinkedIn or Instagram assets.
            </p>

            <textarea
              rows={3}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. Make it a 30-second rapid-fire breakdown with more aggressive sound cues."
              className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRegenModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleTriggerRegen}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-sm"
              >
                Regenerate Script
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
