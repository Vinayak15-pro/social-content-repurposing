import React, { useState } from "react";
import {
  Linkedin,
  Instagram,
  Bookmark,
  Video,
  FileSearch,
  Sparkles,
  Download,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Campaign, ViewMode } from "@/types";
import { LinkedInCard } from "./LinkedInCard";
import { InstagramCaptionCard } from "./InstagramCaptionCard";
import { InstagramCarouselCard } from "./InstagramCarouselCard";
import { ShortVideoScriptCard } from "./ShortVideoScriptCard";
import { api } from "@/lib/api";

interface GeneratedContentViewProps {
  campaign: Campaign;
  onCampaignUpdated: (campaign: Campaign) => void;
  onNavigate: (view: ViewMode) => void;
}

export const GeneratedContentView: React.FC<GeneratedContentViewProps> = ({
  campaign,
  onCampaignUpdated,
  onNavigate,
}) => {
  // Determine available tabs based on selected_platforms
  const platforms = campaign.selected_platforms || ["linkedin", "instagram_caption", "instagram_carousel", "short_video_script"];
  const [activeTab, setActiveTab] = useState<string>(platforms[0] || "linkedin");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setFeedbackNotice(msg);
    setTimeout(() => setFeedbackNotice(null), 3500);
  };

  const handleUpdateContent = async (platformKey: string, newContentText: string) => {
    try {
      const userEdits = {
        ...(campaign.user_edits || {}),
        [platformKey]: newContentText,
      };
      const updated = await api.updateCampaign(campaign.id, { user_edits: userEdits });
      onCampaignUpdated(updated);
      showNotice("Changes saved successfully to campaign.");
    } catch (err: any) {
      showNotice(err.message || "Failed to save edits.");
    }
  };

  const handleRegeneratePlatform = async (platform: string, customInstruction?: string) => {
    setIsRegenerating(true);
    try {
      const payload = {
        campaign_id: campaign.id,
        platform: platform,
        source_text: campaign.source_text,
        campaign_goal: campaign.campaign_goal,
        target_audience: campaign.target_audience,
        brand_voice: campaign.brand_voice,
        key_messages: campaign.key_messages,
        keywords: campaign.keywords,
        required_phrases: campaign.required_phrases,
        prohibited_phrases: campaign.prohibited_phrases,
        call_to_action: campaign.call_to_action,
        custom_instruction: customInstruction,
      };

      const updated = await api.regeneratePlatform(payload);
      onCampaignUpdated(updated);
      showNotice(`Regenerated ${platform.replace("_", " ")} successfully.`);
    } catch (err: any) {
      showNotice(err.message || "Failed to regenerate platform.");
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-2">
      {/* Overview Info Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold">
              Campaign ID: {campaign.id}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">{campaign.source_analysis.word_count} source words</span>
          </div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            {campaign.title}
          </h2>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate("traceability")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 rounded-xl transition-all shadow-sm"
          >
            <FileSearch className="w-3.5 h-3.5 text-emerald-600" />
            <span>View Fact Traceability ({campaign.traceability_report.length} Claims)</span>
          </button>
        </div>
      </div>

      {feedbackNotice && (
        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>{feedbackNotice}</span>
        </div>
      )}

      {/* Platform Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 pb-px overflow-x-auto">
        {campaign.generated_content.linkedin && (
          <button
            onClick={() => setActiveTab("linkedin")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === "linkedin"
                ? "border-indigo-600 text-indigo-600 bg-white rounded-t-lg"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Linkedin className="w-4 h-4 text-blue-600" />
            <span>LinkedIn Post</span>
          </button>
        )}

        {campaign.generated_content.instagram_caption && (
          <button
            onClick={() => setActiveTab("instagram_caption")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === "instagram_caption"
                ? "border-indigo-600 text-indigo-600 bg-white rounded-t-lg"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Instagram className="w-4 h-4 text-pink-600" />
            <span>Instagram Caption</span>
          </button>
        )}

        {campaign.generated_content.instagram_carousel && (
          <button
            onClick={() => setActiveTab("instagram_carousel")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === "instagram_carousel"
                ? "border-indigo-600 text-indigo-600 bg-white rounded-t-lg"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Bookmark className="w-4 h-4 text-purple-600" />
            <span>Instagram Carousel ({campaign.generated_content.instagram_carousel.slides.length} Slides)</span>
          </button>
        )}

        {campaign.generated_content.short_video_script && (
          <button
            onClick={() => setActiveTab("short_video_script")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === "short_video_script"
                ? "border-indigo-600 text-indigo-600 bg-white rounded-t-lg"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Video className="w-4 h-4 text-rose-600" />
            <span>Short-Video Script ({campaign.generated_content.short_video_script.duration_seconds}s)</span>
          </button>
        )}
      </div>

      {/* Active Tab Content Card */}
      <div className="pt-2">
        {activeTab === "linkedin" && campaign.generated_content.linkedin && (
          <LinkedInCard
            post={campaign.generated_content.linkedin}
            campaign={campaign}
            onUpdateContent={(txt) => handleUpdateContent("linkedin", txt)}
            onRegenerate={(instruction) => handleRegeneratePlatform("linkedin", instruction)}
            onAuditTraceability={() => onNavigate("traceability")}
            isRegenerating={isRegenerating}
          />
        )}

        {activeTab === "instagram_caption" && campaign.generated_content.instagram_caption && (
          <InstagramCaptionCard
            caption={campaign.generated_content.instagram_caption}
            campaign={campaign}
            onUpdateContent={(txt) => handleUpdateContent("instagram_caption", txt)}
            onRegenerate={(instruction) => handleRegeneratePlatform("instagram_caption", instruction)}
            onAuditTraceability={() => onNavigate("traceability")}
            isRegenerating={isRegenerating}
          />
        )}

        {activeTab === "instagram_carousel" && campaign.generated_content.instagram_carousel && (
          <InstagramCarouselCard
            carousel={campaign.generated_content.instagram_carousel}
            campaign={campaign}
            onUpdateContent={(txt) => handleUpdateContent("instagram_carousel", txt)}
            onRegenerate={(instruction) => handleRegeneratePlatform("instagram_carousel", instruction)}
            onAuditTraceability={() => onNavigate("traceability")}
            isRegenerating={isRegenerating}
          />
        )}

        {activeTab === "short_video_script" && campaign.generated_content.short_video_script && (
          <ShortVideoScriptCard
            script={campaign.generated_content.short_video_script}
            campaign={campaign}
            onUpdateContent={(txt) => handleUpdateContent("short_video_script", txt)}
            onRegenerate={(instruction) => handleRegeneratePlatform("short_video_script", instruction)}
            onAuditTraceability={() => onNavigate("traceability")}
            isRegenerating={isRegenerating}
          />
        )}
      </div>
    </div>
  );
};

