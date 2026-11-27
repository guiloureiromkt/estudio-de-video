import { FONT, RGB } from "../tema";
import { Video } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BAND_HEIGHT, CaptionBand } from "./CaptionBand";
import type { CaseCardProps } from "./schema";

const fontFamily = FONT.corpo;

const STAGE = 1080;
const WINDOW_MARGIN = 55;
const WINDOW_WIDTH = STAGE - WINDOW_MARGIN * 2;
// ease-in-out longo, sem bounce: é o movimento de câmera dos vídeos da Anthropic
const CAMERA_EASE = Easing.bezier(0.65, 0, 0.35, 1);

const src = (s: string) => (s.startsWith("http") ? s : staticFile(s));

// Interpola um campo ao longo dos keyframes; segmentos seguram o valor fora do intervalo.
const track = (frame: number, frames: number[], values: number[]) =>
  frames.length === 1
    ? values[0]
    : interpolate(frame, frames, values, {
        easing: CAMERA_EASE,
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });

const Cursor: React.FC<{ x: number; y: number; press: number }> = ({ x, y, press }) => (
  <svg
    width={34}
    height={34}
    viewBox="0 0 24 24"
    style={{
      position: "absolute",
      left: x - 5,
      top: y - 3,
      transform: `scale(${1 - press * 0.15})`,
      transformOrigin: "5px 3px",
      filter: "drop-shadow(0 2px 3px rgba(0,0,0,.35))",
    }}
  >
    <path d="M5 3l14 8.2-6.1 1.3-3.2 5.6L5 3z" fill="#fff" stroke="#111" strokeWidth={1.4} strokeLinejoin="round" />
  </svg>
);

export const CaseCard: React.FC<CaseCardProps> = (props) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const hasBand = height > STAGE && !props.semFaixa;

  const windowHeight = (WINDOW_WIDTH * props.media.viewportHeight) / props.media.viewportWidth;
  const windowLeft = WINDOW_MARGIN;
  const windowTop = (STAGE - windowHeight) / 2;
  const cssToWindow = WINDOW_WIDTH / props.media.viewportWidth;

  // câmera virtual
  const keys = [...props.camera].sort((a, b) => a.t - b.t);
  const kFrames = keys.map((k) => k.t * fps);
  const zoom = track(frame, kFrames, keys.map((k) => k.zoom));
  const fx = track(frame, kFrames, keys.map((k) => k.x));
  const fy = track(frame, kFrames, keys.map((k) => k.y));
  const scroll = track(frame, kFrames, keys.map((k) => k.scroll ?? 0));

  const focusX = windowLeft + fx * WINDOW_WIDTH;
  const focusY = windowTop + fy * windowHeight;
  const clampAxis = (v: number) => Math.min(0, Math.max(STAGE - STAGE * zoom, v));
  const camX = clampAxis(STAGE / 2 - focusX * zoom);
  const camY = clampAxis(STAGE / 2 - focusY * zoom);

  // entrada da janela: fade + subida curta
  const enter = interpolate(frame, [0, 0.7 * fps], [0, 1], {
    easing: CAMERA_EASE,
    extrapolateRight: "clamp",
  });

  // cursor: desliza até cada clique nos 0,8 s anteriores
  const clicks = [...props.clicks].sort((a, b) => a.t - b.t);
  const rest = { x: 0.82, y: 0.88 };
  let cursor = rest;
  let press = 0;
  for (let i = 0; i < clicks.length; i++) {
    const c = clicks[i];
    const prev = i === 0 ? rest : clicks[i - 1];
    const cf = c.t * fps;
    if (frame >= cf - 0.8 * fps) {
      const p = interpolate(frame, [cf - 0.8 * fps, cf], [0, 1], {
        easing: CAMERA_EASE,
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      cursor = { x: prev.x + (c.x - prev.x) * p, y: prev.y + (c.y - prev.y) * p };
      press = Math.max(press, interpolate(frame, [cf - 3, cf, cf + 5], [0, 1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }));
    }
  }

  return (
    <AbsoluteFill style={{ backgroundColor: props.stageColor }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: STAGE, height: STAGE, overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            width: STAGE,
            height: STAGE,
            transformOrigin: "0 0",
            transform: `translate(${camX}px, ${camY}px) scale(${zoom})`,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: windowLeft,
              top: windowTop,
              width: WINDOW_WIDTH,
              height: windowHeight,
              borderRadius: 14,
              overflow: "hidden",
              backgroundColor: props.windowColor,
              boxShadow: "0 20px 60px rgba(0,0,0,.25)",
              opacity: enter,
              transform: `translateY(${(1 - enter) * 24}px)`,
            }}
          >
            {props.media.type === "image" ? (
              <Img
                src={src(props.media.src)}
                style={{
                  position: "absolute",
                  left: 0,
                  top: -scroll * cssToWindow,
                  width: WINDOW_WIDTH,
                }}
              />
            ) : (
              <Video src={src(props.media.src)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            )}

            {clicks.map((c) => {
              const age = (frame - c.t * fps) / fps;
              if (age < 0 || age > 0.6) return null;
              const r = interpolate(age, [0, 0.6], [8, 46], { easing: Easing.out(Easing.cubic) });
              return (
                <div
                  key={c.t}
                  style={{
                    position: "absolute",
                    left: c.x * WINDOW_WIDTH - r,
                    top: c.y * windowHeight - r,
                    width: r * 2,
                    height: r * 2,
                    borderRadius: "50%",
                    border: "3px solid rgba(255,255,255,.9)",
                    boxShadow: "0 0 0 1px rgba(0,0,0,.25)",
                    opacity: interpolate(age, [0, 0.6], [0.9, 0]),
                  }}
                />
              );
            })}

            {props.showCursor && clicks.length > 0 ? (
              <Cursor x={cursor.x * WINDOW_WIDTH} y={cursor.y * windowHeight} press={press} />
            ) : null}
          </div>
        </div>

        {props.note ? (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 26,
              textAlign: "center",
              fontFamily,
              fontSize: 17,
              color: `rgba(${RGB.escuro},.55)`,
              // some quando a câmera entra na janela, senão cobre o conteúdo
              opacity: enter * interpolate(zoom, [1, 1.15], [1, 0], { extrapolateRight: "clamp" }),
            }}
          >
            {props.note}
          </div>
        ) : null}
      </div>

      {hasBand ? (
        <CaptionBand caption={props.caption} handle={props.handle} creditPrefix={props.creditPrefix} />
      ) : null}
    </AbsoluteFill>
  );
};

export { BAND_HEIGHT, STAGE };
