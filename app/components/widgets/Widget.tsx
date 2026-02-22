"use client";

import type { ReactNode } from "react";
import { C } from "../../lib/theme";
import type { WidgetSection } from "../../lib/articleTypes";
import { BarChart } from "./BarChart";
import { BubbleChart } from "./BubbleChart";
import { ComparisonTable } from "./ComparisonTable";
import { DonutChart } from "./DonutChart";
import { Gauge } from "./Gauge";
import { Heatmap } from "./Heatmap";
import { KpiScorecards } from "./KpiScorecards";
import { LineChart } from "./LineChart";
import { ProgressBars } from "./ProgressBars";
import { SlopeChart } from "./SlopeChart";
import { StatComparison } from "./StatComparison";
import { Timeline } from "./Timeline";
import { TimelineMagnitude } from "./TimelineMagnitude";
import { UnitChart } from "./UnitChart";
import { WaterfallChart } from "./WaterfallChart";
import { WaveCounter } from "./WaveCounter";
import { WidgetLabel } from "./WidgetLabel";
import { IconArrowRight } from "@tabler/icons-react";

export type WidgetProps = {
  section: WidgetSection;
  accent: string;
  accentDim: string;
};

export function Widget({ section, accent, accentDim }: WidgetProps) {
  const { label, insight } = section;

  let chart: ReactNode;
  switch (section.widgetType) {
    case "wave-counter":
      chart = <WaveCounter {...section.props} accent={accent} accentDim={accentDim} />;
      break;
    case "bar-chart":
      chart = <BarChart {...section.props} accent={accent} accentDim={accentDim} />;
      break;
    case "donut-chart":
      chart = <DonutChart {...section.props} accent={accent} accentDim={accentDim} />;
      break;
    case "gauge":
      chart = <Gauge {...section.props} accent={accent} accentDim={accentDim} />;
      break;
    case "line-chart":
      chart = <LineChart {...section.props} accent={accent} accentDim={accentDim} />;
      break;
    case "timeline":
      chart = <Timeline {...section.props} accent={accent} accentDim={accentDim} />;
      break;
    case "timeline-magnitude":
      chart = <TimelineMagnitude {...section.props} accent={accent} accentDim={accentDim} />;
      break;
    case "unit-chart":
      chart = <UnitChart {...section.props} accent={accent} accentDim={accentDim} />;
      break;
    case "stat-comparison":
      chart = <StatComparison {...section.props} accent={accent} accentDim={accentDim} />;
      break;
    case "bubble-chart":
      chart = <BubbleChart {...section.props} accent={accent} accentDim={accentDim} />;
      break;
    case "progress-bars":
      chart = <ProgressBars {...section.props} accent={accent} accentDim={accentDim} />;
      break;
    case "comparison-table":
      chart = <ComparisonTable {...section.props} accent={accent} accentDim={accentDim} />;
      break;
    case "slope-chart":
      chart = <SlopeChart {...section.props} accent={accent} />;
      break;
    case "heatmap":
      chart = <Heatmap {...section.props} accent={accent} />;
      break;
    case "waterfall-chart":
      chart = <WaterfallChart {...section.props} accent={accent} accentDim={accentDim} />;
      break;
    case "kpi-scorecards":
      chart = <KpiScorecards {...section.props} accent={accent} />;
      break;
    default:
      chart = (
        <div style={{ color: C.muted, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, padding: "12px 0" }}>
          Unknown widget type: {(section as any).widgetType}
        </div>
      );
  }

  return (
    <div data-widget-type={section.widgetType} style={{ margin: "40px 0", background: C.surfaceGradient, border: `1px solid ${C.border}`, borderRadius: C.borderRadius, padding: 28, animation: "fadeUp 0.5s ease both" }}>
      {label && <WidgetLabel text={label} accent={accent} accentDim={accentDim} />}
      {chart}
      {insight && (
        <div style={{ marginTop: 22, padding: "12px 16px", background: accent + "0d", border: `1px solid ${accentDim}`, borderRadius: C.borderRadius - 5, display: "flex", alignItems: "center", gap: 12 }}>
          <IconArrowRight size={13} style={{ color: accent }} />
          <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: C.body, margin: 0 }}>{insight}</p>
        </div>
      )}
    </div>
  );
}
