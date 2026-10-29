import React, { useState } from "react";
import {
  Copy,
  Check,
  RefreshCw,
  FileSearch,
  Eye,
  Edit3,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  Sparkles,
  AlertTriangle
} from "lucide-react";
import { InstagramCaption, Campaign } from "@/types";

interface InstagramCaptionCardProps {
  caption: InstagramCaption;
  campaign: Campaign;
  onUpdateContent: (updatedText: string) => void;
  onRegenerate: (customInstruction?: string) => void;
  onAuditTraceability: () => void;
  isRegenerating: boolean;
}

export const InstagramCaptionCard: React.FC<InstagramCaptionCardProps> = ({
  caption,
  campaign,
  onUpdateContent,
  onRegenerate,
  onAuditTraceability,
  isRegenerating,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(caption.full_content);
  const [hasCopied, setHasCopied] = useState(false);
  const [showRegenModal, setShowRegenModal] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(isEditing ? editedText : caption.full_content);
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

  const currentText = isEditing ? editedText : caption.full_content;

  return (
    <div className="space-y-4">
      {/* Top Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-subtle">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md bg-pink-50 text-pink-700 text-xs font-semibold border border-pink-200">
            Instagram Caption
          </span>
          <span className="text-xs text-slate-500">
            {currentText.length} chars • {currentText.trim().split(/\s+/).length} words
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
            <span>{isEditing ? "View Feed Preview" : "Edit Text"}</span>
          </button>

          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-lg shadow-sm"
          >
            {hasCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{hasCopied ? "Copied!" : "Copy Caption"}</span>
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
            <span className="text-xs font-semibold text-slate-700">Edit Caption</span>
            <span className="text-[11px] text-slate-400">Include relevant hashtags & clean line breaks</span>
          </div>
          <textarea
            rows={12}
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="w-full p-4 text-xs font-sans bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 leading-relaxed"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setEditedText(caption.full_content);
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
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        /* Realistic Instagram Card Preview */
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle max-w-lg mx-auto space-y-4">
          {/* IG Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full p-[2px] bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600">
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-[10px] font-bold text-slate-900">
                  {campaign.brand_guidelines.brand_name.slice(0, 2).toUpperCase()}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 leading-none">
                  {campaign.brand_guidelines.brand_name.toLowerCase().replace(/\s+/g, "_")}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Original Repurposed Content</p>
              </div>
            </div>
            <span className="text-slate-400 font-bold">•••</span>
          </div>

          {/* Visual Placeholder */}
          <div className="w-full aspect-square bg-gradient-to-br from-slate-900 to-indigo-950 rounded-xl p-6 flex flex-col justify-between text-white shadow-inner relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="text-[11px] font-mono text-indigo-300 uppercase tracking-widest">
              Tech Breakdown
            </div>
            <div className="space-y-2">
              <h4 className="text-base font-bold text-white tracking-tight leading-snug">
                {campaign.title}
              </h4>
              <p className="text-xs text-slate-300 line-clamp-3">
                {caption.hook}
              </p>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Swipe for architecture blueprint 👉
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center justify-between text-slate-800">
            <div className="flex items-center gap-4">
              <Heart className="w-5 h-5 hover:text-rose-500 cursor-pointer" />
              <MessageCircle className="w-5 h-5 hover:text-slate-600 cursor-pointer" />
              <Send className="w-5 h-5 hover:text-slate-600 cursor-pointer" />
            </div>
            <Bookmark className="w-5 h-5 hover:text-slate-600 cursor-pointer" />
          </div>

          {/* Caption text */}
          <div className="text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">
            <span className="font-bold text-slate-900 mr-1.5">
              {campaign.brand_guidelines.brand_name.toLowerCase().replace(/\s+/g, "_")}
            </span>
            {caption.full_content}
          </div>
        </div>
      )}

      {/* Modal for Regeneration */}
      {showRegenModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 text-pink-600">
              <Sparkles className="w-5 h-5" />
              <h3 className="text-sm font-bold text-slate-900">Regenerate Instagram Caption</h3>
            </div>
            
            <p className="text-xs text-slate-500 leading-relaxed">
              Regenerate this Instagram caption while keeping other platforms untouched.
            </p>

            <textarea
              rows={3}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. Include more emojis and focus on the P99 latency metric."
              className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20"
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
                className="px-4 py-1.5 bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold rounded-lg shadow-sm"
              >
                Regenerate Caption
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
