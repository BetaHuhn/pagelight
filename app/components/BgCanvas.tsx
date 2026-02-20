import { useRef, useEffect } from "react";

// ─── Canvas background (subtle particles) ────────────────────────────────────
export default function BgCanvas() {
    const ref = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const c = ref.current;
        if (!c) return;
        const ctx = c.getContext("2d");
        if (!ctx) return;
        let raf: number;
        
        interface Particle {
            x: number;
            y: number;
            vx: number;
            vy: number;
            r: number;
        }
        
        const pts: Particle[] = Array.from({ length: 40 }, () => ({
            x: Math.random() * c.width, 
            y: Math.random() * c.height,
            vx: (Math.random() - 0.5) * 0.3, 
            vy: (Math.random() - 0.5) * 0.3,
            r: Math.random() * 1.5 + 0.3,
        }));

        const resize = (): void => {
            c.width = c.offsetWidth;
            c.height = c.offsetHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        const draw = (): void => {
            ctx.clearRect(0, 0, c.width, c.height);
            pts.forEach((p: Particle) => {
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0) p.x = c.width;
                if (p.x > c.width) p.x = 0;
                if (p.y < 0) p.y = c.height;
                if (p.y > c.height) p.y = 0;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(200,240,74,0.12)`;
                ctx.fill();
            });
            raf = requestAnimationFrame(draw);
        };
        draw();
        return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
    }, []);

    return <canvas ref={ref} style={{
        position: "fixed", inset: 0, width: "100%", height: "100%",
        pointerEvents: "none", zIndex: 0,
    }} />;
}