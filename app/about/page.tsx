import Link from "next/link";
import Image from "next/image";
import {
  IconChartHistogram,
  IconKeyframes,
  IconNews,
  IconArrowLeft,
  IconBrandGithub,
  IconWorld,
} from "@tabler/icons-react";

import { BgCanvas } from "../components/ui/BgCanvas";
import GlowText from "../components/ui/GlowText";
import { C } from "../lib/theme";
import ContentSection from "../components/ui/ContentSection";

const FONT_IMPORT = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@300;400;500&family=Geist+Mono:wght@400;500&family=Geist:wght@300;400;500&display=swap');
`;

const ACCENT = "#c8f04a";
const ACCENT_GRADIENT = "linear-gradient(135deg, #c8f04a 0%, #89c42a 100%)";

export default function AboutPage() {
  return (
    <>
      <style>{`
        ${FONT_IMPORT}
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${C.bg}; color: ${C.text}; font-family: 'Geist', sans-serif; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 2px; }

        p {
            font-size: 14px;
            color: ${C.text};
            font-weight: 300;
            line-height: 1.8;
        }
      `}</style>

      <BgCanvas opacity={0.08} />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "15px 16px 64px",
        }}
      >
        <header
          style={{
            borderRadius: C.borderRadius,
            padding: "0 16px",
            height: 52,
            width: "100%",
            maxWidth: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
          }}
        >
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexShrink: 0,
              userSelect: "none",
              textDecoration: "none",
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

        <main
          style={{
            width: "100%",
            maxWidth: "70ch",
            padding: "48px 8px 0",
            display: "flex",
            flexDirection: "column",
            gap: 28,
          }}
        >
          {/* Hero */}
          <section
            style={{
              maxWidth: 600,
              width: "100%",
              margin: "auto",
              marginBottom: 10,
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: 11,
                color: ACCENT,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                marginBottom: 20,
              }}
            >
              /About
            </p>
            <h1
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: "clamp(36px, 6vw, 64px)",
                lineHeight: 1.1,
                color: C.white,
                letterSpacing: "-1px",
                marginBottom: 16,
              }}
            >
              Pagelight Turns Articles
              <br />
              <span style={{ color: ACCENT, fontStyle: "italic" }}>
                <GlowText text="Into Living Stories" pauseMs={2000} strength={0.9} color={ACCENT} />
              </span>
            </h1>
            <p
              style={{
                fontSize: 15,
                color: C.muted,
                lineHeight: 1.7,
                fontWeight: 300,
              }}
            >
              Paste a URL or article text, and Pagelight extracts key data points and narrative
              structure, then renders an editorial-style layout with visualizations woven
              throughout.
            </p>
          </section>

          <section style={{ display: "flex", justifyContent: "center", marginBottom: 60 }}>
            <Link
              href="/"
              style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: 12,
                fontWeight: 500,
                background: ACCENT_GRADIENT,
                color: C.bg,
                border: "none",
                borderRadius: 10,
                padding: "12px 14px",
                cursor: "pointer",
                transition: "all 0.2s",
                letterSpacing: "0.05em",
                textDecoration: "none",
              }}
            >
              Try it now →
            </Link>
          </section>

          <ContentSection title="Features" accent={ACCENT}>
            <div
              style={{
                display: "flex",
                gap: 18,
                flexWrap: "wrap",
              }}
            >
              {[
                {
                  icon: (
                    <IconChartHistogram key="v" size={17} style={{ display: "inline-block" }} />
                  ),
                  title: "Visualizations",
                  sub: "Animated charts and graphs",
                },
                {
                  icon: <IconKeyframes key="e" size={17} style={{ display: "inline-block" }} />,
                  title: "Editorial Design",
                  sub: "Custom aesthetic per article",
                },
                {
                  icon: <IconNews key="n" size={17} style={{ display: "inline-block" }} />,
                  title: "Woven Narrative",
                  sub: "Visuals placed between text",
                },
              ].map(({ icon, title, sub }) => (
                <div
                  key={title}
                  style={{
                    flex: "1 1 120px",
                    minWidth: 120,
                  }}
                >
                  <div
                    style={{
                      color: ACCENT,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 8,
                    }}
                  >
                    {icon}
                    <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 13 }}>
                      {title}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: C.muted }}>{sub}</div>
                </div>
              ))}
            </div>
          </ContentSection>

          <ContentSection title="How it works" accent={ACCENT}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <p>
                At its core, Pagelight uses the{" "}
                <a
                  href="https://www.anthropic.com/claude/sonnet"
                  target="_blank"
                  style={{ color: ACCENT }}
                >
                  Claude Sonnet 4.6
                </a>{" "}
                LLM to analyze the structure and content of an article, blog post or report. It
                identifies key data points, trends, and narrative elements, then picks pre-built
                visualizations that complement the text.
              </p>

              <p>
                Finally it combines the analyzed data and selected visualizations into a custom page
                that weaves visuals between paragraphs, creating a more engaging reading experience
              </p>

              <p>
                Before using Pagelight you need to provide a{" "}
                <a
                  href="https://platform.claude.com/settings/keys"
                  target="_blank"
                  style={{ color: ACCENT }}
                >
                  Anthropic API key
                </a>
                . Your API key will be stored locally in your browser and is never sent to our
                servers or anyone else except Anthropic.
              </p>
            </div>
          </ContentSection>

          <ContentSection title="Why it was built" accent={ACCENT}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <p>
                This started as a fun experiment: using AI to spice up long-form reading by pulling
                out the “interesting bits” and giving them a visual home. Articles are full of
                numbers, comparisons, and timelines — Pagelight tries to make those moments feel
                tangible.
              </p>
              <p>
                Initially built for personal use, I soon realized it could be useful for others too.
                It’s a way to make dense information more engaging and accessible, especially for
                people who are visual learners or just want a fresh way to experience content.
              </p>
            </div>
          </ContentSection>

          <ContentSection
            title="Creator behind Pagelight AI"
            accent={ACCENT}
            style={{ overflow: "hidden" }}
          >
            <div
              style={{
                borderRadius: 12,
                display: "flex",
                gap: 25,
                alignItems: "center",
                flexWrap: "wrap",
                position: "relative",
              }}
            >
              <div
                style={{
                  width: 175,
                  height: 175,
                  flexShrink: 0,
                  borderRadius: 14,
                  border: `1px solid ${C.border}`,
                  overflow: "hidden",
                  background: C.surface,
                }}
              >
                <Image
                  src="https://avatars.githubusercontent.com/u/51766171?v=4"
                  alt="Profile photo"
                  width={175}
                  height={175}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </div>

              <div
                style={{
                  flex: "1 1 280px",
                  minWidth: 240,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  <div style={{ color: C.white, fontWeight: 600 }}>
                    Maximilian Schiller (BetaHuhn)
                  </div>
                  {/* <div style={{ color: C.muted, fontWeight: 300 }}>Product Engineer</div> */}
                </div>

                <p>
                  I&apos;m a product engineer who loves working on open-source projects and building
                  things on the internet. Currently I&apos;m exploring the intersection of AI and
                  personal local-first apps and the interfaces around them.
                </p>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <a
                    href="https://github.com/betahuhn"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      fontFamily: "'Geist Mono', monospace",
                      fontSize: 11,
                      color: C.white,
                      textDecoration: "none",
                      border: `1px solid ${C.border}`,
                      background: C.surface,
                      borderRadius: 10,
                      padding: "8px 10px",
                    }}
                  >
                    <IconBrandGithub size={16} style={{ color: ACCENT }} />
                    GitHub
                  </a>

                  <a
                    href="https://me.mxis.ch"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      fontFamily: "'Geist Mono', monospace",
                      fontSize: 11,
                      color: C.white,
                      textDecoration: "none",
                      border: `1px solid ${C.border}`,
                      background: C.surface,
                      borderRadius: 10,
                      padding: "8px 10px",
                    }}
                  >
                    <IconWorld size={16} style={{ color: ACCENT }} />
                    Website
                  </a>
                </div>
              </div>

              <div style={{ position: "absolute", bottom: -30, right: -30 }}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  direction="ltr"
                  viewBox="1042.19 875.16 162.30 142.45"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ width: 120, height: 120, color: ACCENT }}
                >
                  <defs>
                    <mask id="hash_pattern_mask">
                      <rect x="0" y="0" width="8" height="8" fill="white"></rect>
                      <g strokeLinecap="round" stroke="black">
                        <line x1="0.66" y1="2" x2="2" y2="0.66"></line>
                        <line x1="3.33" y1="4.66" x2="4.66" y2="3.33"></line>
                        <line x1="6" y1="7.33" x2="7.33" y2="6"></line>
                      </g>
                    </mask>
                    <pattern id="hash_pattern" width="8" height="8" patternUnits="userSpaceOnUse">
                      <rect
                        x="0"
                        y="0"
                        width="8"
                        height="8"
                        fill="#fcfffe"
                        mask="url(#hash_pattern_mask)"
                      ></rect>
                    </pattern>
                    <style></style>
                  </defs>
                  <path
                    d="M-0.9556,-2.0984 Q-0.2598,-3.4737 1.24,-5.3817 T4.753,-9.6457 8.68,-14.1893 12.59,-18.5019 16.13,-22.3244 18.92,-25.2743 20.87,-27.3415 22.43,-29.0303 24.42,-30.0731 26.21,-29.1122 27.06,-26.3005 27.41,-23.5984 27.66,-21.5988 28.07,-19.1444 28.56,-16.4951 27.74,-15.4986 27.36,-17.0029 29.03,-19.2462 31.41,-21.2387 34.30,-23.35 37.35,-25.3462 40.24,-27.092 42.70,-28.4762 44.99,-29.7393 47.15,-30.2295 48.81,-28.5562 49.31,-25.4882 48.61,-21.3268 47.16,-13.6141 45.38,-3.3445 44.01,5.7332 43.01,12.7213 42.25,17.988 41.57,22.857 41.15,25.7057 40.98,26.0508 40.71,26.3236 40.37,26.4954 39.99,26.5484 39.61,26.477 39.27,26.2886 39.02,26.003 38.86,25.65 38.83,25.2667 38.92,24.8932 39.13,24.5685 39.43,24.3267 39.79,24.1931 40.17,24.1817 40.54,24.2936 40.85,24.5172 41.08,24.829 41.19,25.1964 41.18,25.581 41.05,25.9424 40.81,26.2428 40.49,26.4508 40.11,26.5446 39.73,26.5144 39.38,26.3633 39.09,26.1071 38.90,25.7728 38.83,25.3952 38.82,25.2005 39.17,22.5357 39.79,17.6499 40.49,12.3768 41.39,5.3595 42.64,-3.7945 44.25,-14.1182 45.45,-21.7242 46.58,-25.7927 46.24,-26.9637 44.09,-26.0198 41.80,-24.6748 39.14,-22.8278 36.43,-20.7383 33.99,-18.5265 32.02,-16.4178 30.43,-14.5442 28.67,-12.9218 26.37,-12.6651 24.91,-14.079 24.71,-15.9968 24.44,-18.5528 24.08,-21.1473 23.83,-23.1753 23.60,-25.1515 24.33,-26.796 24.33,-26.9017 22.70,-25.5677 20.72,-23.5868 18.00,-20.6203 14.56,-16.759 10.78,-12.4209 7.03,-7.8394 3.93,-3.8049 2.18,-0.7111 1.45,1.0115 0.95,1.4895 0.31,1.7407 -0.3796,1.7269 -1.0116,1.4502 -1.4895,0.9527 -1.7407,0.3101 -1.7269,-0.3797 -1.6514,-0.7231 -0.9556,-2.0984 Z"
                    fill="currentColor"
                    strokeLinecap="round"
                    transform="matrix(0.9816, -0.1908, 0.19, 0.98, 1074.66, 952.40)"
                    opacity="1"
                  ></path>
                  <path
                    d="M-0.2243,2.1297 Q-1.231,2.5808 -3.0828,4.095 T-5.7794,6.464 -7.2843,8.2278 -8.3178,9.9956 -8.9582,12.2653 -9.2034,15.0213 -8.4729,18.1309 -7.2475,21.1876 -6.2799,23.6649 -5.4552,25.7453 -4.7746,28.8305 -5.0935,32.7244 -7.0379,36.3346 -10.4993,40.4691 -15.4521,45.0506 -21.9643,49.6219 -28.9224,53.4514 -34.995,56.1042 -40.0544,57.7829 -43.8842,58.7674 -46.5729,59.3627 -48.6415,59.5576 -50.7966,58.7594 -52.4204,56.9963 -52.6094,54.9498 -50.6036,52.3126 -45.317,48.2413 -36.1269,42.265 -21.2644,33.1196 -1.0143,20.1054 23.35,3.8133 36.84,-5.1802 37.23,-5.2849 37.63,-5.2614 38.00,-5.1121 38.30,-4.8526 38.50,-4.5101 38.59,-4.1205 38.54,-3.7246 38.37,-3.3638 38.10,-3.0759 37.74,-2.891 37.35,-2.8285 36.96,-2.895 36.60,-3.0834 36.33,-3.3741 36.17,-3.7366 36.13,-4.1329 36.21,-4.5217 36.42,-4.862 36.73,-5.1185 37.10,-5.2641 37.49,-5.2836 37.88,-5.175 38.21,-4.9497 38.45,-4.6312 38.57,-4.2529 38.57,-3.8545 38.44,-3.4775 38.20,-3.1615 38.05,-3.0236 24.76,5.9171 0.40,22.3107 -19.8129,35.4474 -34.5013,44.6747 -43.3359,50.6574 -48.075,54.3716 -48.7968,56.3548 -47.0311,56.9348 -44.4708,56.4643 -40.8083,55.4972 -35.9716,53.86 -30.1321,51.2555 -23.4724,47.5279 -17.3079,43.0984 -12.7198,38.7033 -9.7397,34.9778 -8.3079,32.199 -8.0773,29.4618 -8.5678,26.9702 -9.3497,24.9748 -10.4677,22.5899 -11.6409,20.1746 -12.5631,17.8598 -12.9259,15.4122 -12.5629,12.8266 -11.937,10.4905 -11.0674,8.3885 -9.7282,6.187 -8.0605,4.165 -5.9957,2.004 -3.7938,0.0268 -1.7818,-1.1947 -0.4314,-1.7644 0.27,-1.7952 0.94,-1.5527 1.46,-1.0737 1.76,-0.4313 1.79,0.2768 1.55,0.9427 1.07,1.4652 0.78,1.6787 -0.2243,2.1297 Z"
                    fill="currentColor"
                    strokeLinecap="round"
                    transform="matrix(0.9816, -0.1908, 0.19, 0.98, 1136.59, 918.27)"
                    opacity="1"
                  ></path>
                </svg>
              </div>
            </div>
          </ContentSection>
        </main>
      </div>
    </>
  );
}
