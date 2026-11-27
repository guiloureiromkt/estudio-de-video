import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { FakeUIProps, Screen } from "./schema";
import { FONT, ESCURO, SEM_NEGRITO_FALSO } from "../tema";

const fontFamily = FONT.corpo;

// Medido no tutorial do @tudormorari.ai (DdjiwOdMSJz): fundo #1a1008→#060402 com vinheta,
// grade laranja fraca, número creme-pêssego com brilho, destaque laranja, texto neutro #c2bcb2.
const mono = FONT.mono;
// Tema trocável. "tudor" é a referência medida; "marca" usa o tema do estúdio (src/tema.ts).
// Módulo-global de propósito: o FakeUI define o tema no começo do render, antes dos filhos lerem.
type Skin = { ink: string; panel: string; text: string; title: string; label: string; body: string; mono: string;
  bg: string; bgImage: string; real: string; realLabel: string; badge: string; badgeText: string; labelWeight: number; num: string; numWeight: number };
const SKINS: Record<string, Skin> = {
  tudor: { ink: "#C2BCB2", panel: "#15110F", text: "#F4EEE6", title: fontFamily, label: fontFamily, body: fontFamily, mono,
    bg: "#060402", bgImage: "radial-gradient(ellipse at 50% 35%, rgba(60,34,14,.95), rgba(26,16,8,.9) 45%, rgba(6,4,2,1) 85%)",
    real: "#FCC997", realLabel: "#E8772E", badge: "#4B3BC9", badgeText: "#E9E4FF", labelWeight: 700, num: fontFamily, numWeight: 800 },
  marca: { ink: "#BDB8C4", panel: ESCURO.fundo2, text: ESCURO.texto, title: FONT.titulo, label: FONT.display, body: FONT.corpo, mono: FONT.display,
    bg: ESCURO.fundo, bgImage: "none",
    real: ESCURO.olho, realLabel: ESCURO.olho, badge: ESCURO.destaque, badgeText: ESCURO.texto, labelWeight: 400, num: FONT.display, numWeight: 400 },
};
let K: Skin = SKINS.tudor;
const FADE = 0.3;

const src = (s: string) => (s.startsWith("http") ? s : staticFile(s));

type Theme = { accent: string; number: string };

const useLocal = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = (delay: number, dur = 0.5) =>
    spring({ frame: frame - delay * fps, fps, config: { damping: 200 }, durationInFrames: Math.round(dur * fps) });
  const lin = (a: number, b: number) =>
    interpolate(frame / fps, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return { frame, fps, t: frame / fps, pop, lin };
};

const Pill: React.FC<{ text: string; theme: Theme; opacity?: number }> = ({ text, theme, opacity = 1 }) => (
  <div
    style={{
      display: "inline-block",
      padding: "10px 22px",
      borderRadius: 40,
      border: `2px solid ${theme.accent}99`,
      backgroundColor: `${theme.accent}22`,
      color: theme.number,
      fontSize: 22,
      fontFamily: K.label,
      fontWeight: K.labelWeight,
      letterSpacing: 4,
      textTransform: "uppercase",
      opacity,
    }}
  >
    {text}
  </div>
);

const glow = (c: string) => `0 0 24px ${c}88, 0 0 60px ${c}44`;

// Calendário: células acendem em cascata até `value`; a última fica em destaque.
const Calendar: React.FC<{ value: number; total: number; theme: Theme; delay: number }> = ({ value, total, theme, delay }) => {
  const { pop } = useLocal();
  const cols = 6;
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 88px)`, gap: 12 }}>
      {Array.from({ length: total }).map((_, i) => {
        const on = i < value;
        const cur = i === value - 1;
        const s = pop(delay + i * 0.035, 0.35);
        return (
          <div
            key={i}
            style={{
              width: 88,
              height: 70,
              borderRadius: 12,
              backgroundColor: cur ? theme.accent : on ? `${theme.accent}55` : "rgba(255,255,255,.05)",
              boxShadow: cur ? glow(theme.accent) : "none",
              opacity: on ? s : 0.6 * s,
              transform: `scale(${0.7 + 0.3 * s})`,
            }}
          />
        );
      })}
    </div>
  );
};

const Counter: React.FC<{ s: Extract<Screen, { type: "counter" }>; theme: Theme }> = ({ s, theme }) => {
  const { pop, lin } = useLocal();
  const n = Math.round(interpolate(lin(0.2, 1.1), [0, 1], [0, s.value]));
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
      <Pill text={s.pill} theme={theme} opacity={pop(0)} />
      <div style={{ display: "flex", alignItems: "baseline", gap: 20, opacity: pop(0.1) }}>
        <span style={{ fontSize: 44, fontFamily: K.label, color: K.ink, letterSpacing: 6 }}>{s.prefix}</span>
        <span style={{ fontSize: 300, fontWeight: K.numWeight, fontFamily: K.num, color: theme.number, lineHeight: 0.9, textShadow: glow(theme.accent), letterSpacing: K.numWeight === 400 ? 0 : -12 }}>
          {n}
        </span>
        <span style={{ fontSize: 64, fontWeight: 700, color: `${K.ink}99` }}>/{s.total}</span>
      </div>
      <Calendar value={s.value} total={s.total} theme={theme} delay={0.5} />
    </div>
  );
};

const Title: React.FC<{ s: Extract<Screen, { type: "title" }>; theme: Theme }> = ({ s, theme }) => {
  const { pop } = useLocal();
  const u = pop(0.35);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {s.lines.map((l, i) => {
        const p = pop(i * 0.12);
        return (
          <div
            key={i}
            style={{
              fontSize: s.size ?? 128,
              fontFamily: K.title,
              fontWeight: 800,
              lineHeight: 0.98,
              letterSpacing: -3,
              color: K.text,
              textTransform: "uppercase",
              textAlign: "center",
              opacity: p,
              transform: `translateY(${(1 - p) * 40}px)`,
              filter: `blur(${(1 - p) * 8}px)`,
              textShadow: "0 6px 30px rgba(0,0,0,.6)",
            }}
          >
            {l}
          </div>
        );
      })}
      <div style={{ marginTop: 34, width: 120 * u, height: 8, borderRadius: 4, backgroundColor: theme.accent, boxShadow: glow(theme.accent) }} />
    </div>
  );
};

const Chart: React.FC<{ s: Extract<Screen, { type: "chart" }>; theme: Theme }> = ({ s, theme }) => {
  const { pop, lin } = useLocal();
  const W = 900;
  const H = 420;
  const max = Math.max(...s.points);
  const min = Math.min(...s.points);
  const pts = s.points.map((v, i) => [(i / (s.points.length - 1)) * W, H - ((v - min) / (max - min || 1)) * (H - 40) - 20]);
  // curva suave (Catmull-Rom → Bézier)
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    d += ` C ${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6}, ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6}, ${p2[0]} ${p2[1]}`;
  }
  const draw = lin(0.3, 1.8);
  const last = pts[pts.length - 1];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
      <Pill text={s.pill} theme={theme} opacity={pop(0)} />
      <svg width={W + 40} height={H + 20} style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={theme.accent} stopOpacity={0.35} />
            <stop offset="1" stopColor={theme.accent} stopOpacity={0} />
          </linearGradient>
          <clipPath id="reveal">
            <rect x={0} y={-20} width={(W + 40) * draw} height={H + 60} />
          </clipPath>
        </defs>
        <g clipPath="url(#reveal)">
          <path d={`${d} L ${W} ${H} L 0 ${H} Z`} fill="url(#area)" />
          <path d={d} stroke={theme.accent} strokeWidth={5} fill="none" style={{ filter: `drop-shadow(0 0 10px ${theme.accent})` }} />
        </g>
        {draw > 0.98 ? (
          <>
            <circle cx={last[0]} cy={last[1]} r={12 + 10 * ((lin(1.8, 2.8) * 3) % 1)} fill="none" stroke={theme.accent} strokeWidth={3} opacity={1 - ((lin(1.8, 2.8) * 3) % 1)} />
            <circle cx={last[0]} cy={last[1]} r={10} fill={theme.accent} />
            <text x={last[0] - 10} y={last[1] - 30} textAnchor="end" fill={theme.number} fontSize={34} fontWeight={K.numWeight} fontFamily={K.num}>
              {s.delta}
            </text>
          </>
        ) : null}
      </svg>
      <div style={{ display: "flex", gap: 70, width: W, justifyContent: "flex-start" }}>
        {s.stats.map((st, i) => {
          const p = pop(0.8 + i * 0.35);
          return (
            <div key={i} style={{ opacity: p, transform: `translateY(${(1 - p) * 20}px)` }}>
              <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: 4, color: `${K.ink}99`, textTransform: "uppercase" }}>{st.label}</div>
              <div style={{ fontSize: 58, fontWeight: K.numWeight, fontFamily: K.num, color: K.text, marginTop: 6 }}>{st.value}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const App: React.FC<{ s: Extract<Screen, { type: "app" }>; theme: Theme }> = ({ s, theme }) => {
  const { pop, lin, frame } = useLocal();
  const typedLen = Math.floor(lin(0.5, 0.5 + s.prompt.length * 0.028) * s.prompt.length);
  const typed = s.prompt.slice(0, typedLen);
  const doneTyping = 0.5 + s.prompt.length * 0.028;
  const press = pop(doneTyping + 0.2, 0.3);
  const progress = lin(doneTyping + 0.4, doneTyping + 1.6);
  const out = pop(doneTyping + 1.6, 0.6);
  const hiStart = s.highlight ? s.prompt.indexOf(s.highlight) : -1;
  const renderTyped = () => {
    if (hiStart < 0 || typedLen <= hiStart) return typed;
    return (
      <>
        {typed.slice(0, hiStart)}
        <span style={{ backgroundColor: K.badge, color: K.badgeText, borderRadius: 6, padding: "1px 6px" }}>
          {typed.slice(hiStart, Math.min(typedLen, hiStart + s.highlight.length))}
        </span>
        {typed.slice(hiStart + s.highlight.length)}
      </>
    );
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
      <Pill text={s.step} theme={theme} opacity={pop(0)} />
      <div
        style={{
          width: 900,
          borderRadius: 34,
          backgroundColor: K.panel,
          border: "1px solid rgba(255,255,255,.07)",
          boxShadow: "0 40px 90px rgba(0,0,0,.6)",
          padding: 34,
          boxSizing: "border-box",
          opacity: pop(0.1),
          transform: `translateY(${(1 - pop(0.1)) * 40}px)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 34, fontWeight: 700, color: K.text }}>{s.app}</div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ padding: "8px 18px", borderRadius: 20, backgroundColor: K.badge, color: K.badgeText, fontSize: 20, fontWeight: 700 }}>{s.badge}</div>
          </div>
        </div>
        <div
          style={{
            marginTop: 26,
            minHeight: 190,
            borderRadius: 20,
            backgroundColor: "rgba(255,255,255,.04)",
            border: "1px solid rgba(255,255,255,.06)",
            padding: "24px 26px",
            fontSize: 28,
            lineHeight: 1.45,
            color: typedLen ? "#E6E0D8" : `${K.ink}66`,
            boxSizing: "border-box",
          }}
        >
          {typedLen ? renderTyped() : "O que você quer criar?"}
          {typedLen && typedLen < s.prompt.length ? <span style={{ opacity: frame % 16 < 8 ? 1 : 0 }}>▍</span> : null}
        </div>
        <div
          style={{
            marginTop: 22,
            height: 640,
            borderRadius: 20,
            backgroundColor: "rgba(255,255,255,.03)",
            border: "1px solid rgba(255,255,255,.06)",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {out < 0.02 ? <div style={{ color: `${K.ink}55`, fontSize: 22 }}>Seu resultado aparece aqui</div> : null}
          {s.output ? (
            <Img src={src(s.output)} style={{ height: "100%", opacity: out, transform: `scale(${1.04 - 0.04 * out})` }} />
          ) : null}
          {progress > 0 && out < 1 ? (
            <div style={{ position: "absolute", left: 30, right: 30, bottom: 26, height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,.08)" }}>
              <div style={{ width: `${progress * 100}%`, height: "100%", borderRadius: 4, backgroundColor: theme.accent, boxShadow: glow(theme.accent) }} />
            </div>
          ) : null}
        </div>
        <div
          style={{
            marginTop: 24,
            height: 84,
            borderRadius: 42,
            background: "linear-gradient(180deg,#F4F4F4,#BDBDBD)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 30,
            fontWeight: 700,
            color: "#111",
            transform: `scale(${1 - 0.05 * Math.sin(press * Math.PI)})`,
          }}
        >
          {s.button}
        </div>
      </div>
    </div>
  );
};

const Check: React.FC<{ s: Extract<Screen, { type: "check" }>; theme: Theme }> = ({ s, theme }) => {
  const { pop, lin } = useLocal();
  const card = pop(0);
  const claim = pop(0.25);
  const strike = lin(0.9, 1.25);
  const real = pop(1.3);
  return (
    <div
      style={{
        width: 920,
        borderRadius: 30,
        backgroundColor: K.panel,
        border: "1px solid rgba(255,255,255,.08)",
        boxShadow: "0 40px 90px rgba(0,0,0,.6)",
        padding: "34px 40px 40px",
        boxSizing: "border-box",
        opacity: card,
        transform: `translateY(${(1 - card) * 40}px) scale(${0.96 + 0.04 * card})`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: K.mono }}>
        <div style={{ fontSize: 30, fontWeight: 700, color: K.text }}>
          <span style={{ color: `${K.ink}88` }}>{s.prefix ?? "github.com/"}</span>
          {s.repo}
        </div>
        {s.stars ? <div style={{ fontSize: 26, color: theme.number, whiteSpace: "nowrap", marginLeft: 20 }}>★ {s.stars}</div> : null}
      </div>
      <div style={{ height: 1, backgroundColor: "rgba(255,255,255,.08)", margin: "26px 0 30px" }} />
      <div style={{ fontSize: 20, fontFamily: K.label, letterSpacing: 4, color: `${K.ink}99`, textTransform: "uppercase", opacity: claim }}>{s.claimLabel ?? "A legenda diz"}</div>
      <div style={{ marginTop: 10, opacity: claim, fontSize: 58, fontWeight: 800, lineHeight: 1.15 }}>
        {/* risco linha a linha: fundo em gradiente num span inline, clonado em cada linha quebrada */}
        <span
          style={{
            color: K.text,
            opacity: 1 - 0.45 * strike,
            backgroundImage: `linear-gradient(${theme.accent}, ${theme.accent})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "0 58%",
            backgroundSize: `${strike * 100}% 7px`,
            boxDecorationBreak: "clone",
            WebkitBoxDecorationBreak: "clone",
          }}
        >
          “{s.claim}”
        </span>
      </div>
      <div style={{ marginTop: 34, fontSize: 20, fontFamily: K.label, letterSpacing: 4, color: K.realLabel, textTransform: "uppercase", opacity: real }}>Na real</div>
      <div
        style={{
          marginTop: 10,
          fontSize: 54,
          fontWeight: K.numWeight,
          color: K.real,
          fontFamily: K.num,
          lineHeight: 1.1,
          opacity: real,
          transform: `translateY(${(1 - real) * 20}px)`,
          textShadow: glow(K.real),
        }}
      >
        {s.real}
      </div>
    </div>
  );
};

const Stat: React.FC<{ s: Extract<Screen, { type: "stat" }>; theme: Theme }> = ({ s, theme }) => {
  const { pop, lin } = useLocal();
  const n = Math.round(interpolate(lin(0.15, 1.0), [0, 1], [0, s.value]));
  const fonte = pop(0.9);
  return (
    <div style={{ width: 920, display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
      <Pill text={s.pill} theme={theme} opacity={pop(0)} />
      <div style={{ fontSize: 250, fontFamily: K.num, fontWeight: K.numWeight, color: theme.number, lineHeight: 0.9, textShadow: glow(theme.accent), opacity: pop(0.05) }}>
        {n}%
      </div>
      <div style={{ fontSize: 40, fontFamily: K.body, color: K.text, textAlign: "center", lineHeight: 1.2, maxWidth: 860, opacity: pop(0.4) }}>{s.label}</div>
      {s.bars.length ? (
        <div style={{ width: 860, display: "flex", flexDirection: "column", gap: 18, marginTop: 10 }}>
          {s.bars.map((b, i) => {
            const at = b.em ?? 0.6 + i * 0.25;
            const g = lin(at, at + 0.8);
            const on = pop(at, 0.3);
            const cor = b.destaque ? theme.accent : `${K.ink}66`;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 20, opacity: on }}>
                <div style={{ width: 170, fontSize: 26, fontFamily: K.label, letterSpacing: 3, textTransform: "uppercase", color: K.ink, textAlign: "right" }}>{b.label}</div>
                <div style={{ flex: 1, height: 34, borderRadius: 17, backgroundColor: "rgba(255,255,255,.06)", overflow: "hidden" }}>
                  <div style={{ width: `${b.value * g}%`, height: "100%", borderRadius: 17, backgroundColor: cor, boxShadow: b.destaque ? glow(theme.accent) : "none" }} />
                </div>
                <div style={{ width: 110, fontSize: 40, fontFamily: K.num, color: b.destaque ? theme.number : K.ink }}>{Math.round(b.value * g)}%</div>
              </div>
            );
          })}
        </div>
      ) : null}
      <div style={{ fontSize: 22, fontFamily: K.label, letterSpacing: 3, color: `${K.ink}aa`, textTransform: "uppercase", opacity: fonte, marginTop: 6 }}>{s.source}</div>
    </div>
  );
};

const usd = (v: number) => "US$ " + v.toFixed(2).replace(".", ",");

const Fatura: React.FC<{ s: Extract<Screen, { type: "fatura" }>; theme: Theme }> = ({ s, theme }) => {
  const { pop, lin, t } = useLocal();
  const card = pop(0);
  // o total persegue a soma das linhas que já entraram
  const total = s.itens.reduce((acc, it) => acc + it.valor * lin(it.em, it.em + 0.6), 0);
  const cheio = s.itens.reduce((acc, it) => acc + it.valor, 0);
  return (
    <div style={{ width: 940, borderRadius: 30, backgroundColor: K.panel, border: "1px solid rgba(255,255,255,.08)", boxShadow: "0 40px 90px rgba(0,0,0,.6)",
      padding: "34px 42px 40px", boxSizing: "border-box", opacity: card, transform: `translateY(${(1 - card) * 40}px) scale(${0.96 + 0.04 * card})` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 24, fontFamily: K.label, letterSpacing: 4, textTransform: "uppercase", color: K.ink }}>Fatura · Exemplo</div>
        <div style={{ fontSize: 20, fontFamily: K.label, letterSpacing: 3, color: theme.accent, border: `1.5px solid ${theme.accent}`, borderRadius: 999, padding: "6px 14px" }}>PAGO</div>
      </div>
      <div style={{ fontSize: 50, fontFamily: K.title, color: K.text, marginTop: 18, lineHeight: 1.1 }}>{s.titulo}</div>
      <div style={{ height: 1, backgroundColor: "rgba(255,255,255,.08)", margin: "24px 0 8px" }} />
      {s.itens.map((it, i) => {
        const p = pop(it.em, 0.4);
        if (t < it.em - 0.05) return <div key={i} style={{ height: it.sub ? 96 : 74 }} />;
        return (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,.06)",
            opacity: p, transform: `translateX(${(1 - p) * 30}px)` }}>
            <div>
              <div style={{ fontSize: 36, fontFamily: K.body, color: it.destaque ? theme.number : K.text }}>{it.label}</div>
              {it.sub ? <div style={{ fontSize: 22, fontFamily: K.label, letterSpacing: 2, color: `${K.ink}aa`, marginTop: 6, textTransform: "uppercase" }}>{it.sub}</div> : null}
            </div>
            <div style={{ fontSize: 40, fontFamily: K.num, color: it.destaque ? theme.accent : K.text, textShadow: it.destaque ? glow(theme.accent) : "none", whiteSpace: "nowrap", marginLeft: 20 }}>
              {it.valorTexto ?? usd(it.valor)}
            </div>
          </div>
        );
      })}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 26 }}>
        <div style={{ fontSize: 26, fontFamily: K.label, letterSpacing: 4, textTransform: "uppercase", color: K.realLabel }}>Total</div>
        <div style={{ fontSize: 96, fontFamily: K.num, color: theme.number, textShadow: glow(theme.accent), lineHeight: 1 }}>{usd(Math.min(total, cheio))}</div>
      </div>
    </div>
  );
};

const Legenda: React.FC<{ words: { text: string; start: number; end: number }[]; wordsPerCard: number; theme: Theme }> = ({ words, wordsPerCard, theme }) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const t = frame / fps;
  const cards: (typeof words)[] = [];
  for (let i = 0; i < words.length; i += wordsPerCard) cards.push(words.slice(i, i + wordsPerCard));
  const card = cards.find((c) => t >= c[0].start - 0.05 && t <= c[c.length - 1].end + 0.25);
  if (!card) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: Math.round(height * 0.14), display: "flex", justifyContent: "center" }}>
      <div style={{ maxWidth: 900, padding: "16px 28px", borderRadius: 18, backgroundColor: "rgba(14,10,28,.82)", border: "1px solid rgba(239,235,227,.13)", fontFamily: K.body, fontSize: 52, lineHeight: 1.15, textAlign: "center", color: K.text }}>
        {card.map((w, i) => (
          <span key={i} style={{ color: t >= w.start && t <= w.end + 0.08 ? theme.accent : undefined }}>
            {w.text}
            {i < card.length - 1 ? " " : ""}
          </span>
        ))}
      </div>
    </div>
  );
};

const ScreenView: React.FC<{ s: Screen; theme: Theme }> = ({ s, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const total = s.duration * fps;
  const f = FADE * fps;
  const opacity = interpolate(frame, [0, f, total - f, total], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const body =
    s.type === "counter" ? <Counter s={s} theme={theme} /> :
    s.type === "title" ? <Title s={s} theme={theme} /> :
    s.type === "chart" ? <Chart s={s} theme={theme} /> :
    s.type === "check" ? <Check s={s} theme={theme} /> :
    s.type === "stat" ? <Stat s={s} theme={theme} /> :
    s.type === "fatura" ? <Fatura s={s} theme={theme} /> :
    <App s={s} theme={theme} />;
  return (
    <AbsoluteFill style={{ opacity, alignItems: "center", justifyContent: "center" }}>
      {body}
    </AbsoluteFill>
  );
};

export const FakeUI: React.FC<FakeUIProps> = (props) => {
  const { fps } = useVideoConfig();
  K = SKINS[props.skin ?? "tudor"];
  const theme = { accent: props.accent, number: props.number };
  return (
    <AbsoluteFill
      style={{
        ...(props.skin === "marca" ? SEM_NEGRITO_FALSO : {}),
        fontFamily: K.body,
        backgroundColor: K.bg,
        backgroundImage: K.bgImage,
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${props.accent}14 1px, transparent 1px), linear-gradient(90deg, ${props.accent}14 1px, transparent 1px)`,
          backgroundSize: "54px 54px",
          maskImage: "radial-gradient(ellipse at 50% 40%, black 30%, transparent 80%)",
        }}
      />
      {props.audio ? <Audio src={src(props.audio)} /> : null}
      {props.screens.map((s, i) => (
        <Sequence key={i} from={Math.round(s.start * fps)} durationInFrames={Math.round(s.duration * fps)} layout="none">
          <ScreenView s={s} theme={theme} />
        </Sequence>
      ))}
      {props.words?.length ? <Legenda words={props.words} wordsPerCard={props.wordsPerCard ?? 4} theme={theme} /> : null}
      {props.selo ? (
        <div style={{ position: "absolute", top: 90, left: 60, fontFamily: FONT.display, fontSize: 20, letterSpacing: 4, textTransform: "uppercase", color: ESCURO.olho, border: `1.5px solid ${ESCURO.olho}`, borderRadius: 999, padding: "10px 20px" }}>
          {props.selo}
        </div>
      ) : null}
      {props.handle ? <div style={{ position: "absolute", bottom: 70, right: 60, fontFamily: FONT.display, fontSize: 22, letterSpacing: 3, color: ESCURO.textoApoio }}>@{props.handle}</div> : null}
    </AbsoluteFill>
  );
};
