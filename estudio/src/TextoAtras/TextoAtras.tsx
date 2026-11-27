import { z } from "zod";
import { Audio, Video } from "@remotion/media";
import { AbsoluteFill, Easing, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT, ESCURO, MOLDES, RGB, SEM_NEGRITO_FALSO } from "../tema";

// Talking head com texto atrás da cabeça (referência @nekt.ai): o avatar em tela cheia, o fundo
// escurecido na cor escura do tema, a palavra-chave grande na fonte do tema entre o fundo e a pessoa, e a pessoa
// recortada por cima (vídeo com alfa, feito com a máscara do robust_video_matting).
export const textoAtrasSchema = z.object({
  durationInSeconds: z.number().min(1),
  video: z.string(), // avatar inteiro (fundo + pessoa)
  frente: z.string(), // só a pessoa, webm VP9 com alfa, mesmos quadros do `video`
  audio: z.string(),
  palavras: z.array(z.object({ text: z.string(), start: z.number(), end: z.number() })), // legenda palavra a palavra
  chaves: z.array(z.object({ text: z.string(), start: z.number(), end: z.number(), destaque: z.boolean().optional() })),
  wordsPerCard: z.number().int().min(1).max(8),
  handle: z.string(),
  selo: z.string(),
  escurece: z.number().min(0).max(1).default(0.55), // quanto o navy cobre o fundo (a pessoa não escurece)
  alturaChave: z.number().default(0.3), // centro da palavra-chave, em fração da altura
  zoom: z.number().min(0.5).default(1), // >1 aproxima (plano aberto da entrevista); <1 afasta (personagem de cabeça grande, abre espaço em cima)
  focoY: z.number().min(0).max(1).default(0.3), // ponto que fica parado no zoom (0 = topo)
});
export type TextoAtrasProps = z.infer<typeof textoAtrasSchema>;

const src = (s: string) => (s.startsWith("http") ? s : staticFile(s));
const EASE = Easing.bezier(0.16, 1, 0.3, 1);

// cobre a tela sem depender de objectFit (o <Video> do @remotion/media ignora objectFit)
const cobre = (zoom: number, focoY: number): React.CSSProperties => ({
  position: "absolute", left: 0, width: "100%", height: "auto", top: "50%",
  transform: `translateY(-50%) scale(${zoom})`, transformOrigin: `50% ${focoY * 100}%`,
});

const Chave: React.FC<{ c: TextoAtrasProps["chaves"][number]; y: number }> = ({ c, y }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  if (t < c.start - 0.05 || t > c.end + 0.35) return null;
  const linhas = c.text.split("\n");
  const total = linhas.reduce((n, l) => n + l.length, 0);
  const inicioDaLinha = linhas.map((_, i) => linhas.slice(0, i).reduce((n, l) => n + l.length, 0));
  const dur = Math.min(0.5, (c.end - c.start) * 0.6);
  const sai = interpolate(t, [c.end, c.end + 0.35], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // tamanho: a palavra mais longa ocupa ~92% da largura
  const maior = Math.max(...linhas.map((l) => l.length));
  const fontSize = Math.min(300, (width * 0.92) / (maior * 0.62));
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        // nunca sobe por cima do selo "feito com IA" (topo em 90 px): o bloco de 2 linhas desce o que precisar
        top: Math.max(y * height, height * 0.085 + (linhas.length * fontSize * 0.95) / 2),
        transform: "translateY(-50%)",
        textAlign: "center",
        fontFamily: FONT.display,
        fontSize,
        lineHeight: 0.95,
        letterSpacing: -fontSize * 0.02,
        textTransform: "uppercase",
        color: c.destaque ? ESCURO.destaque : ESCURO.texto,
        opacity: sai,
        textShadow: `0 6px 40px rgba(${RGB.escuro},.55)`,
      }}
    >
      {linhas.map((linha, li) => (
        <div key={li}>
          {[...linha].map((l, i) => {
            const k = inicioDaLinha[li] + i; // ordem da letra na palavra inteira, pra entrar em sequência
            const a = c.start + (dur * k) / Math.max(1, total);
            const p = interpolate(t, [a, a + 0.12], [0, 1], { easing: EASE, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return (
              <span key={i} style={{ display: "inline-block", opacity: p, transform: `translateY(${(1 - p) * 40}px) scale(${0.85 + 0.15 * p})` }}>
                {l === " " ? "\u00a0" : l}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

const Legenda: React.FC<Pick<TextoAtrasProps, "palavras" | "wordsPerCard">> = ({ palavras, wordsPerCard }) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const t = frame / fps;
  const cards: (typeof palavras)[] = [];
  for (let i = 0; i < palavras.length; i += wordsPerCard) cards.push(palavras.slice(i, i + wordsPerCard));
  const card = cards.find((c) => t >= c[0].start - 0.05 && t <= c[c.length - 1].end + 0.25);
  if (!card) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: Math.round(height * 0.12), display: "flex", justifyContent: "center" }}>
      <div style={{ maxWidth: 900, padding: "16px 28px", borderRadius: 18, backgroundColor: MOLDES.caixaLegenda, border: `1px solid ${ESCURO.fio}`, fontFamily: FONT.corpo, fontSize: 50, lineHeight: 1.15, textAlign: "center", color: ESCURO.texto }}>
        {card.map((w, i) => {
          const on = t >= w.start && t <= w.end + 0.08;
          return (
            <span key={i} style={{ color: on ? ESCURO.destaque : undefined }}>
              {w.text}
              {i < card.length - 1 ? " " : ""}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export const TextoAtras: React.FC<TextoAtrasProps> = (p) => (
  <AbsoluteFill style={{ ...SEM_NEGRITO_FALSO, backgroundColor: ESCURO.fundo }}>
    {/* 1 · o vídeo inteiro, com o fundo levado pro navy da marca */}
    {/* afastado (zoom < 1), o quadro do vídeo vira um retângulo: esfuma laterais e topo pro navy */}
    <AbsoluteFill style={p.zoom < 1 ? { WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%)", maskImage: "linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%)" } : undefined}>
      <AbsoluteFill style={p.zoom < 1 ? { WebkitMaskImage: "linear-gradient(to bottom, transparent 18%, black 34%)", maskImage: "linear-gradient(to bottom, transparent 18%, black 34%)" } : undefined}>
        <Video src={src(p.video)} muted style={cobre(p.zoom, p.focoY)} />
      </AbsoluteFill>
    </AbsoluteFill>
    <AbsoluteFill style={{ backgroundColor: `rgba(${RGB.escuro},${p.escurece})` }} />
    {/* 2 · a palavra-chave, atrás da pessoa */}
    {p.chaves.map((c, i) => (
      <Chave key={i} c={c} y={p.alturaChave} />
    ))}
    {/* 3 · a pessoa recortada por cima, sem escurecer */}
    {/* OffthreadVideo: o único que respeita o canal alfa do webm na renderização */}
    <OffthreadVideo src={src(p.frente)} muted transparent style={cobre(p.zoom, p.focoY)} />
    <Audio src={src(p.audio)} />
    <Legenda palavras={p.palavras} wordsPerCard={p.wordsPerCard} />
    <div style={{ position: "absolute", top: 90, left: 60, fontFamily: FONT.display, fontSize: 20, letterSpacing: 4, textTransform: "uppercase", color: ESCURO.olho, border: `1.5px solid ${ESCURO.olho}`, borderRadius: 999, padding: "10px 20px" }}>
      {p.selo}
    </div>
    <div style={{ position: "absolute", bottom: 60, right: 60, fontFamily: FONT.display, fontSize: 22, letterSpacing: 3, color: ESCURO.textoApoio }}>@{p.handle}</div>
  </AbsoluteFill>
);
