import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";

import { BgCanvas } from "@/components/ui/BgCanvas";
import { Widget } from "@/components/widgets/Widget";
import { C, THEMES } from "@/lib/theme";
import type { WidgetSection } from "@/lib/types";

const FONT_IMPORT = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@300;400;500&family=Geist+Mono:wght@400;500&family=Geist:wght@300;400;500&display=swap');
`;

const ACCENT = THEMES.tech.accent;
const ACCENT_DIM = THEMES.tech.dim;

const DEMO_WIDGETS: Array<{ title: string; description: string; section: WidgetSection }> = [
  {
    title: "Wave Counter",
    description: "Animated number with a wave fill effect. Great for a single headline stat.",
    section: {
      type: "widget",
      widgetType: "wave-counter",
      label: "Global Developers",
      insight: "The developer population has more than doubled in the last decade.",
      props: {
        value: 28.7,
        suffix: "M",
        unit: "developers worldwide",
        description: "Active software developers globally in 2024",
      },
    },
  },
  {
    title: "KPI Scorecards",
    description: "Grid of key performance indicators with animated reveal and trend indicators.",
    section: {
      type: "widget",
      widgetType: "kpi-scorecards",
      label: "2024 Platform Metrics",
      insight: "Revenue and DAU both hit all-time highs in Q4, driven by AI-powered features.",
      props: {
        items: [
          {
            label: "Monthly Active Users",
            value: 4.2,
            suffix: "B",
            delta: 12,
            deltaLabel: "vs last year",
            sentiment: "positive",
          },
          {
            label: "Annual Revenue",
            value: 134.9,
            prefix: "$",
            suffix: "B",
            delta: 8,
            deltaLabel: "YoY growth",
            sentiment: "positive",
          },
          {
            label: "Net Promoter Score",
            value: 72,
            delta: -3,
            deltaLabel: "vs Q3 2024",
            sentiment: "negative",
          },
          {
            label: "Uptime SLA",
            value: 99.97,
            suffix: "%",
            delta: 0.02,
            deltaLabel: "improvement",
            sentiment: "positive",
          },
        ],
      },
    },
  },
  {
    title: "Bar Chart",
    description: "Horizontal bars with animated fill. Ideal for ranking or comparing categories.",
    section: {
      type: "widget",
      widgetType: "bar-chart",
      label: "Top Programming Languages 2024",
      insight: "JavaScript maintains its 12-year streak at the top, while Rust climbs fastest.",
      props: {
        unit: "% usage",
        bars: [
          { label: "JavaScript", value: 65.4, highlight: true },
          { label: "Python", value: 51.2 },
          { label: "TypeScript", value: 43.8 },
          { label: "Rust", value: 12.6 },
          { label: "Go", value: 14.3 },
          { label: "Kotlin", value: 9.4 },
        ],
      },
    },
  },
  {
    title: "Donut Chart",
    description: "Canvas-drawn donut with smooth arc animation and optional center label.",
    section: {
      type: "widget",
      widgetType: "donut-chart",
      label: "Cloud Market Share Q4 2024",
      insight: "AWS leads with 31% share, but Azure's gap is narrowing at just 6 points.",
      props: {
        centerValue: "100%",
        centerLabel: "Cloud Market",
        segments: [
          { label: "AWS", value: 31 },
          { label: "Azure", value: 25 },
          { label: "GCP", value: 11 },
          { label: "Alibaba", value: 4 },
          { label: "Other", value: 29 },
        ],
      },
    },
  },
  {
    title: "Line Chart",
    description: "Canvas-drawn line chart with smooth draw animation and gradient fill.",
    section: {
      type: "widget",
      widgetType: "line-chart",
      label: "Generative AI Funding 2019–2024",
      insight: "Funding surged 92% in 2024 to $56B, more than double the 2023 figure.",
      props: {
        yLabel: "USD",
        unit: "B",
        points: [
          { x: "2019", y: 3.1 },
          { x: "2020", y: 4.7 },
          { x: "2021", y: 12.4 },
          { x: "2022", y: 21.8 },
          { x: "2023", y: 29.1 },
          { x: "2024", y: 56.0 },
        ],
      },
    },
  },
  {
    title: "Gauge",
    description: "Arc gauge for showing a value within a defined range.",
    section: {
      type: "widget",
      widgetType: "gauge",
      label: "Developer Satisfaction Score",
      insight: "An 8.1/10 satisfaction score is well above the industry average of 6.4.",
      props: {
        value: 81,
        min: 0,
        max: 100,
        unit: "%",
        lowLabel: "POOR",
        highLabel: "GREAT",
      },
    },
  },
  {
    title: "Progress Bars",
    description: "Animated horizontal bars for showing percentage breakdowns.",
    section: {
      type: "widget",
      widgetType: "progress-bars",
      label: "AI Tool Adoption by Role",
      insight: "Data scientists lead AI tool adoption at 89%, while designers lag at 54%.",
      props: {
        items: [
          { label: "Data Scientists", sub: "Primary use: model training & analysis", value: 89, sentiment: "positive" },
          { label: "Backend Engineers", sub: "Primary use: code generation & review", value: 78, sentiment: "positive" },
          { label: "Frontend Engineers", sub: "Primary use: UI generation & debugging", value: 71, sentiment: "positive" },
          { label: "Product Managers", sub: "Primary use: spec writing & research", value: 62, sentiment: "neutral" },
          { label: "Designers", sub: "Primary use: image generation & mockups", value: 54, sentiment: "neutral" },
        ],
      },
    },
  },
  {
    title: "Comparison Table",
    description: "Ranked list with inline bar chart. Highlighted row stands out with accent color.",
    section: {
      type: "widget",
      widgetType: "comparison-table",
      label: "VC Funding by Sector 2024",
      insight: "AI & ML sector received 3× more funding than the second-placed fintech sector.",
      props: {
        highlight: "AI & ML",
        unit: "B",
        rows: [
          { name: "AI & ML", value: 98.4, note: "↑ 92% YoY" },
          { name: "Fintech", value: 34.1, note: "↑ 5% YoY" },
          { name: "Health Tech", value: 28.7, note: "↑ 12% YoY" },
          { name: "Climate Tech", value: 22.3, note: "↑ 31% YoY" },
          { name: "SaaS", value: 19.8, note: "↓ 8% YoY" },
          { name: "Cybersecurity", value: 14.2, note: "↑ 18% YoY" },
        ],
      },
    },
  },
  {
    title: "Stat Comparison",
    description: "Side-by-side comparison of two values with animated bars.",
    section: {
      type: "widget",
      widgetType: "stat-comparison",
      label: "Remote vs Office Productivity",
      insight: "Remote workers report 23% higher output, though collaboration scores differ.",
      props: {
        left: { label: "Remote Work", value: 87, unit: "pts" },
        right: { label: "In-Office Work", value: 71, unit: "pts" },
        description: "Self-reported productivity scores across 12,000 knowledge workers",
      },
    },
  },
  {
    title: "Unit Chart",
    description: "Icon grid showing a proportion out of a total, animated one unit at a time.",
    section: {
      type: "widget",
      widgetType: "unit-chart",
      label: "AI Tool Utilization",
      insight: "76 in 100 developers report using or planning to use AI coding assistants in 2024.",
      props: {
        total: 100,
        highlighted: 76,
        unit: "developers",
        description: "Use or plan to use AI coding tools",
      },
    },
  },
  {
    title: "Bubble Chart",
    description: "Proportional bubbles for comparing values visually at a glance.",
    section: {
      type: "widget",
      widgetType: "bubble-chart",
      label: "Open Source Ecosystem Contributions 2024",
      insight: "JavaScript leads with 4.2M contributions, nearly double the second-place Python.",
      props: {
        unit: "K contributions",
        bubbles: [
          { label: "JavaScript", value: 4200 },
          { label: "Python", value: 2800 },
          { label: "TypeScript", value: 1950 },
          { label: "Go", value: 980 },
          { label: "Rust", value: 760 },
          { label: "Java", value: 1200 },
        ],
      },
    },
  },
  {
    title: "Slope Chart",
    description: "Before/after slope lines showing change over time for multiple items.",
    section: {
      type: "widget",
      widgetType: "slope-chart",
      label: "Median Developer Salary Shift 2020–2024",
      insight: "AI/ML engineers saw the steepest salary growth at +$42K over four years.",
      props: {
        leftLabel: "2020",
        rightLabel: "2024",
        unit: "K USD",
        items: [
          { label: "AI / ML Engineer", start: 128, end: 170 },
          { label: "Backend Engineer", start: 112, end: 145 },
          { label: "Frontend Engineer", start: 98, end: 128 },
          { label: "DevOps / SRE", start: 118, end: 152 },
          { label: "Data Analyst", start: 85, end: 104 },
        ],
      },
    },
  },
  {
    title: "Timeline",
    description: "Horizontal scrollable timeline. Drag or use arrow buttons to explore events.",
    section: {
      type: "widget",
      widgetType: "timeline",
      label: "Major AI Milestones 2022–2024",
      insight: "From GPT-3.5 to Claude 3 Opus in just 18 months — the pace of progress is unprecedented.",
      props: {
        align: "highlighted",
        events: [
          {
            label: "Nov 2022",
            title: "ChatGPT launches",
            description: "OpenAI releases ChatGPT, reaching 1M users in 5 days.",
            highlight: false,
          },
          {
            label: "Mar 2023",
            title: "GPT-4 released",
            description: "Multimodal capabilities and dramatic reasoning improvements.",
            highlight: false,
          },
          {
            label: "Jul 2023",
            title: "Claude 2 ships",
            description: "Anthropic's 100K context window model enters the market.",
            highlight: false,
          },
          {
            label: "Nov 2023",
            title: "GPT-4 Turbo",
            description: "128K context, knowledge to Apr 2023, 3× cheaper than GPT-4.",
            highlight: false,
          },
          {
            label: "Mar 2024",
            title: "Claude 3 Opus",
            description: "Surpasses GPT-4 on multiple benchmarks.",
            highlight: true,
            current: true,
          },
          {
            label: "May 2024",
            title: "GPT-4o",
            description: "Real-time audio, vision, and text in one unified model.",
            highlight: false,
          },
          {
            label: "Sep 2024",
            title: "o1 reasoning model",
            description: "Chain-of-thought reasoning approach sets new science benchmarks.",
            highlight: false,
          },
        ],
      },
    },
  },
  {
    title: "Timeline Magnitude",
    description: "Timeline with bar heights representing relative magnitude of each event.",
    section: {
      type: "widget",
      widgetType: "timeline-magnitude",
      label: "Open Source Stars Gained per Month 2024",
      insight: "The March spike in stars correlated with a viral Hacker News post reaching the front page.",
      props: {
        events: [
          { label: "Jan", value: 1200, type: "past", description: "Steady baseline growth" },
          { label: "Feb", value: 1450, type: "past", description: "New README and docs" },
          { label: "Mar", value: 4800, type: "past", description: "Viral HN post" },
          { label: "Apr", value: 2100, type: "past", description: "Post-viral retention" },
          { label: "May", value: 1700, type: "past", description: "v2.0 release" },
          { label: "Jun", value: 1900, type: "current", description: "Current month" },
          { label: "Jul", value: 2200, type: "future", description: "Conference talk" },
          { label: "Aug", value: 1600, type: "future", description: "Summer slowdown" },
        ],
      },
    },
  },
  {
    title: "Heatmap",
    description: "Color-intensity grid for visualizing patterns across two dimensions.",
    section: {
      type: "widget",
      widgetType: "heatmap",
      label: "Developer Activity by Hour & Day",
      insight: "Peak commit activity happens Tuesday–Thursday 10am–3pm UTC — globally consistent.",
      props: {
        unit: "commits",
        cells: [
          // Mon
          { x: "Mon", y: "Morning", value: 42 },
          { x: "Mon", y: "Afternoon", value: 78 },
          { x: "Mon", y: "Evening", value: 31 },
          // Tue
          { x: "Tue", y: "Morning", value: 68 },
          { x: "Tue", y: "Afternoon", value: 95 },
          { x: "Tue", y: "Evening", value: 44 },
          // Wed
          { x: "Wed", y: "Morning", value: 71 },
          { x: "Wed", y: "Afternoon", value: 98 },
          { x: "Wed", y: "Evening", value: 40 },
          // Thu
          { x: "Thu", y: "Morning", value: 65 },
          { x: "Thu", y: "Afternoon", value: 88 },
          { x: "Thu", y: "Evening", value: 37 },
          // Fri
          { x: "Fri", y: "Morning", value: 55 },
          { x: "Fri", y: "Afternoon", value: 62 },
          { x: "Fri", y: "Evening", value: 25 },
          // Sat
          { x: "Sat", y: "Morning", value: 22 },
          { x: "Sat", y: "Afternoon", value: 34 },
          { x: "Sat", y: "Evening", value: 18 },
          // Sun
          { x: "Sun", y: "Morning", value: 15 },
          { x: "Sun", y: "Afternoon", value: 28 },
          { x: "Sun", y: "Evening", value: 20 },
        ],
      },
    },
  },
  {
    title: "Waterfall Chart",
    description: "Shows cumulative value changes across sequential steps.",
    section: {
      type: "widget",
      widgetType: "waterfall-chart",
      label: "Tech Layoffs Net Headcount Change 2023",
      insight: "Despite 91K layoffs in Big Tech, new hiring in AI divisions offset 67% of losses.",
      props: {
        unit: "K employees",
        steps: [
          { label: "Jan Baseline", value: 420, type: "total" },
          { label: "Big Tech Layoffs", value: -91, type: "delta" },
          { label: "Startup Closures", value: -24, type: "delta" },
          { label: "AI Org Hiring", value: 61, type: "delta" },
          { label: "Mid-Market Growth", value: 38, type: "delta" },
          { label: "Dec Final", value: 404, type: "total" },
        ],
      },
    },
  },
  {
    title: "Radar Chart",
    description:
      "Multi-axis spider chart for comparing entities across shared dimensions. Ideal for profile or scorecard comparisons.",
    section: {
      type: "widget",
      widgetType: "radar-chart",
      label: "Startup Ecosystem Scorecard 2024",
      insight:
        "Silicon Valley still leads on funding and talent depth, but London and Berlin are closing the gap on regulatory clarity and diversity.",
      props: {
        axes: ["Funding", "Talent", "Innovation", "Regulation", "Diversity"],
        series: [
          { label: "Silicon Valley", values: [98, 92, 95, 55, 62] },
          { label: "London", values: [75, 82, 78, 80, 74] },
          { label: "Berlin", values: [58, 70, 72, 82, 78] },
        ],
        unit: "score",
      },
    },
  },
  {
    title: "Treemap",
    description:
      "Proportional rectangles for showing part-of-whole composition. Area encodes relative size at a glance.",
    section: {
      type: "widget",
      widgetType: "treemap",
      label: "Global AI Investment by Category 2024",
      insight:
        "Foundation models captured nearly half of all AI investment in 2024, dwarfing applied AI and infrastructure combined.",
      props: {
        nodes: [
          { label: "Foundation Models", value: 48 },
          { label: "Applied AI", value: 22 },
          { label: "AI Infrastructure", value: 16 },
          { label: "AI Safety", value: 8 },
          { label: "Robotics", value: 6 },
        ],
        unit: "% of total",
      },
    },
  },
  {
    title: "Map",
    description:
      "Interactive map built with Leaflet. Plot locations with labels and value-scaled markers. Click markers for details.",
    section: {
      type: "widget",
      widgetType: "map",
      label: "Global Tech Hub Investment 2024",
      insight:
        "Silicon Valley attracted more than triple the investment of any other city, though Asia-Pacific hubs are growing fastest.",
      props: {
        scaledMarkers: true,
        unit: "B USD",
        markers: [
          { lat: 37.4, lng: -122.1, label: "Silicon Valley", value: 98.4, tooltip: "Dominates global VC in AI & semiconductors" },
          { lat: 51.5, lng: -0.1, label: "London", value: 28.7, tooltip: "Europe's largest tech hub" },
          { lat: 52.5, lng: 13.4, label: "Berlin", value: 12.3, tooltip: "Strong in fintech & SaaS" },
          { lat: 35.7, lng: 139.7, label: "Tokyo", value: 18.9, tooltip: "Robotics & semiconductors" },
          { lat: 1.35, lng: 103.8, label: "Singapore", value: 22.1, tooltip: "Asia-Pacific gateway" },
          { lat: 22.3, lng: 114.2, label: "Hong Kong", value: 14.5, tooltip: "Fintech & crypto hub" },
          { lat: 40.7, lng: -74.0, label: "New York", value: 41.2, tooltip: "Fintech, media & adtech" },
          { lat: 47.6, lng: -122.3, label: "Seattle", value: 19.8, tooltip: "Cloud & e-commerce infrastructure" },
        ],
      },
    },
  },
];

export default function DemoPage() {
  return (
    <>
      <style>{`
        ${FONT_IMPORT}
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${C.bg}; color: ${C.text}; font-family: 'Geist', sans-serif; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 2px; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .demo-widget-card {
          animation: fadeUp 0.5s ease both;
        }

        .demo-widget-section-title {
          font-family: 'Geist Mono', monospace;
          font-size: 13px;
          font-weight: 500;
          color: ${C.white};
          margin-bottom: 4px;
        }

        .demo-widget-section-desc {
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 12px;
          color: ${C.muted};
          line-height: 1.6;
          margin-bottom: 0;
        }

        @media (max-width: 640px) {
          .demo-header { padding: 0 12px !important; }
          .demo-main { padding: 24px 12px 48px !important; }
        }
      `}</style>

      <BgCanvas opacity={0.06} />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "15px 16px 80px",
        }}
      >
        {/* Header */}
        <header
          className="demo-header"
          style={{
            height: 52,
            width: "100%",
            maxWidth: 860,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
          }}
        >
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: ACCENT,
                boxShadow: `0 0 12px ${ACCENT}`,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: 13,
                fontWeight: 500,
                color: C.white,
                letterSpacing: "0.05em",
              }}
            >
              Pagelight AI
            </span>
          </Link>

          <Link
            href="/"
            style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: 11,
              color: C.muted,
              background: "transparent",
              border: `1px solid ${C.border}`,
              borderRadius: 6,
              padding: "5px 12px",
              cursor: "pointer",
              transition: "all 0.2s",
              flexShrink: 0,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <IconArrowLeft size={14} />
            Back to app
          </Link>
        </header>

        {/* Hero */}
        <div
          style={{
            maxWidth: 860,
            width: "100%",
            padding: "40px 0 36px",
            borderBottom: `1px solid ${C.border}`,
            marginBottom: 40,
          }}
        >
          <p
            style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: 11,
              color: ACCENT,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            /demo
          </p>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(28px, 5vw, 48px)",
              fontWeight: 700,
              color: C.white,
              lineHeight: 1.15,
              letterSpacing: "-0.5px",
              marginBottom: 14,
            }}
          >
            Widget Gallery
          </h1>
          <p
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: 14,
              color: C.muted,
              lineHeight: 1.7,
              maxWidth: "55ch",
            }}
          >
            All {DEMO_WIDGETS.length} chart and data widgets rendered with realistic dummy data.
            Each widget supports an accent colour, label, and insight callout.
          </p>
        </div>

        {/* Widget grid */}
        <main
          className="demo-main"
          style={{
            width: "100%",
            maxWidth: 860,
            display: "flex",
            flexDirection: "column",
            gap: 0,
            padding: "0 0 48px",
          }}
        >
          {DEMO_WIDGETS.map(({ title, description, section }, i) => (
            <div
              key={section.widgetType + i}
              className="demo-widget-card"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 10,
                  marginBottom: 4,
                  paddingTop: 8,
                }}
              >
                <span className="demo-widget-section-title">{title}</span>
                <span
                  style={{
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: 10,
                    color: ACCENT,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  {section.widgetType}
                </span>
              </div>
              <p className="demo-widget-section-desc">{description}</p>
              <Widget section={section} accent={ACCENT} accentDim={ACCENT_DIM} />
            </div>
          ))}
        </main>
      </div>
    </>
  );
}
