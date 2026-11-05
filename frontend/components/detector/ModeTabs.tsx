"use client";

import { Camera, Frame, Images, type LucideIcon } from "lucide-react";

import type { AnalysisMode } from "./shared";

interface TabDef {
  id: AnalysisMode;
  label: string;
  icon: LucideIcon;
  hint: string;
}

const TABS: TabDef[] = [
  { id: "webcam", label: "Webcam", icon: Camera, hint: "Live camera stream" },
  { id: "image", label: "Image", icon: Images, hint: "Upload a photo" },
  { id: "video", label: "Video", icon: Frame, hint: "Frame-by-frame clip" },
];

interface ModeTabsProps {
  value: AnalysisMode;
  onChange: (mode: AnalysisMode) => void;
}

export function ModeTabs({ value, onChange }: ModeTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Analysis mode"
      className="glass grid grid-cols-3 gap-1 rounded-xl p-1"
    >
      {TABS.map((tab) => {
        const active = tab.id === value;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            id={`mode-tab-${tab.id}`}
            role="tab"
            type="button"
            aria-selected={active}
            aria-controls={`mode-panel-${tab.id}`}
            title={tab.hint}
            onClick={() => onChange(tab.id)}
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 font-display text-[13px] font-medium tracking-wide transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 ${
              active
                ? "bg-accent/12 text-accent shadow-[0_0_18px_rgba(34,211,238,0.14)]"
                : "text-muted hover:bg-white/[0.04] hover:text-frost"
            }`}
          >
            <Icon size={15} aria-hidden="true" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
