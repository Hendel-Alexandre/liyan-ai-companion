/** Subtle ambient background — fixed behind all content */
const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
    id: i,
    x: ((i * 37 + 11) % 88) + 4,   // % spread 4–92
    y: ((i * 53 + 7) % 82) + 6,   // % spread 6–88
    size: 1.5 + (i % 3) * 0.8,     // 1.5–3.1px
    dur: `${7 + (i % 5) * 2.4}s`, // 7–17.4s
    del: `${-(i * 1.3)}s`,        // pre-offset so not all sync
}));

export const AmbientBackground = () => (
    <div
        aria-hidden
        style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 0,
            overflow: 'hidden',
        }}
    >
        {/* Blurred glow blobs */}
        <div className="ambient-blob amb-1" />
        <div className="ambient-blob amb-2" />
        <div className="ambient-blob amb-3" />

        {/* Tiny floating particles */}
        {PARTICLES.map((p) => (
            <div
                key={p.id}
                className="amb-particle"
                style={{
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    width: p.size,
                    height: p.size,
                    '--dur': p.dur,
                    '--delay': p.del,
                } as React.CSSProperties}
            />
        ))}
    </div>
);
