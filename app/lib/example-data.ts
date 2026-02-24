import type { ArticleDocument } from "./types";

export const EXAMPLE_ARTICLE_DATA: Record<string, ArticleDocument> = {
  "https://techcrunch.com/2023/01/17/putting-numbers-on-the-global-venture-slowdown/": {
    title: "Putting Numbers on the Global Venture Slowdown",
    deck: "Global VC funding fell 35% to $415.1B in 2022 as mega-rounds collapsed and investor caution set in after a record 2021.",
    byline: "Anna Heim",
    date: "January 2023",
    theme: "financial",
    source: "TechCrunch",
    sourceUrl:
      "https://techcrunch.com/2023/01/17/putting-numbers-on-the-global-venture-slowdown/",
    sections: [
      {
        type: "prose",
        heading: null,
        paragraphs: [
          "After an unprecedented boom in 2021, the global venture capital market experienced a sharp correction in 2022. Total funding fell 35% from $639B to $415.1B, as rising interest rates, public market volatility, and recession fears prompted investors to tighten their purse strings and reassess valuations.",
          "The slowdown was most pronounced in large deals. Mega-rounds — financings of $100M or more — fell 42% year-over-year, a clear sign that the era of easy money for late-stage startups had come to an abrupt end.",
        ],
      },
      {
        type: "widget",
        widgetType: "stat-comparison",
        label: "Global VC Funding: 2021 vs 2022",
        insight: "A $224B collapse in a single year marks the steepest annual decline in venture history.",
        props: {
          left: { label: "2021 (Record)", value: 639, unit: "B USD", prefix: "$" },
          right: { label: "2022", value: 415.1, unit: "B USD", prefix: "$" },
          description: "Global venture capital deployed, full year",
        },
      },
      {
        type: "widget",
        widgetType: "bar-chart",
        label: "VC Funding by Year (2019–2022)",
        insight: "2021 was an anomaly — 2022 funding still exceeded every pre-pandemic year.",
        props: {
          unit: "B USD",
          bars: [
            { label: "2019", value: 267 },
            { label: "2020", value: 294 },
            { label: "2021", value: 639, highlight: true },
            { label: "2022", value: 415.1 },
          ],
        },
      },
      {
        type: "prose",
        heading: "Mega-Rounds Bear the Brunt",
        paragraphs: [
          "The steepest drops were at the top of the funding ladder. Mega-rounds of $100M or more fell 42% as investors shied away from writing large checks at lofty valuations. Late-stage deal counts also declined sharply, while seed and early-stage funding proved more resilient.",
          "Geographically, the United States remained the dominant market, but its share shrank as European and Asian VC markets also pulled back. The number of new unicorns minted in 2022 fell dramatically compared to the 2021 peak.",
        ],
      },
      {
        type: "widget",
        widgetType: "waterfall-chart",
        label: "Where the $224B Decline Came From",
        insight: "Late-stage and mega-round compression drove most of the funding decline in 2022.",
        props: {
          unit: "B USD",
          steps: [
            { label: "2021 Total", value: 639, type: "total" },
            { label: "Mega-rounds drop", value: -112, type: "delta" },
            { label: "Late-stage decline", value: -76, type: "delta" },
            { label: "Early-stage decline", value: -36, type: "delta" },
            { label: "2022 Total", value: 415.1, type: "total" },
          ],
        },
      },
      {
        type: "widget",
        widgetType: "progress-bars",
        label: "Year-over-Year Decline by Stage",
        insight: "Mega-rounds fell hardest while seed funding was the most resilient category.",
        props: {
          items: [
            { label: "Mega-rounds ($100M+)", sub: "42% decline year-over-year", value: 42, sentiment: "negative" },
            { label: "Late-stage (Series C+)", sub: "38% decline year-over-year", value: 38, sentiment: "negative" },
            { label: "Early-stage (Series A/B)", sub: "28% decline year-over-year", value: 28, sentiment: "negative" },
            { label: "Seed funding", sub: "14% decline year-over-year", value: 14, sentiment: "neutral" },
          ],
        },
      },
      {
        type: "prose",
        heading: "What Comes Next",
        paragraphs: [
          "Analysts expect the slowdown to persist into 2023, with deal timelines lengthening, valuations resetting, and a continued focus on profitability over growth. The correction, while painful, may ultimately produce a healthier funding environment with more sustainable startup valuations.",
        ],
      },
    ],
  },

  "https://ourworldindata.org/electric-car-sales": {
    title: "Tracking Global Data on Electric Vehicles",
    deck: "One in five new cars sold globally in 2023 was electric — a milestone driven by Norway's near-total adoption and China's manufacturing scale.",
    byline: "Hannah Ritchie",
    date: "2024",
    theme: "environment",
    source: "Our World in Data",
    sourceUrl: "https://ourworldindata.org/electric-car-sales",
    sections: [
      {
        type: "prose",
        heading: null,
        paragraphs: [
          "Electric vehicle adoption has crossed a significant threshold. In 2023, one in every five new cars sold worldwide was electric — a milestone that would have seemed impossible just a decade ago. The transition is being driven by plummeting battery costs, expanding charging infrastructure, and aggressive government policy across major markets.",
          "The pace of adoption varies dramatically by country, with Norway leading the world at 92% EV share and the United States still in early adoption at 8%.",
        ],
      },
      {
        type: "widget",
        widgetType: "unit-chart",
        label: "Global EV Market Share 2023",
        insight: "1 in 5 new cars sold globally in 2023 was electric, up from 1 in 25 just three years earlier.",
        props: {
          total: 100,
          highlighted: 20,
          unit: "new cars sold",
          description: "Are battery electric or plug-in hybrid vehicles",
        },
      },
      {
        type: "widget",
        widgetType: "bar-chart",
        label: "EV Share of New Car Sales by Country (2023)",
        insight: "Norway leads the world at 92% — the result of decades of consistent EV incentive policy.",
        props: {
          unit: "% of new car sales",
          bars: [
            { label: "Norway", value: 92, highlight: true },
            { label: "Iceland", value: 72 },
            { label: "Sweden", value: 54 },
            { label: "China", value: 50 },
            { label: "Finland", value: 47 },
            { label: "Netherlands", value: 30 },
            { label: "Germany", value: 18 },
            { label: "USA", value: 8 },
          ],
        },
      },
      {
        type: "prose",
        heading: "China's Manufacturing Dominance",
        paragraphs: [
          "China has become the undisputed center of the global EV industry. Not only does it have the world's largest EV market, with 50% of new car sales being electric, but it also manufactures the majority of the world's EV batteries and a growing share of the vehicles themselves.",
          "Chinese automakers like BYD have emerged as serious global competitors, with BYD surpassing Tesla in total EV sales volume in 2023. This competitive pressure is driving down prices worldwide and accelerating adoption.",
        ],
      },
      {
        type: "widget",
        widgetType: "line-chart",
        label: "Global EV Sales Growth (2015–2023)",
        insight: "Global EV sales have grown 20-fold since 2015, reaching 14 million vehicles in 2023.",
        props: {
          yLabel: "Million EVs sold",
          unit: "M",
          points: [
            { x: "2015", y: 0.5 },
            { x: "2016", y: 0.8 },
            { x: "2017", y: 1.2 },
            { x: "2018", y: 2.1 },
            { x: "2019", y: 2.3 },
            { x: "2020", y: 3.2 },
            { x: "2021", y: 6.8 },
            { x: "2022", y: 10.4 },
            { x: "2023", y: 14.0 },
          ],
        },
      },
      {
        type: "widget",
        widgetType: "donut-chart",
        label: "Global EV Sales by Region (2023)",
        insight: "China accounts for 60% of all EVs sold globally, making it the dominant force in the transition.",
        props: {
          segments: [
            { label: "China", value: 8.4 },
            { label: "Europe", value: 3.2 },
            { label: "USA", value: 1.6 },
            { label: "Rest of World", value: 0.8 },
          ],
          centerValue: "14M",
          centerLabel: "EVs sold",
        },
      },
      {
        type: "prose",
        heading: "The Road Ahead",
        paragraphs: [
          "At current growth rates, electric vehicles could represent 40-50% of new car sales globally by 2030. Battery costs continue to fall, and charging infrastructure is expanding rapidly across Europe and North America. The transition is accelerating — the question is no longer if, but when the internal combustion engine becomes obsolete.",
        ],
      },
    ],
  },

  "https://techcrunch.com/2025/01/03/generative-ai-funding-reached-new-heights-in-2024/": {
    title: "Generative AI Funding Reached New Heights in 2024",
    deck: "Generative AI startups raised $56B globally in 2024 — a 92% surge — as investors bet that foundation models will reshape every industry.",
    byline: "Kyle Wiggers",
    date: "January 2025",
    theme: "tech",
    source: "TechCrunch",
    sourceUrl:
      "https://techcrunch.com/2025/01/03/generative-ai-funding-reached-new-heights-in-2024/",
    sections: [
      {
        type: "prose",
        heading: null,
        paragraphs: [
          "Generative AI investment surged to historic levels in 2024, with startups in the space raising $56 billion globally — a 92% increase from the $29.1 billion raised in 2023. The year was defined by massive rounds for foundation model companies, infrastructure providers, and enterprise AI application builders.",
          "The funding surge was concentrated at the top: a handful of companies — OpenAI, Anthropic, xAI, and a few others — captured a disproportionate share of the capital.",
        ],
      },
      {
        type: "widget",
        widgetType: "stat-comparison",
        label: "Generative AI Funding: 2023 vs 2024",
        insight: "The 92% year-over-year surge represents the largest single-year jump in AI investment history.",
        props: {
          left: { label: "2023", value: 29.1, unit: "B USD", prefix: "$" },
          right: { label: "2024", value: 56, unit: "B USD", prefix: "$" },
          description: "Total venture investment in generative AI startups, global",
        },
      },
      {
        type: "widget",
        widgetType: "line-chart",
        label: "Generative AI Funding by Year (2019–2024)",
        insight: "Funding has grown 18-fold since 2019, accelerating sharply after ChatGPT's launch in late 2022.",
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
      {
        type: "prose",
        heading: "Foundation Models Attract the Biggest Checks",
        paragraphs: [
          "The largest rounds of 2024 went to companies building the fundamental models that power the AI ecosystem. OpenAI closed a $6.6B round at a $157B valuation, while Anthropic raised $4B from Amazon and additional capital from Google. Elon Musk's xAI raised $6B for its Grok model.",
          "Enterprise AI applications and AI infrastructure companies also saw significant investment, as businesses rushed to build on top of the foundation model layer.",
        ],
      },
      {
        type: "widget",
        widgetType: "comparison-table",
        label: "Largest Generative AI Rounds of 2024",
        insight: "OpenAI, xAI, and Anthropic together raised over $16B — nearly 30% of total GenAI funding.",
        props: {
          highlight: "OpenAI",
          unit: "B USD",
          rows: [
            { name: "OpenAI", value: 6.6, note: "$157B valuation" },
            { name: "xAI (Grok)", value: 6.0, note: "Elon Musk's AI lab" },
            { name: "Anthropic", value: 4.0, note: "Amazon-led round" },
            { name: "Waymo", value: 5.6, note: "Autonomous driving" },
            { name: "Safe Superintelligence", value: 1.0, note: "Ilya Sutskever's lab" },
          ],
        },
      },
      {
        type: "widget",
        widgetType: "treemap",
        label: "Generative AI Investment by Category (2024)",
        insight: "Foundation models captured 43% of all GenAI investment, reflecting the race for model supremacy.",
        props: {
          nodes: [
            { label: "Foundation Models", value: 43 },
            { label: "Enterprise AI Apps", value: 27 },
            { label: "AI Infrastructure", value: 18 },
            { label: "Autonomous Agents", value: 8 },
            { label: "AI Safety", value: 4 },
          ],
          unit: "% of total funding",
        },
      },
      {
        type: "prose",
        heading: "What 2025 Holds",
        paragraphs: [
          "Analysts expect the investment pace to continue in 2025 as enterprises move from experimentation to production AI deployments. The focus is shifting toward specialized models, agentic systems, and AI that can take real-world actions — areas expected to attract the next wave of capital.",
        ],
      },
    ],
  },

  "https://www.theverge.com/2024/2/1/24058442/apple-q1-2024-earnings-iphone": {
    title: "Apple Q1 2024: iPad Decline Meets iPhone and Services Records",
    deck: "Apple posted $119.6B in quarterly revenue as Services hit an all-time record of $23.1B — but iPad and Mac sales disappointed.",
    byline: "David Pierce",
    date: "February 2024",
    theme: "financial",
    source: "The Verge",
    sourceUrl:
      "https://www.theverge.com/2024/2/1/24058442/apple-q1-2024-earnings-iphone",
    sections: [
      {
        type: "prose",
        heading: null,
        paragraphs: [
          "Apple reported its fiscal first quarter 2024 earnings with $119.6 billion in revenue, a modest 2% year-over-year increase. The headline number masked a tale of two Apples: a booming Services business and resurgent iPhone sales on one side, and declining iPad and Mac performance on the other.",
          "The quarter's standout was the Services segment, which hit an all-time revenue record of $23.1 billion — fueled by the App Store, iCloud, Apple Music, and a growing advertising business.",
        ],
      },
      {
        type: "widget",
        widgetType: "wave-counter",
        label: "Q1 FY2024 Revenue",
        insight: "Apple's $119.6B quarter makes it one of the most profitable single quarters in corporate history.",
        props: {
          value: 119.6,
          prefix: "$",
          suffix: "B",
          unit: "total revenue",
          description: "Apple fiscal Q1 2024 (October–December 2023)",
        },
      },
      {
        type: "widget",
        widgetType: "kpi-scorecards",
        label: "Q1 FY2024 Segment Performance",
        insight: "Services is now Apple's second-largest business segment — bigger than Mac, iPad, and Wearables combined.",
        props: {
          items: [
            {
              label: "iPhone Revenue",
              value: 69.7,
              prefix: "$",
              suffix: "B",
              delta: 6,
              deltaLabel: "YoY growth",
              sentiment: "positive",
            },
            {
              label: "Services Revenue",
              value: 23.1,
              prefix: "$",
              suffix: "B",
              delta: 11,
              deltaLabel: "YoY growth — all-time record",
              sentiment: "positive",
            },
            {
              label: "Mac Revenue",
              value: 7.8,
              prefix: "$",
              suffix: "B",
              delta: -1,
              deltaLabel: "YoY decline",
              sentiment: "negative",
            },
            {
              label: "iPad Revenue",
              value: 7.0,
              prefix: "$",
              suffix: "B",
              delta: -25,
              deltaLabel: "YoY decline",
              sentiment: "negative",
            },
          ],
        },
      },
      {
        type: "prose",
        heading: "Services: The New Apple",
        paragraphs: [
          "The Services segment's $23.1B in revenue represents a fundamental shift in Apple's business model. With higher margins than hardware, Services is now a critical driver of Apple's profitability. The segment includes the App Store, Apple Music, Apple TV+, iCloud storage, Apple Pay, and a growing advertising business.",
          "Apple now counts over 2.2 billion active devices worldwide, each representing a potential subscriber for its expanding portfolio of services — a competitive moat that's increasingly difficult for rivals to breach.",
        ],
      },
      {
        type: "widget",
        widgetType: "bar-chart",
        label: "Revenue by Product Segment — Q1 FY2024",
        insight: "iPhone generates 58% of Apple's total revenue, with Services as a fast-growing second engine.",
        props: {
          unit: "B USD",
          bars: [
            { label: "iPhone", value: 69.7, highlight: true },
            { label: "Services", value: 23.1 },
            { label: "Mac", value: 7.8 },
            { label: "iPad", value: 7.0 },
            { label: "Wearables & Home", value: 12.0 },
          ],
        },
      },
      {
        type: "widget",
        widgetType: "slope-chart",
        label: "Segment Revenue Growth: Q1 FY2023 vs Q1 FY2024",
        insight: "Services and iPhone grew while iPad suffered its steepest quarterly decline in years.",
        props: {
          leftLabel: "Q1 FY2023",
          rightLabel: "Q1 FY2024",
          unit: "B USD",
          items: [
            { label: "iPhone", start: 65.8, end: 69.7 },
            { label: "Services", start: 20.8, end: 23.1 },
            { label: "Mac", start: 7.9, end: 7.8 },
            { label: "Wearables", start: 13.5, end: 12.0 },
            { label: "iPad", start: 9.4, end: 7.0 },
          ],
        },
      },
      {
        type: "prose",
        heading: "Looking Ahead",
        paragraphs: [
          "Apple guided for \"low-to-mid single digit\" revenue growth in Q2 FY2024. The company is betting on its Vision Pro spatial computing headset and continued Services growth to drive the next phase of expansion. Analysts remain bullish on the Services trajectory, even as hardware growth moderates.",
        ],
      },
    ],
  },

  "https://techcrunch.com/2025/01/22/ai-apps-saw-over-1-billion-in-consumer-spending-in-2024/": {
    title: "AI Apps Saw Over $1 Billion in Consumer Spending in 2024",
    deck: "Consumers spent more than $1B on AI-powered mobile apps in 2024, with 7.7 billion hours logged and 17 billion AI-featured downloads.",
    byline: "Sarah Perez",
    date: "January 2025",
    theme: "tech",
    source: "TechCrunch",
    sourceUrl:
      "https://techcrunch.com/2025/01/22/ai-apps-saw-over-1-billion-in-consumer-spending-in-2024/",
    sections: [
      {
        type: "prose",
        heading: null,
        paragraphs: [
          "Consumer AI apps crossed a major commercial threshold in 2024: for the first time, they generated over $1 billion in direct consumer spending. The milestone reflects rapid mainstream adoption of AI assistants, image generators, and productivity tools on mobile platforms.",
          "The data, compiled across iOS and Android, shows that 17 billion app downloads in 2024 featured some form of AI capability — representing a massive expansion from just two years prior.",
        ],
      },
      {
        type: "widget",
        widgetType: "kpi-scorecards",
        label: "AI Apps: 2024 by the Numbers",
        insight: "The $1B consumer spending milestone puts AI apps on par with the early days of the games and streaming app economies.",
        props: {
          items: [
            {
              label: "Consumer Spending",
              value: 1,
              prefix: "$",
              suffix: "B+",
              delta: 200,
              deltaLabel: "vs 2022",
              sentiment: "positive",
            },
            {
              label: "Hours Spent on AI Apps",
              value: 7.7,
              suffix: "B",
              delta: 85,
              deltaLabel: "YoY growth",
              sentiment: "positive",
            },
            {
              label: "AI-Featured Downloads",
              value: 17,
              suffix: "B",
              delta: 60,
              deltaLabel: "YoY growth",
              sentiment: "positive",
            },
          ],
        },
      },
      {
        type: "prose",
        heading: "ChatGPT Leads, But Competition Is Growing",
        paragraphs: [
          "ChatGPT remained the dominant consumer AI app by revenue and usage, but a wave of competitors emerged in 2024. Image generation apps, AI companion apps, and AI-powered productivity tools all saw rapid growth. Google's Gemini and Microsoft's Copilot also expanded their mobile presence significantly.",
          "The most-downloaded AI app categories were chatbots and assistants, AI photo editors, and AI writing tools — collectively accounting for over 70% of total AI app spending.",
        ],
      },
      {
        type: "widget",
        widgetType: "donut-chart",
        label: "AI App Spending by Category (2024)",
        insight: "Chatbots and AI assistants dominate consumer spending, capturing nearly half of all AI app revenue.",
        props: {
          segments: [
            { label: "Chatbots & Assistants", value: 48 },
            { label: "AI Photo & Video", value: 27 },
            { label: "AI Writing Tools", value: 14 },
            { label: "AI Audio & Music", value: 7 },
            { label: "Other AI", value: 4 },
          ],
          centerValue: "$1B+",
          centerLabel: "total spent",
        },
      },
      {
        type: "widget",
        widgetType: "line-chart",
        label: "AI App Consumer Spending Growth (2021–2024)",
        insight: "AI app spending has grown 10x in three years, with the steepest acceleration occurring after ChatGPT's launch.",
        props: {
          yLabel: "USD",
          unit: "M",
          points: [
            { x: "2021", y: 95 },
            { x: "2022", y: 190 },
            { x: "2023", y: 560 },
            { x: "2024", y: 1030 },
          ],
        },
      },
      {
        type: "widget",
        widgetType: "bar-chart",
        label: "Time Spent on Top AI App Categories (2024)",
        insight: "Users spend nearly 4x more time in AI chatbots than any other AI app category.",
        props: {
          unit: "B hours",
          bars: [
            { label: "Chatbots & Assistants", value: 4.2, highlight: true },
            { label: "AI Photo & Video", value: 1.8 },
            { label: "AI Writing Tools", value: 0.9 },
            { label: "AI Audio & Music", value: 0.5 },
            { label: "Other AI Apps", value: 0.3 },
          ],
        },
      },
      {
        type: "prose",
        heading: "What's Next for AI Consumer Apps",
        paragraphs: [
          "Analysts expect AI app spending to surpass $5B by 2027 as capabilities improve and more consumers integrate AI tools into their daily workflows. The next frontier is agentic AI — apps that can take actions on the user's behalf, not just generate text or images. This category is expected to drive the next wave of consumer AI adoption.",
        ],
      },
    ],
  },

  "https://stackoverflow.blog/2024/08/06/2024-developer-survey/": {
    title: "Stack Overflow Developer Survey 2024",
    deck: "65,437 developers surveyed: JavaScript leads for the 12th year, PostgreSQL overtakes MySQL, and 76% use or plan to use AI coding tools.",
    byline: null,
    date: "August 2024",
    theme: "tech",
    source: "Stack Overflow",
    sourceUrl: "https://stackoverflow.blog/2024/08/06/2024-developer-survey/",
    sections: [
      {
        type: "prose",
        heading: null,
        paragraphs: [
          "Stack Overflow's annual Developer Survey is one of the most comprehensive snapshots of the global developer community. The 2024 edition gathered responses from 65,437 developers across 185 countries, covering programming languages, databases, tools, and attitudes toward AI in software development.",
          "The headline findings: JavaScript's 12-year reign at the top continues, PostgreSQL has finally overtaken MySQL as the most-used database, and an overwhelming majority of developers have adopted or are planning to adopt AI coding assistants.",
        ],
      },
      {
        type: "widget",
        widgetType: "bar-chart",
        label: "Most-Used Programming Languages 2024",
        insight: "JavaScript has topped the survey for 12 consecutive years — its versatility across web, server, and mobile keeps it dominant.",
        props: {
          unit: "% of respondents",
          bars: [
            { label: "JavaScript", value: 65.4, highlight: true },
            { label: "Python", value: 51.2 },
            { label: "TypeScript", value: 43.8 },
            { label: "Java", value: 30.3 },
            { label: "C#", value: 27.1 },
            { label: "C++", value: 23.5 },
            { label: "Go", value: 14.3 },
            { label: "Rust", value: 12.6 },
          ],
        },
      },
      {
        type: "widget",
        widgetType: "stat-comparison",
        label: "Database Throne Change: PostgreSQL vs MySQL",
        insight: "PostgreSQL overtook MySQL for the first time in the survey's history, ending MySQL's long reign at the top.",
        props: {
          left: { label: "PostgreSQL", value: 49.0, unit: "% usage", prefix: "" },
          right: { label: "MySQL", value: 40.3, unit: "% usage", prefix: "" },
          description: "Most-used databases among professional developers, 2024",
        },
      },
      {
        type: "prose",
        heading: "AI Tools Transform Developer Workflows",
        paragraphs: [
          "The most significant story of the 2024 survey is the rapid adoption of AI coding tools. 76% of developers report using or planning to use AI assistants — up from 44% just two years prior. GitHub Copilot remains the most-used AI coding tool, followed by ChatGPT and Cursor.",
          "Developers are cautiously optimistic: most see AI as a productivity multiplier for repetitive tasks, but express concerns about over-reliance and code quality. The debate over AI's impact on junior developer learning is also prominent.",
        ],
      },
      {
        type: "widget",
        widgetType: "unit-chart",
        label: "AI Tool Adoption Among Developers",
        insight: "76 in 100 developers either currently use or plan to adopt AI coding tools — a sea change from 2022's 44%.",
        props: {
          total: 100,
          highlighted: 76,
          unit: "developers",
          description: "Use or plan to use AI coding assistants in 2024",
        },
      },
      {
        type: "widget",
        widgetType: "comparison-table",
        label: "Most-Used Databases by Developers (2024)",
        insight: "PostgreSQL's rise reflects its power, reliability, and growing adoption in cloud-native architectures.",
        props: {
          highlight: "PostgreSQL",
          unit: "% usage",
          rows: [
            { name: "PostgreSQL", value: 49.0, note: "New #1" },
            { name: "MySQL", value: 40.3, note: "Dethroned after years at top" },
            { name: "SQLite", value: 33.1, note: "Popular in mobile & embedded" },
            { name: "Microsoft SQL Server", value: 24.4, note: "Enterprise staple" },
            { name: "MongoDB", value: 24.1, note: "Leading NoSQL" },
            { name: "Redis", value: 18.7, note: "Caching & session stores" },
          ],
        },
      },
      {
        type: "widget",
        widgetType: "progress-bars",
        label: "AI Tool Sentiments Among Developers",
        insight: "Most developers are optimistic about AI tools, but trust in AI-generated code remains a significant concern.",
        props: {
          items: [
            { label: "Increased productivity", sub: "Developers who say AI has made them more productive", value: 81, sentiment: "positive" },
            { label: "Use AI for writing code", sub: "Developers who use AI to write or complete code", value: 71, sentiment: "positive" },
            { label: "Use AI for debugging", sub: "Developers who use AI to debug or fix code", value: 59, sentiment: "positive" },
            { label: "Trust AI code output", sub: "Developers who trust AI-generated code without review", value: 28, sentiment: "negative" },
          ],
        },
      },
      {
        type: "prose",
        heading: "The Developer Community in 2024",
        paragraphs: [
          "The survey also highlights a developer community in transition. Remote work remains predominant, with 42% of developers working fully remote. TypeScript's growth continues unabated, with many teams migrating JavaScript codebases. And Rust, despite its small user base, tops the \"most admired\" language list for the ninth consecutive year.",
        ],
      },
    ],
  },
};
