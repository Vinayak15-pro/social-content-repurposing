import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Link as LinkIcon,
  FileText,
  Bookmark,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  Linkedin,
  Instagram,
  Video,
  FileCheck,
  RefreshCw,
  Sliders,
  ShieldAlert
} from "lucide-react";
import { Campaign, SampleSource } from "@/types";
import { api } from "@/lib/api";

interface CreateCampaignViewProps {
  onCampaignCreated: (campaign: Campaign) => void;
  samples: SampleSource[];
  initialSample?: SampleSource | null;
}

export const CreateCampaignView: React.FC<CreateCampaignViewProps> = ({
  onCampaignCreated,
  samples,
  initialSample,
}) => {
  // Input mode tabs: 'paste' | 'url' | 'samples'
  const [inputMode, setInputMode] = useState<"paste" | "url" | "samples">("paste");

  // Form Fields
  const [sourceText, setSourceText] = useState("");
  const [sourceTitle, setSourceTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [campaignGoal, setCampaignGoal] = useState("Thought leadership & educating decision makers");
  const [targetAudience, setTargetAudience] = useState("B2B Technology Leaders, Engineering Directors, and VP Product");
  const [brandVoice, setBrandVoice] = useState("Authoritative, approachable, data-driven, concise");
  const [keyMessages, setKeyMessages] = useState<string>("Decouple early, test with shadow traffic, validate canary routing");
  const [keywords, setKeywords] = useState<string>("Fintech, Cloud Migration, Zero-Downtime, SOC2 Type II, Latency");
  const [requiredPhrases, setRequiredPhrases] = useState<string>("enterprise-ready, SOC2 Type II certified");
  const [prohibitedPhrases, setProhibitedPhrases] = useState<string>("cheap, miracle, guaranteed 100%, foolproof");
  const [callToAction, setCallToAction] = useState("Read the full engineering whitepaper to explore the architecture");
  
  // Platform selection
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    "linkedin",
    "instagram_caption",
    "instagram_carousel",
    "short_video_script"
  ]);

  // UI state
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isUrlFetching, setIsUrlFetching] = useState(false);
  const [urlFetchError, setUrlFetchError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);

  // Load sample when initialSample or samples change
  useEffect(() => {
    if (initialSample) {
      applySample(initialSample);
    } else if (samples.length > 0 && !sourceText) {
      applySample(samples[0]);
    }
  }, [initialSample, samples]);

  const applySample = (sample: SampleSource) => {
    setSourceText(sample.text);
    setSourceTitle(sample.title);
    setCampaignGoal(sample.campaign_goal);
    setTargetAudience(sample.target_audience);
    setBrandVoice(sample.brand_voice);
    setKeywords(sample.keywords.join(", "));
    setRequiredPhrases(sample.required_phrases.join(", "));
    setProhibitedPhrases(sample.prohibited_phrases.join(", "));
    setCallToAction(sample.call_to_action);
    setFormError(null);
  };

  const handleFetchUrl = async () => {
    if (!sourceUrl.trim()) {
      setUrlFetchError("Please enter a valid HTTP or HTTPS web address.");
      return;
    }
    setUrlFetchError(null);
    setIsUrlFetching(true);
    try {
      const data = await api.fetchUrlContent(sourceUrl);
      setSourceText(data.text_content);
      if (data.title && (!sourceTitle || sourceTitle === "Untitled Document")) {
        setSourceTitle(data.title);
      }
      setInputMode("paste");
    } catch (err: any) {
      setUrlFetchError(err.message || "Failed to retrieve URL content.");
    } finally {
      setIsUrlFetching(false);
    }
  };

  const togglePlatform = (plat: string) => {
    if (selectedPlatforms.includes(plat)) {
      if (selectedPlatforms.length === 1) {
        setFormError("At least one target platform must remain selected.");
        return;
      }
      setSelectedPlatforms(selectedPlatforms.filter((p) => p !== plat));
    } else {
      setSelectedPlatforms([...selectedPlatforms, plat]);
    }
    setFormError(null);
  };

  const wordCount = sourceText.trim() ? sourceText.trim().split(/\s+/).length : 0;
  const charCount = sourceText.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (wordCount < 20) {
      setFormError("Source content is too brief (minimum 20 words required for fact extraction).");
      return;
    }
    if (selectedPlatforms.length === 0) {
      setFormError("Please select at least one social media platform.");
      return;
    }

    setIsGenerating(true);
    setGenerationStep("1/4 Analyzing source facts & extracting paragraph citations...");

    try {
      const stepTimer1 = setTimeout(() => {
        setGenerationStep("2/4 Repurposing platform drafts with brand voice...");
      }, 900);

      const stepTimer2 = setTimeout(() => {
        setGenerationStep("3/4 Auditing source-to-post factual traceability...");
      }, 1900);

      const stepTimer3 = setTimeout(() => {
        setGenerationStep("4/4 Running compliance checks on required/prohibited phrases...");
      }, 2900);

      const payload = {
        source_text: sourceText,
        source_title: sourceTitle.trim() || "Untitled Campaign",
        source_url: sourceUrl.trim() || undefined,
        campaign_goal: campaignGoal,
        target_audience: targetAudience,
        brand_voice: brandVoice,
        key_messages: keyMessages.split(",").map((s) => s.trim()).filter(Boolean),
        keywords: keywords.split(",").map((s) => s.trim()).filter(Boolean),
        required_phrases: requiredPhrases.split(",").map((s) => s.trim()).filter(Boolean),
        prohibited_phrases: prohibitedPhrases.split(",").map((s) => s.trim()).filter(Boolean),
        call_to_action: callToAction,
        selected_platforms: selectedPlatforms,
      };

      const campaign = await api.generateCampaign(payload);
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);

      onCampaignCreated(campaign);
    } catch (err: any) {
      setFormError(err.message || "An error occurred during content generation.");
    } finally {
      setIsGenerating(false);
      setGenerationStep("");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      {/* Page Header */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Create Repurposing Campaign</h2>
        <p className="text-xs text-slate-500">
          Feed in approved source material, configure tone and rules, and generate platform-tailored social assets with full factual verification.
        </p>
      </div>

      {formError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
          <div>
            <p className="font-semibold">Unable to proceed</p>
            <p>{formError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Source Content Input Box */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <label className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-indigo-600" />
              <span>Source Document Material</span>
            </label>

            {/* Input Mode Selector */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-medium self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setInputMode("paste")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  inputMode === "paste"
                    ? "bg-white text-slate-900 shadow-sm font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Paste Content
              </button>
              <button
                type="button"
                onClick={() => setInputMode("url")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  inputMode === "url"
                    ? "bg-white text-slate-900 shadow-sm font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Fetch Public URL
              </button>
              <button
                type="button"
                onClick={() => setInputMode("samples")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  inputMode === "samples"
                    ? "bg-white text-slate-900 shadow-sm font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Sample Library
              </button>
            </div>
          </div>

          {/* URL Input Form */}
          {inputMode === "url" && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <p className="text-xs text-slate-600">
                Provide a public article or blog URL. Our backend safely extracts the core text with SSRF protection:
              </p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="url"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="https://example.com/blog/case-study-cloud-migration"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleFetchUrl}
                  disabled={isUrlFetching}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shrink-0 flex items-center gap-1.5"
                >
                  {isUrlFetching && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isUrlFetching ? "Retrieving..." : "Fetch Webpage"}</span>
                </button>
              </div>
              {urlFetchError && (
                <p className="text-xs text-rose-600 font-medium">{urlFetchError}</p>
              )}
            </div>
          )}

          {/* Sample Source Selection */}
          {inputMode === "samples" && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
              <p className="text-xs text-slate-600 font-medium">Select a pre-baked case study or tech post:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {samples.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      applySample(s);
                      setInputMode("paste");
                    }}
                    className="p-3 text-left bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 rounded-lg transition-all"
                  >
                    <p className="font-semibold text-slate-900 text-xs line-clamp-1">{s.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 capitalize">{s.content_type.replace("_", " ")} • {s.target_audience}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Document Title */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Source Document Title
            </label>
            <input
              type="text"
              value={sourceTitle}
              onChange={(e) => setSourceTitle(e.target.value)}
              placeholder="e.g. AuraPay Case Study: Zero-Downtime Microservices Migration"
              className="w-full px-3 py-2 text-xs bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          {/* Source Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <label className="font-medium text-slate-700">Source Body (Markdown or Raw Text)</label>
              <span>
                {wordCount} words • {charCount} / 50,000 chars
              </span>
            </div>
            <textarea
              rows={8}
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Paste your approved article, whitepaper, or case study here..."
              className="w-full p-3 text-xs font-mono bg-slate-50/30 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 leading-relaxed"
            />
            {charCount > 45000 && (
              <p className="text-[11px] text-amber-600">
                Approaching the 50,000 character limit. Trim non-essential appendixes for best results.
              </p>
            )}
          </div>
        </div>

        {/* Campaign Parameters */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle space-y-4">
          <h3 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-3">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <span>Campaign Parameters & Brand Alignment</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Campaign Goal
              </label>
              <input
                type="text"
                value={campaignGoal}
                onChange={(e) => setCampaignGoal(e.target.value)}
                placeholder="e.g. Drive awareness & generate demo bookings"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Target Persona / Audience
              </label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g. CTOs, Engineering Leads, Tech Founders"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Brand Voice & Tone
              </label>
              <input
                type="text"
                value={brandVoice}
                onChange={(e) => setBrandVoice(e.target.value)}
                placeholder="e.g. Authoritative, insightful, data-driven, approachable"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Call to Action (CTA)
              </label>
              <input
                type="text"
                value={callToAction}
                onChange={(e) => setCallToAction(e.target.value)}
                placeholder="e.g. Read the complete engineering whitepaper"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>

          {/* Collapsible Advanced Settings */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
            >
              <span>{showAdvanced ? "Hide Advanced Guardrails" : "Show Advanced Guardrails & Compliance"}</span>
              {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showAdvanced && (
              <div className="mt-4 space-y-4 pt-3 border-t border-slate-100 text-xs animate-in fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Required Phrases (Must appear in copy)
                    </label>
                    <input
                      type="text"
                      value={requiredPhrases}
                      onChange={(e) => setRequiredPhrases(e.target.value)}
                      placeholder="e.g. enterprise-ready, SOC2 Type II certified"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Comma-separated</p>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Prohibited Words / Phrases (Strictly disallowed)
                    </label>
                    <input
                      type="text"
                      value={prohibitedPhrases}
                      onChange={(e) => setProhibitedPhrases(e.target.value)}
                      placeholder="e.g. cheap, miracle, guaranteed 100%"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Comma-separated</p>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Core Keywords & Hashtags
                    </label>
                    <input
                      type="text"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      placeholder="e.g. Fintech, Cloud Migration, Zero-Downtime"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Key Messaging Pillars
                    </label>
                    <input
                      type="text"
                      value={keyMessages}
                      onChange={(e) => setKeyMessages(e.target.value)}
                      placeholder="e.g. Decouple early, test with shadow traffic"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Platform Selection Cards */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-xs font-semibold text-slate-900">Target Platforms</h3>
              <p className="text-[11px] text-slate-500">Select formats to repurpose simultaneously</p>
            </div>
            <span className="text-xs font-semibold text-indigo-600">
              {selectedPlatforms.length} Selected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* LinkedIn Card */}
            <div
              onClick={() => togglePlatform("linkedin")}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedPlatforms.includes("linkedin")
                  ? "border-indigo-600 bg-indigo-50/30 ring-1 ring-indigo-600"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Linkedin className="w-4 h-4" />
                </span>
                <input
                  type="checkbox"
                  checked={selectedPlatforms.includes("linkedin")}
                  onChange={() => {}}
                  className="rounded text-indigo-600 focus:ring-0"
                />
              </div>
              <h4 className="font-semibold text-xs text-slate-900">LinkedIn Post</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Hook-driven professional post with metrics, takeaways, and hashtags.
              </p>
            </div>

            {/* Instagram Caption Card */}
            <div
              onClick={() => togglePlatform("instagram_caption")}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedPlatforms.includes("instagram_caption")
                  ? "border-indigo-600 bg-indigo-50/30 ring-1 ring-indigo-600"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-lg bg-pink-50 text-pink-600">
                  <Instagram className="w-4 h-4" />
                </span>
                <input
                  type="checkbox"
                  checked={selectedPlatforms.includes("instagram_caption")}
                  onChange={() => {}}
                  className="rounded text-indigo-600 focus:ring-0"
                />
              </div>
              <h4 className="font-semibold text-xs text-slate-900">Instagram Caption</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Punchy caption with emojis, bullet points, CTA, and engagement prompt.
              </p>
            </div>

            {/* Instagram Carousel Card */}
            <div
              onClick={() => togglePlatform("instagram_carousel")}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedPlatforms.includes("instagram_carousel")
                  ? "border-indigo-600 bg-indigo-50/30 ring-1 ring-indigo-600"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-lg bg-purple-50 text-purple-600">
                  <Bookmark className="w-4 h-4" />
                </span>
                <input
                  type="checkbox"
                  checked={selectedPlatforms.includes("instagram_carousel")}
                  onChange={() => {}}
                  className="rounded text-indigo-600 focus:ring-0"
                />
              </div>
              <h4 className="font-semibold text-xs text-slate-900">Instagram Carousel</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Multi-slide deck with slide titles, copy, and visual art direction prompts.
              </p>
            </div>

            {/* Short Video Script Card */}
            <div
              onClick={() => togglePlatform("short_video_script")}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedPlatforms.includes("short_video_script")
                  ? "border-indigo-600 bg-indigo-50/30 ring-1 ring-indigo-600"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-lg bg-rose-50 text-rose-600">
                  <Video className="w-4 h-4" />
                </span>
                <input
                  type="checkbox"
                  checked={selectedPlatforms.includes("short_video_script")}
                  onChange={() => {}}
                  className="rounded text-indigo-600 focus:ring-0"
                />
              </div>
              <h4 className="font-semibold text-xs text-slate-900">Short-Video Script</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Scene breakdown (Reels/Shorts) with spoken audio, on-screen text, and B-roll.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & Loading Bar */}
        <div className="pt-2 flex flex-col items-center justify-center gap-3">
          <button
            type="submit"
            disabled={isGenerating}
            className="w-full sm:w-80 py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-xs font-semibold shadow-md shadow-indigo-100 transition-all flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Repurposing Content...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Repurposed Content</span>
              </>
            )}
          </button>

          {isGenerating && (
            <div className="text-center space-y-1">
              <p className="text-xs font-medium text-indigo-700 animate-pulse">
                {generationStep || "Processing..."}
              </p>
              <p className="text-[10px] text-slate-400">
                Ground-truth fact mapping and brand validation in progress
              </p>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

