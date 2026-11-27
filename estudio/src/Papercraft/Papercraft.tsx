import { z } from "zod";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT, MARCA } from "../tema";

// Colagem de papel: cada cena tem papéis
// coloridos que entram pelas bordas, uma etiqueta de papel rasgado com o título (cada palavra entra quando é dita)
// e recortes fotográficos que sobem como adesivo. Tudo se mexe "em papel": entrada com mola e assentamento,
// e um balanço contínuo em passo de 12 qps (o "boil" do stop motion), pra nada ficar parado.
const fontFamily = FONT.titulo;

const palavra = z.object({ t: z.string(), em: z.number(), destaque: z.boolean().optional() });
const elemento = z.object({
  src: z.string(),
  x: z.number(), // centro, em px da tela 1080×1920
  y: z.number(),
  w: z.number(), // largura em px
  em: z.number(), // segundo (relativo à cena) em que entra
  rot: z.number().default(0),
  anim: z.enum(["adesivo", "cair", "girar", "crescer", "voar", "pulsar", "balanca", "flutuar"]).default("adesivo"),
  sai: z.number().optional(), // segundo (relativo à cena) em que sai
  param: z.number().optional(), // uso por animação: ângulo da balança, volta do giro etc.
  param2: z.number().optional(),
  z: z.number().optional(),
});
const etiqueta = z.object({ t: z.string(), x: z.number(), y: z.number(), em: z.number(), rot: z.number().default(-3), cor: z.string().optional(), tam: z.number().default(44) });
const cena = z.object({
  inicio: z.number(),
  fim: z.number(),
  semente: z.number(),
  paleta: z.array(z.string()).min(2),
  titulo: z.object({ linhas: z.array(z.array(palavra)), x: z.number(), y: z.number(), tam: z.number(), rot: z.number(), largura: z.number(), sai: z.number().optional() }).optional(),
  elementos: z.array(elemento).default([]),
  etiquetas: z.array(etiqueta).default([]),
  check: z.object({ x: z.number(), y: z.number(), em: z.number(), tam: z.number() }).optional(),
  fundoClaro: z.boolean().optional(),
});
export const papercraftSchema = z.object({
  durationInSeconds: z.number(),
  audio: z.string(),
  cenas: z.array(cena),
});
export type PapercraftProps = z.infer<typeof papercraftSchema>;
type Cena = z.infer<typeof cena>;

const src = (s: string) => (s.startsWith("http") ? s : staticFile(s));
const VERDE = MARCA.secundaria; // a cor secundária do tema
const PAPEL = MARCA.claro; // o papel é o fundo claro do tema

// gerador pseudoaleatório com semente: o mesmo vídeo sempre sai igual
const rng = (seed: number) => {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
};

// contorno de papel cortado à mão: um círculo deformado e suavizado
const blobPath = (r: () => number, raio: number) => {
  const n = 7;
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const rr = raio * (0.72 + r() * 0.5);
    return [Math.cos(a) * rr, Math.sin(a) * rr];
  });
  let d = "";
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    if (i === 0) d += `M ${p1[0]} ${p1[1]} `;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C ${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${p2[0]} ${p2[1]} `;
  }
  return d + "Z";
};

// o "boil" do stop motion: o tempo anda em degraus de 12 qps
const passo = (frame: number, fps: number) => Math.floor((frame / fps) * 12) / 12;

const Papeis: React.FC<{ c: Cena }> = ({ c }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const r = rng(c.semente);
  const ancoras = [
    [0.05, 0.08], [0.95, 0.12], [-0.02, 0.55], [1.02, 0.6], [0.1, 0.98], [0.9, 0.95], [0.5, 1.05],
  ];
  const t = passo(frame, fps);
  return (
    <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <filter id={`sombra-${c.semente}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#000" floodOpacity="0.22" />
        </filter>
      </defs>
      {ancoras.map(([ax, ay], i) => {
        const cor = c.paleta[i % c.paleta.length];
        const raio = width * (0.32 + r() * 0.22);
        const d = blobPath(r, raio);
        const atraso = i * 0.03;
        const ent = spring({ frame: frame - atraso * fps, fps, config: { damping: 15, stiffness: 210, mass: 0.6 } });
        // entra vindo de fora, pela borda mais próxima
        const dx = (ax < 0.5 ? -1 : 1) * width * 0.6 * (1 - ent);
        const dy = (ay < 0.5 ? -1 : 1) * height * 0.15 * (1 - ent);
        const resp = Math.sin(t * 1.3 + i) * 6; // ambiente: o papel "respira"
        const rot = (r() - 0.5) * 30 + Math.sin(t * 0.9 + i * 2) * 1.5;
        return (
          <g key={i} transform={`translate(${ax * width + dx + resp} ${ay * height + dy}) rotate(${rot})`} filter={`url(#sombra-${c.semente})`}>
            <path d={d} fill={cor} />
          </g>
        );
      })}
    </svg>
  );
};

// papel rasgado: retângulo com borda serrilhada irregular
const rasgado = (semente: number) => {
  const r = rng(semente);
  const pts: string[] = [];
  const n = 18;
  for (let i = 0; i <= n; i++) pts.push(`${(i / n) * 100}% ${r() * 3}%`);
  for (let i = 1; i <= n; i++) pts.push(`${100 - r() * 1.8}% ${(i / n) * 100}%`);
  for (let i = n; i >= 0; i--) pts.push(`${(i / n) * 100}% ${100 - r() * 3}%`);
  for (let i = n - 1; i >= 1; i--) pts.push(`${r() * 1.8}% ${(i / n) * 100}%`);
  return `polygon(${pts.join(",")})`;
};

const Titulo: React.FC<{ c: Cena }> = ({ c }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!c.titulo) return null;
  const T = c.titulo;
  const primeira = Math.min(...T.linhas.flat().map((p) => p.em));
  const ent = spring({ frame: frame - (primeira - 0.25) * fps, fps, config: { damping: 11, stiffness: 160 } });
  // sai: a etiqueta é puxada pra cima e sai da tela, abrindo espaço pros recortes
  const sai = T.sai !== undefined ? spring({ frame: frame - T.sai * fps, fps, config: { damping: 18, stiffness: 220 } }) : 0;
  const rot = T.rot + (1 - ent) * -9 + Math.sin(passo(frame, fps) * 2.1) * 0.4 + sai * 8;
  return (
    <div
      style={{
        position: "absolute", left: T.x, top: T.y, width: T.largura,
        transform: `rotate(${rot}deg) scale(${0.85 + 0.15 * ent}) translateY(${(1 - ent) * -60 - sai * 1500}px)`,
        transformOrigin: "50% 50%", opacity: Math.min(1, ent * 1.5),
        filter: "drop-shadow(0 12px 14px rgba(0,0,0,.28))",
      }}
    >
      <div style={{ backgroundColor: "#FBF8F1", clipPath: rasgado(c.semente + 7), padding: `${T.tam * 0.38}px ${T.tam * 0.45}px` }}>
        {T.linhas.map((linha, li) => (
          <div key={li} style={{ fontFamily, fontWeight: 900, fontSize: T.tam, lineHeight: 1.02, letterSpacing: -T.tam * 0.03, color: "#141414" }}>
            {linha.map((p, pi) => {
              const s = spring({ frame: frame - p.em * fps, fps, config: { damping: 12, stiffness: 220 } });
              return (
                <span key={pi} style={{
                  display: "inline-block", marginRight: T.tam * 0.22, color: p.destaque ? VERDE : undefined,
                  opacity: frame < p.em * fps - 1 ? 0.12 : 1,
                  transform: `translateY(${(1 - s) * T.tam * 0.35}px) scale(${0.9 + 0.1 * s})`,
                }}>{p.t}</span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

const Elemento: React.FC<{ e: z.infer<typeof elemento>; i: number }> = ({ e, i }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const tt = frame / fps - e.em;
  if (tt < -0.05) return null;
  const sai = e.sai !== undefined ? spring({ frame: frame - e.sai * fps, fps, config: { damping: 20 } }) : 0;
  const ent = spring({ frame: frame - e.em * fps, fps, config: { damping: 9, stiffness: 140, mass: 0.7 } });
  const boil = Math.sin(passo(frame, fps) * 3.1 + i * 1.7) * 1.4; // balanço de stop motion
  let tx = 0, ty = 0, sc = 0.55 + 0.45 * ent, rot = e.rot + (1 - ent) * (i % 2 ? 14 : -14) + boil;
  if (e.anim === "cair") { ty = (1 - ent) * -900; sc = 1; }
  if (e.anim === "voar") { tx = (1 - spring({ frame: frame - e.em * fps, fps, config: { damping: 18, stiffness: 50 } })) * -width * 1.2; sc = 1; rot = e.rot + boil * 0.5; ty = Math.sin(tt * 2) * 10; }
  if (e.anim === "girar") rot = e.rot + interpolate(tt, [0, 1.2], [-200, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" }) + (e.param ? tt * e.param : 0);
  if (e.anim === "crescer") { sc = 1; }
  if (e.anim === "pulsar") sc = (0.55 + 0.45 * ent) * (1 + Math.sin(tt * 3.2) * 0.025);
  if (e.anim === "flutuar") ty = Math.sin(tt * 1.6 + i) * 14;
  if (e.anim === "balanca") {
    // a gangorra: pende pro lado do risco (param) e, se houver param2 (segundo), se equilibra nele
    const pende = spring({ frame: frame - (e.em + 0.3) * fps, fps, config: { damping: 7, stiffness: 60 } });
    const eq = e.param2 !== undefined ? spring({ frame: frame - e.param2 * fps, fps, config: { damping: 6, stiffness: 70 } }) : 0;
    rot = (e.param ?? 0) * pende * (1 - eq) + boil * 0.3;
  }
  const clip = e.anim === "crescer" ? `inset(${(1 - ent) * 100}% 0 0 0)` : undefined;
  return (
    <div style={{
      position: "absolute", left: e.x - e.w / 2, top: e.y, width: e.w, zIndex: e.z ?? 2 + i,
      transform: `translate(${tx}px, ${ty - (e.anim === "cair" ? 0 : 0)}px) translateY(-50%) rotate(${rot}deg) scale(${sc * (1 - sai)})`,
      opacity: Math.min(1, ent * 2) * (1 - sai), clipPath: clip,
      filter: "drop-shadow(0 0 0 #fff) drop-shadow(3px 3px 0 #fff) drop-shadow(-3px -3px 0 #fff) drop-shadow(0 14px 16px rgba(0,0,0,.28))",
    }}>
      <Img src={src(e.src)} style={{ width: "100%", height: "auto", display: "block" }} />
    </div>
  );
};

const Etiqueta: React.FC<{ e: z.infer<typeof etiqueta>; i: number }> = ({ e, i }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < e.em * fps - 1) return null;
  const s = spring({ frame: frame - e.em * fps, fps, config: { damping: 9, stiffness: 200 } });
  return (
    <div style={{
      position: "absolute", left: e.x, top: e.y, zIndex: 30 + i,
      transform: `translate(-50%,-50%) rotate(${e.rot + (1 - s) * 20}deg) scale(${0.4 + 0.6 * s})`,
      backgroundColor: e.cor ?? "#FBF8F1", clipPath: rasgado(i * 13 + 5), padding: `${e.tam * 0.2}px ${e.tam * 0.45}px`,
      fontFamily, fontWeight: 900, fontSize: e.tam, color: "#141414", filter: "drop-shadow(0 8px 10px rgba(0,0,0,.25))",
      whiteSpace: "nowrap",
    }}>{e.t}</div>
  );
};

const Check: React.FC<{ x: number; y: number; em: number; tam: number }> = ({ x, y, em, tam }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = interpolate(frame / fps, [em, em + 0.45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <svg width={tam} height={tam} viewBox="0 0 100 100" style={{ position: "absolute", left: x, top: y, zIndex: 40, overflow: "visible" }}>
      <path d="M 12 55 L 40 82 L 90 18" fill="none" stroke="#111" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray="140" strokeDashoffset={140 * (1 - p)} />
    </svg>
  );
};

// transição "varredura de papel": a cena seguinte começa PRE segundos antes do corte, por cima da anterior.
// Os papéis dela entram pelas bordas, o fundo creme sobe junto, e só no corte entram título e recortes.
const PRE = 0.35;

const CenaView: React.FC<{ c: Cena; pre: number }> = ({ c, pre }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fundo = pre > 0 ? interpolate(frame / fps, [pre * 0.35, pre], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: fundo, backgroundColor: c.fundoClaro ? "#FFFFFF" : PAPEL }} />
      {!c.fundoClaro ? <Papeis c={c} /> : null}
      <Sequence from={Math.round(pre * fps)} layout="none">
        {(c.elementos ?? []).map((e, i) => <Elemento key={i} e={e} i={i} />)}
        <Titulo c={c} />
        {(c.etiquetas ?? []).map((e, i) => <Etiqueta key={i} e={e} i={i} />)}
        {c.check ? <Check {...c.check} /> : null}
      </Sequence>
    </AbsoluteFill>
  );
};

export const Papercraft: React.FC<PapercraftProps> = (p) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: PAPEL }}>
      {p.cenas.map((c, i) => {
        const pre = Math.min(PRE, c.inicio);
        const de = Math.round((c.inicio - pre) * fps);
        return (
          <Sequence key={i} from={de} durationInFrames={Math.max(1, Math.round(c.fim * fps) - de)}>
            <CenaView c={c} pre={pre} />
          </Sequence>
        );
      })}
      {/* textura de papel por cima de tudo: o grão é o que faz parecer papel e não vetor */}
      <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "multiply", opacity: 0.35 }}>
        <svg width="100%" height="100%">
          <filter id="grao"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" /><feColorMatrix values="0 0 0 0 0.55  0 0 0 0 0.5  0 0 0 0 0.42  0 0 0 0.55 0" /></filter>
          <rect width="100%" height="100%" filter="url(#grao)" />
        </svg>
      </AbsoluteFill>
      <Audio src={src(p.audio)} />
    </AbsoluteFill>
  );
};
