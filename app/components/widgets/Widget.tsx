"use client";

import { C } from "../../lib/theme";
import { BarChart } from "./BarChart";
import { BubbleChart } from "./BubbleChart";
import { ComparisonTable } from "./ComparisonTable";
import { DonutChart } from "./DonutChart";
import { Gauge } from "./Gauge";
import { LineChart } from "./LineChart";
import { ProgressBars } from "./ProgressBars";
import { StatComparison } from "./StatComparison";
import { TimelineMagnitude } from "./TimelineMagnitude";
import { UnitChart } from "./UnitChart";
import { WaveCounter } from "./WaveCounter";
import { WidgetLabel } from "./WidgetLabel";

export function Widget({ section, accent, accentDim }) {
  const { widgetType, label, insight, props: p = {} } = section;
  const shared = { accent, accentDim };

  const safe = {
    bars: p.bars ?? [],
    segments: p.segments ?? [],
    events: p.events ?? [],
    bubbles: p.bubbles ?? [],
    items: p.items ?? [],
    rows: p.rows ?? [],
    points: p.points ?? [],
    value: p.value ?? 0,
    highlighted: p.highlighted ?? 0,
    total: p.total ?? 100,
  };

  let chart;
  try {
    switch (widgetType) {
      case "wave-counter":
        chart = <WaveCounter {...p} value={safe.value} {...shared} />;
        break;
      case "bar-chart":
        chart = <BarChart {...p} bars={safe.bars} {...shared} />;
        break;
      case "donut-chart":
        chart = <DonutChart {...p} segments={safe.segments} {...shared} />;
        break;
      case "gauge":
        chart = <Gauge {...p} value={safe.value} {...shared} />;
        break;
      case "line-chart":
        chart = <LineChart {...p} points={safe.points} {...shared} />;
        break;
      case "timeline-magnitude":
        chart = <TimelineMagnitude {...p} events={safe.events} {...shared} />;
        break;
      case "unit-chart":
        chart = <UnitChart {...p} total={safe.total} highlighted={safe.highlighted} {...shared} />;
        break;
      case "stat-comparison":
        chart = <StatComparison {...p} left={p.left ?? {}} right={p.right ?? {}} {...shared} />;
        break;
      case "bubble-chart":
        chart = <BubbleChart {...p} bubbles={safe.bubbles} {...shared} />;
        break;
      case "progress-bars":
        chart = <ProgressBars {...p} items={safe.items} {...shared} />;
        break;
      case "comparison-table":
        chart = <ComparisonTable {...p} rows={safe.rows} {...shared} />;
        break;
      default:
        chart = (
          <div style={{ color: C.muted, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, padding: "12px 0" }}>
            Unknown widget type: {widgetType}
          </div>
        );
    }
  } catch (err) {
    chart = (
      <div style={{ color: C.red, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, padding: "12px 0" }}>
        Widget render error: {String(err.message)}
      </div>
    );
  }

  return (
    <div style={{ margin: "40px 0", background: C.surface, border: `1px solid ${C.border}`, borderRadius: C.borderRadius, padding: 28, animation: "fadeUp 0.5s ease both" }}>
      {label && <WidgetLabel text={label} accent={accent} accentDim={accentDim} />}
      {chart}
      {insight && (
        <div style={{ marginTop: 22, padding: "12px 16px", background: accent + "0d", border: `1px solid ${accentDim}`, borderRadius: C.borderRadius - 5 }}>
          <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: C.body, margin: 0, lineHeight: 1.6 }}>{insight}</p>
        </div>
      )}
    </div>
  );
}
