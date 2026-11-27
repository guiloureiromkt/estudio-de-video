import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT, ESCURO, RGB, SEM_NEGRITO_FALSO, ponto } from "./tema";

// Motion do site (DESIGN.md §Motion): a LUZ é o que se move; easing exponencial, sem bounce.
const EASE = Easing.bezier(0.16, 1, 0.3, 1);

const useP = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const at = (a: number, b: number) => interpolate(t, [a, b], [0, 1], { easing: EASE, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return { t, at, total: durationInFrames / fps, frame };
};

// céu: a cor escura do tema, com uma luz da cor principal bem fraca que "amanhece" e pontos que derivam pra cima
const Ceu: React.FC<{ luz: number }> = ({ luz }) => {
  const { t } = useP();
  const { height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: ESCURO.fundo }}>
      <AbsoluteFill
        style={{
          opacity: luz,
          background: `radial-gradient(ellipse at 50% ${46 - 6 * luz}%, rgba(${RGB.principal},.16), rgba(${RGB.secundaria},.08) ${34 + 6 * luz}%, rgba(${RGB.escuro},0) 72%)`,
        }}
      />
      {Array.from({ length: 22 }).map((_, i) => {
        const x = random(`x${i}`) * 1080;
        const y0 = height * (0.45 + random(`y${i}`) * 0.6);
        const v = 60 + random(`v${i}`) * 90;
        const s = 3 + random(`s${i}`) * 5;
        const y = y0 - v * t;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + Math.sin(t * 1.3 + i) * 12,
              top: y,
              width: s,
              height: s,
              borderRadius: "50%",
              background: i % 3 ? ESCURO.destaque : ESCURO.olho,
              opacity: 0.25 + 0.5 * random(`o${i}`),
              boxShadow: `0 0 ${s * 3}px ${i % 3 ? ESCURO.destaque : ESCURO.olho}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// O nome que aparece na abertura e no fechamento. Troque pelo da sua marca.
export const NOME_DA_MARCA = "SUA MARCA";

const Marca: React.FC<{ tamanho: number; revela: number }> = ({ tamanho, revela }) => (
  <div style={{ display: "flex", alignItems: "center", gap: tamanho * 0.5 }}>
    <div style={{ ...ponto(tamanho * 0.62), transform: `scale(${0.4 + 0.6 * revela})`, opacity: revela }} />
    <div
      style={{
        fontFamily: FONT.display,
        fontSize: tamanho,
        letterSpacing: `${0.09 * tamanho}px`,
        color: ESCURO.texto,
        clipPath: `inset(0 ${100 - 100 * revela}% 0 0)`,
      }}
    >
      {NOME_DA_MARCA}
    </div>
  </div>
);

// "texto *destaque*": o trecho entre asteriscos sai na cor principal do tema, em peso 800
const Realce: React.FC<{ texto: string }> = ({ texto }) => (
  <>
    {texto.split(/(\*[^*]+\*)/).map((c, i) =>
      c.startsWith("*") ? (
        // número e palavra em destaque na fonte do tema
        <span key={i} style={{ color: ESCURO.destaque, fontWeight: 800, fontFamily: /\d/.test(c) ? FONT.display : undefined }}>
          {c.slice(1, -1)}
        </span>
      ) : (
        <span key={i}>{c}</span>
      ),
    )}
  </>
);

export const Abertura: React.FC<{ serie: string; titulo: string }> = ({ serie, titulo }) => {
  const { at, t, total } = useP();
  const sai = at(total - 0.3, total);
  return (
    <AbsoluteFill style={{ ...SEM_NEGRITO_FALSO, opacity: 1 - sai, transform: `scale(${1 + 0.06 * sai})` }}>
      <Ceu luz={at(0, 0.9)} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 56, padding: "0 90px" }}>
        <Marca tamanho={44} revela={at(0.1, 0.7)} />
        <div
          style={{
            fontFamily: FONT.display,
            fontSize: 24,
            letterSpacing: 5,
            textTransform: "uppercase",
            color: ESCURO.texto,
            border: `1.5px solid ${ESCURO.destaque}`,
            background: `rgba(${RGB.principal},.14)`,
            borderRadius: 999,
            padding: "12px 26px",
            opacity: at(0.45, 0.8),
            transform: `translateY(${(1 - at(0.45, 0.8)) * 20}px)`,
          }}
        >
          {serie}
        </div>
        <div
          style={{
            fontFamily: FONT.titulo,
            fontWeight: 800,
            fontSize: 104,
            lineHeight: 1.02,
            letterSpacing: -2,
            color: ESCURO.texto,
            textAlign: "center",
            textTransform: "uppercase",
            opacity: at(0.6, 1.0),
            transform: `translateY(${(1 - at(0.6, 1.0)) * 40}px)`,
            filter: `blur(${(1 - at(0.6, 1.0)) * 10}px)`,
          }}
        >
          <Realce texto={titulo} />
        </div>
        <div style={{ height: 6, width: 360 * at(0.9, 1.5), borderRadius: 3, background: ESCURO.barra, opacity: t > 0.9 ? 1 : 0 }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Fechamento: React.FC<{ frase: string; handle: string; selo: string }> = ({ frase, handle, selo }) => {
  const { at } = useP();
  const entra = at(0, 0.35);
  return (
    <AbsoluteFill style={{ ...SEM_NEGRITO_FALSO, opacity: entra }}>
      <Ceu luz={at(0, 1.2)} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 52, padding: "0 90px" }}>
        <Marca tamanho={62} revela={at(0.15, 0.8)} />
        <div
          style={{
            fontFamily: FONT.titulo,
            fontWeight: 700,
            fontSize: 76,
            color: ESCURO.texto,
            textAlign: "center",
            opacity: at(0.5, 1.0),
            transform: `translateY(${(1 - at(0.5, 1.0)) * 26}px)`,
          }}
        >
          <Realce texto={frase} />
        </div>
        <div style={{ fontFamily: FONT.corpo, fontSize: 40, color: ESCURO.textoApoio, opacity: at(0.75, 1.2) }}>@{handle}</div>
        <div
          style={{
            fontFamily: FONT.display,
            fontSize: 22,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: ESCURO.olho,
            border: `1.5px solid ${ESCURO.olho}`,
            borderRadius: 999,
            padding: "12px 26px",
            opacity: at(1.0, 1.4),
          }}
        >
          {selo}
        </div>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 0, bottom: 0, height: 10, width: `${100 * at(0.3, 1.6)}%`, background: ESCURO.barra }} />
    </AbsoluteFill>
  );
};
