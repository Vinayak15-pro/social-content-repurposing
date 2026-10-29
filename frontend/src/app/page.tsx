"use client";

import React, { useState, useEffect } from "react";
import { ViewMode, Campaign, SampleSource } from "@/types";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { CreateCampaignView } from "@/components/create/CreateCampaignView";
import { GeneratedContentView } from "@/components/content/GeneratedContentView";
import { TraceabilitySplitView } from "@/components/traceability/TraceabilitySplitView";
import { BrandGuidelinesView } from "@/components/brand/BrandGuidelinesView";
import { ContentLibraryView } from "@/components/library/ContentLibraryView";
import { SettingsView } from "@/components/settings/SettingsView";
import { api } from "@/lib/api";

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewMode>("dashboard");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [samples, setSamples] = useState<SampleSource[]>([]);
  const [selectedSampleForCreate, setSelectedSampleForCreate] = useState<SampleSource | null>(null);
  const [health, setHealth] = useState<{ status: string; service: string; version: string; gemini?: any } | null>(null);

  // Fetch initial data
  const loadInitialData = async () => {
    try {
      const h = await api.getHealth();
      setHealth(h);
    } catch {
      setHealth({ status: "offline", service: "Social Content Repurposing Pipeline", version: "1.0.0" });
    }

    try {
      const samps = await api.getSamples();
      setSamples(samps);
    } catch {
      // ignore
    }

    try {
      const cmps = await api.getCampaigns();
      setCampaigns(cmps);
      if (cmps.length > 0 && !activeCampaign) {
        setActiveCampaign(cmps[0]);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleCampaignCreated = (newCampaign: Campaign) => {
    setCampaigns((prev) => [newCampaign, ...prev.filter((c) => c.id !== newCampaign.id)]);
    setActiveCampaign(newCampaign);
    setCurrentView("content");
  };

  const handleCampaignUpdated = (updatedCampaign: Campaign) => {
    setCampaigns((prev) => prev.map((c) => (c.id === updatedCampaign.id ? updatedCampaign : c)));
    setActiveCampaign(updatedCampaign);
  };

  const handleDeleteCampaign = async (id: string) => {
    try {
      await api.deleteCampaign(id);
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
      if (activeCampaign?.id === id) {
        const remaining = campaigns.filter((c) => c.id !== id);
        setActiveCampaign(remaining.length > 0 ? remaining[0] : null);
        if (remaining.length === 0) {
          setCurrentView("dashboard");
        }
      }
    } catch {
      // ignore
    }
  };

  const handleSelectCampaign = (campaign: Campaign, targetView: ViewMode = "content") => {
    setActiveCampaign(campaign);
    setCurrentView(targetView);
  };

  const handleLoadSampleFromDashboard = () => {
    if (samples.length > 0) {
      setSelectedSampleForCreate(samples[0]);
    }
    setCurrentView("create");
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onNavigate={(v) => setCurrentView(v)}
        activeCampaign={activeCampaign}
        health={health}
      />

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          currentView={currentView}
          onNavigate={(v) => setCurrentView(v)}
          activeCampaign={activeCampaign}
        />

        <main className="flex-1 p-8 overflow-y-auto">
          {currentView === "dashboard" && (
            <DashboardView
              campaigns={campaigns}
              onNavigate={(v) => setCurrentView(v)}
              onSelectCampaign={handleSelectCampaign}
              onLoadSample={handleLoadSampleFromDashboard}
            />
          )}

          {currentView === "create" && (
            <CreateCampaignView
              onCampaignCreated={handleCampaignCreated}
              samples={samples}
              initialSample={selectedSampleForCreate}
            />
          )}

          {currentView === "content" && activeCampaign && (
            <GeneratedContentView
              campaign={activeCampaign}
              onCampaignUpdated={handleCampaignUpdated}
              onNavigate={(v) => setCurrentView(v)}
            />
          )}

          {currentView === "traceability" && activeCampaign && (
            <TraceabilitySplitView campaign={activeCampaign} />
          )}

          {currentView === "brand" && (
            <BrandGuidelinesView activeCampaign={activeCampaign} />
          )}

          {currentView === "library" && (
            <ContentLibraryView
              campaigns={campaigns}
              onSelectCampaign={handleSelectCampaign}
              onDeleteCampaign={handleDeleteCampaign}
              onNavigate={(v) => setCurrentView(v)}
            />
          )}

          {currentView === "settings" && (
            <SettingsView
              health={health}
              onRefreshHealth={loadInitialData}
            />
          )}
        </main>
      </div>
    </div>
  );
}
