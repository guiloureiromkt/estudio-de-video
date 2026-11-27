import { FONT } from "../tema";

const fontFamily = FONT.corpo;

// Faixa medida nos vídeos da @claudeai (22/09/2026): 1080×270, #131313, texto #EDEDE8,
// margem esquerda 61 px, primeira linha 68 px abaixo do topo, corpo 30/40, no máximo 2 linhas,
// crédito 30 px abaixo do parágrafo.
export const BAND_HEIGHT = 270;

export const CaptionBand: React.FC<{
  caption: string;
  handle: string;
  creditPrefix: string;
}> = ({ caption, handle, creditPrefix }) => {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: BAND_HEIGHT,
        backgroundColor: "#131313",
        color: "#EDEDE8",
        fontFamily,
        padding: "68px 61px 0 61px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          fontSize: 30,
          lineHeight: "40px",
          fontWeight: 400,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {caption}
      </div>
      {handle ? (
        <div style={{ fontSize: 30, lineHeight: "40px", marginTop: 30 }}>
          {creditPrefix} <span style={{ fontWeight: 600 }}>@{handle}</span>
        </div>
      ) : null}
    </div>
  );
};
