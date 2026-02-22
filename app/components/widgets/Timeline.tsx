"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { C } from "../../lib/theme";
import type { TimelineProps as TimelineDataProps } from "../../lib/articleTypes";

export type TimelineProps = TimelineDataProps & {
  accent: string;
  accentDim: string;
};

export function Timeline({ events, align, accent, accentDim }: TimelineProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const [dragging, setDragging] = useState(false);
  const lineY = 30;
  const dotSize = 10;
  const dotTop = lineY - dotSize / 2;
  const dateOffsetY = 14;
  const dateOffsetX = -7;
  const cardOffset = lineY + 12;

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const update = () => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      setCanLeft(el.scrollLeft > 2);
      setCanRight(el.scrollLeft < maxScroll - 2);
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);

    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [events]);

  const scrollByAmount = (direction: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.setPointerCapture(e.pointerId);
    const startX = e.clientX;
    const startLeft = el.scrollLeft;
    setDragging(true);

    const onMove = (ev: PointerEvent) => {
      el.scrollLeft = startLeft - (ev.clientX - startX);
    };
    const onUp = (ev: PointerEvent) => {
      el.releasePointerCapture(ev.pointerId);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      setDragging(false);
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
  };

  // Auto-scroll to start, end or highlighted event on load based on align prop
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let targetIndex = 0;
    if (align === "highlighted") {
      const highlightedIndex = events.findIndex((e) => e.highlight || e.current);
      targetIndex = highlightedIndex !== -1 ? highlightedIndex : 0;
    } else if (align === "end") {
      targetIndex = events.length - 1;
    } else {
      targetIndex = 0;
    }
    const inner = el.firstElementChild as HTMLElement | null;
    const targetEl = inner?.children?.[targetIndex] as HTMLElement | undefined;
    if (targetEl) {
      const offset = targetEl.offsetLeft + targetEl.clientWidth / 2 - el.clientWidth / 2;
      el.scrollLeft = offset;
    }
  }, [events, align]);

  return (
    <div>
      <div
        style={{
          marginTop: 10,
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 10,
          color: C.muted,
        }}
      ></div>
      <div style={{ position: "relative" }}>
        <div
          style={{
            position: "absolute",
            top: lineY,
            left: 0,
            right: 0,
            height: 1,
            background: C.border,
          }}
        />
        <div
          ref={scrollerRef}
          onPointerDown={onPointerDown}
          style={{
            overflowX: "auto",
            overflowY: "hidden",
            cursor: dragging ? "grabbing" : "grab",
            paddingBottom: 8,
            scrollBehavior: "smooth",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <div style={{ display: "flex", gap: 18, padding: "0 6px 8px", userSelect: "none" }}>
            {events.map((ev, i) => {
              const highlight = Boolean(ev.highlight || ev.current);
              return (
                <div
                  key={i}
                  style={{ flex: "0 0 220px", position: "relative", paddingTop: cardOffset }}
                >
                  {ev.label && (
                    <div
                      style={{
                        position: "absolute",
                        top: lineY - dateOffsetY - 10,
                        left: dateOffsetX,
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 10,
                        color: highlight ? accent : C.muted,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                      }}
                    >
                      {ev.label}
                    </div>
                  )}
                  <div
                    style={{
                      position: "absolute",
                      top: dotTop,
                      left: 12,
                      width: dotSize,
                      height: dotSize,
                      borderRadius: "50%",
                      background: highlight ? accent : accentDim,
                      boxShadow: highlight ? `0 0 10px ${accent}60` : "none",
                      border: highlight ? `1px solid ${accent}` : `1px solid ${accentDim}`,
                    }}
                  />
                  <div
                    style={{
                      background: C.panel,
                      border: `1px solid ${highlight ? accentDim : C.border}`,
                      borderRadius: 10,
                      padding: "12px 12px 10px",
                      minHeight: 90,
                    }}
                  >
                    {ev.title && (
                      <div
                        style={{
                          fontFamily: "'IBM Plex Sans', sans-serif",
                          fontSize: 13,
                          color: C.text,
                          marginTop: 6,
                          fontWeight: 600,
                          lineHeight: 1.4,
                        }}
                      >
                        {ev.title}
                      </div>
                    )}
                    {ev.description && (
                      <div
                        style={{
                          fontFamily: "'IBM Plex Sans', sans-serif",
                          fontSize: 12,
                          color: C.body,
                          marginTop: 6,
                          lineHeight: 1.6,
                        }}
                      >
                        {ev.description}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {canLeft && (
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 26,
              background: `linear-gradient(90deg, ${C.surface}, transparent)`,
            }}
          />
        )}
        {canRight && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              width: 26,
              background: `linear-gradient(270deg, ${C.surface}, transparent)`,
            }}
          />
        )}
      </div>

      <div
        style={{
          marginTop: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10,
            color: C.muted,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          Drag or use arrows to explore the timeline
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            type="button"
            aria-label="Scroll timeline left"
            onClick={() => scrollByAmount(-1)}
            disabled={!canLeft}
            style={{
              border: `1px solid ${C.border}`,
              background: canLeft ? C.panel : "transparent",
              color: canLeft ? C.text : C.muted,
              width: 28,
              height: 28,
              borderRadius: 8,
              cursor: canLeft ? "pointer" : "default",
              transition: "all 0.15s ease",
            }}
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Scroll timeline right"
            onClick={() => scrollByAmount(1)}
            disabled={!canRight}
            style={{
              border: `1px solid ${C.border}`,
              background: canRight ? C.panel : "transparent",
              color: canRight ? C.text : C.muted,
              width: 28,
              height: 28,
              borderRadius: 8,
              cursor: canRight ? "pointer" : "default",
              transition: "all 0.15s ease",
            }}
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
