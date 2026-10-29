import React, { useState } from "react";
import {
  Copy,
  Check,
  RefreshCw,
  FileSearch,
  Eye,
  Edit3,
  ThumbsUp,
  MessageSquare,
  Share2,
  Send,
  Sparkles,
  AlertTriangle
} from "lucide-react";
import { LinkedInPost, Campaign } from "@/types";

interface LinkedInCardProps {
  post: LinkedInPost;
  campaign: Campaign;
  onUpdateContent: (updatedText: string) => void;
  onRegenerate: (customInstruction?: string) => void;
  onAuditTraceability: () => void;
  isRegenerating: boolean;
}

export const LinkedInCard: React.FC<LinkedInCardProps> = ({
  post,
  campaign,
  onUpdateContent,
  onRegenerate,
  onAuditTraceability,
  isRegenerating,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(post.full_content);
  const [hasCopied, setHasCopied] = useState(false);
  const [showRegenModal, setShowRegenModal] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(isEditing ? editedText : post.full_content);
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

  const currentText = isEditing ? editedText : post.full_content;
  const charCount = currentText.length;
  const wordCount = currentText.trim().split(/\s+/).length;

  return (
    <div className="space-y-4">
      {/* Top Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-subtle">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
            LinkedIn Feed Post
          </span>
          <span className="text-xs text-slate-500">
            {charCount} chars • {wordCount} words • {post.estimated_read_time}
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
            <span>{hasCopied ? "Copied!" : "Copy Post"}</span>
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

      {/* Editor or Preview Mode */}
      {isEditing ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Manual Edit Mode</span>
            <span className="text-[11px] text-slate-400">Edits are saved directly to this campaign</span>
          </div>
          <textarea
            rows={14}
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="w-full p-4 text-xs font-sans bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 leading-relaxed"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setEditedText(post.full_content);
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
              Save Draft Edits
            </button>
          </div>
        </div>
      ) : (
        /* Realistic LinkedIn Feed Preview */
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle max-w-2xl mx-auto space-y-4">
          {/* Post Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                AI
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {campaign.brand_guidelines.brand_name}
                </p>
                <p className="text-[11px] text-slate-500">
                  Engineering & Enterprise Systems • 4d • 🌐
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              Preview Mode
            </span>
          </div>

          {/* Post Content */}
          <div className="text-xs text-slate-800 leading-relaxed space-y-3 font-sans whitespace-pre-wrap">
            {isExpanded ? (
              post.full_content
            ) : (
              <>
                <p className="font-semibold text-slate-900">{post.hook}</p>
                <p className="line-clamp-4">
                  {post.body}
                </p>
                <button
                  onClick={() => setIsExpanded(true)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer block"
                >
                  ...see more
                </button>
              </>
            )}
          </div>

          {/* Social Stats Sim */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[9px] text-white">👍</span>
              <span>184 reactions</span>
            </span>
            <span>29 comments • 14 reposts</span>
          </div>

          {/* Action Row */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-4 gap-1 text-slate-600">
            <button className="flex items-center justify-center gap-1.5 py-1.5 text-xs hover:bg-slate-50 rounded-lg">
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>Like</span>
            </button>
            <button className="flex items-center justify-center gap-1.5 py-1.5 text-xs hover:bg-slate-50 rounded-lg">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Comment</span>
            </button>
            <button className="flex items-center justify-center gap-1.5 py-1.5 text-xs hover:bg-slate-50 rounded-lg">
              <Share2 className="w-3.5 h-3.5" />
              <span>Repost</span>
            </button>
            <button className="flex items-center justify-center gap-1.5 py-1.5 text-xs hover:bg-slate-50 rounded-lg">
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </div>
        </div>
      )}

      {/* Regeneration Modal */}
      {showRegenModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 text-indigo-600">
              <Sparkles className="w-5 h-5" />
              <h3 className="text-sm font-bold text-slate-900">Regenerate LinkedIn Post</h3>
            </div>
            
            <p className="text-xs text-slate-500 leading-relaxed">
              Regenerate this LinkedIn draft while preserving all your other platform outputs. Add an optional custom direction below:
            </p>

            <textarea
              rows={3}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. Focus more aggressively on the 42% cost reduction and make the hook shorter."
              className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px] flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <span>Regenerating will replace your current LinkedIn draft. Manual edits will be refreshed.</span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRegenModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleTriggerRegen}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm"
              >
                Regenerate Asset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
