export type ShareSource = { kind: "url" | "text"; value: string };

export type ThemeKey = "financial" | "tech" | "political" | "environment" | "economy";

export type ProseSection = {
  type: "prose";
  heading: string | null;
  paragraphs: string[];
};

export type WaveCounterProps = {
  value: number;
  prefix?: string;
  suffix?: string;
  unit?: string;
  description?: string;
};

export type BarChartBar = {
  label: string;
  value: number;
  highlight?: boolean;
};

export type BarChartProps = {
  bars: BarChartBar[];
  unit?: string;
};

export type DonutChartSegment = {
  label: string;
  value: number;
};

export type DonutChartProps = {
  segments: DonutChartSegment[];
  centerValue?: string;
  centerLabel?: string;
};

export type GaugeProps = {
  value: number;
  min?: number;
  max?: number;
  unit?: string;
  lowLabel?: string;
  highLabel?: string;
};

export type LineChartPoint = {
  x: string;
  y: number;
};

export type LineChartProps = {
  points: LineChartPoint[];
  yLabel?: string;
  unit?: string;
};

export type TimelineAlign = "start" | "end" | "highlighted";

export type TimelineEvent = {
  label: string;
  title: string;
  description: string;
  highlight: boolean;
  current?: boolean;
};

export type TimelineProps = {
  events: TimelineEvent[];
  align: TimelineAlign;
};

export type TimelineMagnitudeEventType = "past" | "current" | "future";

export type TimelineMagnitudeEvent = {
  label: string;
  value: number;
  type: TimelineMagnitudeEventType;
  description: string | null;
};

export type TimelineMagnitudeProps = {
  events: TimelineMagnitudeEvent[];
};

export type UnitChartProps = {
  total: number;
  highlighted: number;
  unit: string;
  description?: string;
};

export type StatComparisonSide = {
  label: string;
  value: number;
  unit?: string;
  prefix?: string;
};

export type StatComparisonProps = {
  left: StatComparisonSide;
  right: StatComparisonSide;
  description?: string;
};

export type BubbleChartBubble = {
  label: string;
  value: number;
};

export type BubbleChartProps = {
  bubbles: BubbleChartBubble[];
  unit?: string;
};

export type ProgressBarsSentiment = "positive" | "negative" | "neutral";

export type ProgressBarsItem = {
  label: string;
  sub: string;
  value: number;
  sentiment: ProgressBarsSentiment;
};

export type ProgressBarsProps = {
  items: ProgressBarsItem[];
};

export type ComparisonTableRow = {
  name: string;
  value: number;
  note?: string;
};

export type ComparisonTableProps = {
  highlight: string;
  unit?: string;
  rows: ComparisonTableRow[];
};

export type SlopeChartItem = {
  label: string;
  start: number;
  end: number;
};

export type SlopeChartProps = {
  leftLabel?: string;
  rightLabel?: string;
  unit?: string;
  items: SlopeChartItem[];
};

export type HeatmapCell = {
  x: string;
  y: string;
  value: number;
};

export type HeatmapProps = {
  unit?: string;
  cells: HeatmapCell[];
};

export type WaterfallStepType = "delta" | "total";

export type WaterfallStep = {
  label: string;
  value: number;
  type: WaterfallStepType;
};

export type WaterfallChartProps = {
  unit?: string;
  steps: WaterfallStep[];
};

export type KpiScorecard = {
  label: string;
  value: number | string;
  unit?: string;
  prefix?: string;
  suffix?: string;
  delta?: number | null;
  deltaLabel?: string;
  sentiment: ProgressBarsSentiment;
};

export type KpiScorecardsProps = {
  items: KpiScorecard[];
};

export type WidgetType =
  | "wave-counter"
  | "bar-chart"
  | "donut-chart"
  | "gauge"
  | "line-chart"
  | "timeline"
  | "timeline-magnitude"
  | "unit-chart"
  | "stat-comparison"
  | "bubble-chart"
  | "progress-bars"
  | "comparison-table"
  | "slope-chart"
  | "heatmap"
  | "waterfall-chart"
  | "kpi-scorecards";

export type WidgetSection =
  | {
      type: "widget";
      widgetType: "wave-counter";
      label: string;
      insight: string | null;
      props: WaveCounterProps;
    }
  | {
      type: "widget";
      widgetType: "bar-chart";
      label: string;
      insight: string | null;
      props: BarChartProps;
    }
  | {
      type: "widget";
      widgetType: "donut-chart";
      label: string;
      insight: string | null;
      props: DonutChartProps;
    }
  | {
      type: "widget";
      widgetType: "gauge";
      label: string;
      insight: string | null;
      props: GaugeProps;
    }
  | {
      type: "widget";
      widgetType: "line-chart";
      label: string;
      insight: string | null;
      props: LineChartProps;
    }
  | {
      type: "widget";
      widgetType: "timeline";
      label: string;
      insight: string | null;
      props: TimelineProps;
    }
  | {
      type: "widget";
      widgetType: "timeline-magnitude";
      label: string;
      insight: string | null;
      props: TimelineMagnitudeProps;
    }
  | {
      type: "widget";
      widgetType: "unit-chart";
      label: string;
      insight: string | null;
      props: UnitChartProps;
    }
  | {
      type: "widget";
      widgetType: "stat-comparison";
      label: string;
      insight: string | null;
      props: StatComparisonProps;
    }
  | {
      type: "widget";
      widgetType: "bubble-chart";
      label: string;
      insight: string | null;
      props: BubbleChartProps;
    }
  | {
      type: "widget";
      widgetType: "progress-bars";
      label: string;
      insight: string | null;
      props: ProgressBarsProps;
    }
  | {
      type: "widget";
      widgetType: "comparison-table";
      label: string;
      insight: string | null;
      props: ComparisonTableProps;
    }
  | {
      type: "widget";
      widgetType: "slope-chart";
      label: string;
      insight: string | null;
      props: SlopeChartProps;
    }
  | {
      type: "widget";
      widgetType: "heatmap";
      label: string;
      insight: string | null;
      props: HeatmapProps;
    }
  | {
      type: "widget";
      widgetType: "waterfall-chart";
      label: string;
      insight: string | null;
      props: WaterfallChartProps;
    }
  | {
      type: "widget";
      widgetType: "kpi-scorecards";
      label: string;
      insight: string | null;
      props: KpiScorecardsProps;
    };

export type ArticleSection = ProseSection | WidgetSection;

export type ArticleDocument = {
  title: string;
  deck: string;
  byline: string | null;
  date: string | null;
  theme: ThemeKey;
  sections: ArticleSection[];
  source: string | null;
  sourceUrl?: string | null;
};
