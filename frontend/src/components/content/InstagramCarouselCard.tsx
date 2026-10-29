import React, { useState } from "react";
import {
  Copy,
  Check,
  RefreshCw,
  FileSearch,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  Palette,
  FileText,
  Edit3,
  Eye
} from "lucide-react";
import { InstagramCarousel, Campaign } from "@/types";

interface InstagramCarouselCardProps {
  carousel: InstagramCarousel;
  campaign: Campaign;
  onUpdateContent: (updatedText: string) => void;
  onRegenerate: (customInstruction?: string) => void;
  onAuditTraceability: () => void;
  isRegenerating: boolean;
}

export const InstagramCarouselCard: React.FC<InstagramCarouselCardProps> = ({
  carousel,
  campaign,
  onUpdateContent,
  onRegenerate,
  onAuditTraceability,
  isRegenerating,
}) => {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(carousel.full_content);
  const [hasCopied, setHasCopied] = useState(false);
  const [showRegenModal, setShowRegenModal] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");

  const slides = carousel.slides || [];
  const currentSlide = slides[activeSlideIndex] || slides[0];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(isEditing ? editedText : carousel.full_content);
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
      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-subtle">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-200">
            Instagram Carousel ({slides.length} Slides)
          </span>
          <span className="text-xs text-slate-500 font-medium">
            {carousel.theme_title}
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
            <span>{isEditing ? "Carousel Deck Preview" : "Edit All Slides"}</span>
          </button>

          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-lg shadow-sm"
          >
            {hasCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{hasCopied ? "Copied!" : "Copy Deck Text"}</span>
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
            <span className="text-xs font-semibold text-slate-700">Edit Carousel Slides & Visual Directives</span>
            <span className="text-[11px] text-slate-400">Maintains slide numbers and visual guidance</span>
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
                setEditedText(carousel.full_content);
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
              Save Deck Edits
            </button>
          </div>
        </div>
      ) : (
        /* Interactive Carousel Deck Viewer */
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle max-w-xl mx-auto space-y-5">
            {/* Slide Navigation Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center">
                  {currentSlide?.slide_number || 1}
                </span>
                <span className="text-xs font-semibold text-slate-800">
                  Slide {activeSlideIndex + 1} of {slides.length}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveSlideIndex(Math.max(0, activeSlideIndex - 1))}
                  disabled={activeSlideIndex === 0}
                  className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-slate-50 text-slate-600"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveSlideIndex(Math.min(slides.length - 1, activeSlideIndex + 1))}
                  disabled={activeSlideIndex === slides.length - 1}
                  className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-slate-50 text-slate-600"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Slide Display Card */}
            {currentSlide && (
              <div className="w-full aspect-square bg-slate-900 rounded-xl p-8 flex flex-col justify-between text-white shadow-md relative overflow-hidden">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>{campaign.brand_guidelines.brand_name.toUpperCase()}</span>
                  <span>{currentSlide.slide_number} / {slides.length}</span>
                </div>

                <div className="space-y-3 my-auto">
                  <h3 className="text-lg font-bold text-white tracking-tight leading-snug">
                    {currentSlide.slide_title}
                  </h3>
                  <div className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
                    {currentSlide.slide_body}
                  </div>
                </div>

                {/* Visual Art Direction Note Box */}
                <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-2.5 text-[11px] text-purple-300 flex items-start gap-2">
                  <Palette className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">Visual Art Direction: </span>
                    <span>{currentSlide.visual_description}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Slide Thumbnail Dots */}
            <div className="flex justify-center gap-1.5 pt-1">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlideIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === activeSlideIndex ? "w-6 bg-purple-600" : "w-2 bg-slate-200 hover:bg-slate-300"
                  }`}
                />
              ))}
            </div>

            {/* Accompanying Post Caption */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs text-slate-700">
              <span className="font-semibold text-slate-900 block">Accompanying Post Caption:</span>
              <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">{carousel.caption}</p>
            </div>
          </div>
        </div>
      )}

      {/* Regeneration Modal */}
      {showRegenModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 text-purple-600">
              <Sparkles className="w-5 h-5" />
              <h3 className="text-sm font-bold text-slate-900">Regenerate Instagram Carousel</h3>
            </div>
            
            <p className="text-xs text-slate-500 leading-relaxed">
              Regenerate the entire carousel slide breakdown while keeping other platform drafts intact.
            </p>

            <textarea
              rows={3}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. Expand to 7 slides and detail the canary deployment rollout in slide 4."
              className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
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
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shadow-sm"
              >
                Regenerate Carousel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
