import { Composition, Still, type CalculateMetadataFunction } from "remotion";
import { MARCA } from "./tema";
import { Capa, capaSchema } from "./Capa/Capa";
import { Papercraft, papercraftSchema } from "./Papercraft/Papercraft";
import { BAND_HEIGHT, CaseCard, STAGE } from "./CaseCard/CaseCard";
import { caseCardSchema, type CaseCardProps } from "./CaseCard/schema";
import { Explainer } from "./Explainer/Explainer";
import { explainerDemo } from "./Explainer/demo";
import { explainerSchema, type ExplainerProps } from "./Explainer/schema";
import { FakeUI } from "./FakeUI/FakeUI";
import { fakeUIDemo } from "./FakeUI/demo";
import { fakeUISchema, type FakeUIProps } from "./FakeUI/schema";
import { SplitScreen } from "./SplitScreen/SplitScreen";
import { splitScreenDemo } from "./SplitScreen/demo";
import { splitScreenSchema, type SplitScreenProps } from "./SplitScreen/schema";
import { papercraftDemo } from "./Papercraft/demo";
import { Animacao, animacaoSchema, type AnimacaoProps } from "./Animacao/Animacao";
import { ReelMisto, reelMistoSchema, duracaoReelMisto, type ReelMistoProps } from "./ReelMisto/ReelMisto";

const FPS = 30;

const calculateMetadata: CalculateMetadataFunction<CaseCardProps> = ({ props }) => ({
  durationInFrames: Math.round(props.durationInSeconds * FPS),
});

const explainerMetadata: CalculateMetadataFunction<ExplainerProps> = ({ props }) => ({
  durationInFrames: Math.round(props.durationInSeconds * FPS),
});

const fakeUIMetadata: CalculateMetadataFunction<FakeUIProps> = ({ props }) => ({
  durationInFrames: Math.round(props.durationInSeconds * FPS),
});

const splitMetadata: CalculateMetadataFunction<SplitScreenProps> = ({ props }) => ({
  durationInFrames: Math.round(props.durationInSeconds * FPS),
});

const animacaoMetadata: CalculateMetadataFunction<AnimacaoProps> = ({ props }) => ({
  durationInFrames: Math.round(props.durationInSeconds * FPS),
});

const reelMistoMetadata: CalculateMetadataFunction<ReelMistoProps> = ({ props }) => ({
  durationInFrames: Math.round(duracaoReelMisto(props) * FPS),
});

// Demo: uma página de exemplo capturada em 1440×900 @2x (public/demo/site.jpg, gerada de demo/pagina.html).
const demo: CaseCardProps = {
  media: { type: "image", src: "demo/site.jpg", viewportWidth: 1440, viewportHeight: 900 },
  durationInSeconds: 15,
  stageColor: MARCA.claro, // o "palco" atrás da janela
  windowColor: MARCA.escuro,
  caption: "Uma página inteira desenhada e construída com o Claude Code.",
  handle: "suamarca",
  creditPrefix: "Por",
  note: "Captura real da página, sem retoque",
  showCursor: true,
  camera: [
    { t: 0, zoom: 1, x: 0.5, y: 0.5, scroll: 0 },
    { t: 1.2, zoom: 1, x: 0.5, y: 0.5, scroll: 0 },
    { t: 3, zoom: 2.2, x: 0.2, y: 0.35, scroll: 0 },
    { t: 4.4, zoom: 2.2, x: 0.2, y: 0.4, scroll: 0 },
    { t: 5.4, zoom: 2.6, x: 0.14, y: 0.7, scroll: 0 },
    { t: 6.6, zoom: 2.6, x: 0.14, y: 0.7, scroll: 0 },
    { t: 8, zoom: 1, x: 0.5, y: 0.5, scroll: 0 },
    { t: 9.6, zoom: 1, x: 0.5, y: 0.5, scroll: 1560 },
    { t: 11, zoom: 2, x: 0.5, y: 0.12, scroll: 1560 },
    { t: 12.4, zoom: 2.2, x: 0.5, y: 0.86, scroll: 1560 },
    { t: 13.4, zoom: 2.2, x: 0.5, y: 0.86, scroll: 1560 },
    { t: 14.6, zoom: 1, x: 0.5, y: 0.5, scroll: 1560 },
  ],
  clicks: [{ t: 6, x: 0.135, y: 0.713 }],
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Instagram 4:5: palco 1080 + faixa de legenda 270 */}
      <Composition
        id="CaseCard-4x5"
        component={CaseCard}
        schema={caseCardSchema}
        defaultProps={demo}
        calculateMetadata={calculateMetadata}
        fps={FPS}
        width={STAGE}
        height={STAGE + BAND_HEIGHT}
        durationInFrames={450}
      />
      {/* X / LinkedIn: só o palco quadrado, sem faixa */}
      <Composition
        id="CaseCard-1x1"
        component={CaseCard}
        schema={caseCardSchema}
        defaultProps={demo}
        calculateMetadata={calculateMetadata}
        fps={FPS}
        width={STAGE}
        height={STAGE}
        durationInFrames={450}
      />
      {/* Explicador vertical (estilo @thaleslaray): ilustração no centro + legenda palavra a palavra */}
      <Composition
        id="Explainer-9x16"
        component={Explainer}
        schema={explainerSchema}
        defaultProps={explainerDemo}
        calculateMetadata={explainerMetadata}
        fps={FPS}
        width={1080}
        height={1920}
        durationInFrames={480}
      />
      {/* Interface falsa animada (estilo @tudormorari.ai): contador, título, gráfico e app falso */}
      <Composition
        id="FakeUI-9x16"
        component={FakeUI}
        schema={fakeUISchema}
        defaultProps={fakeUIDemo}
        calculateMetadata={fakeUIMetadata}
        fps={FPS}
        width={1080}
        height={1920}
        durationInFrames={510}
      />
      {/* Tela dividida: tela em cima, rosto embaixo, legenda na costura */}
      <Composition
        id="SplitScreen-9x16"
        component={SplitScreen}
        schema={splitScreenSchema}
        defaultProps={splitScreenDemo}
        calculateMetadata={splitMetadata}
        fps={FPS}
        width={1080}
        height={1920}
        durationInFrames={288}
      />
      {/* Clipes em tela cheia com legenda palavra por palavra (seus vídeos, ou clipes feitos em outro molde) */}
      <Composition
        id="Animacao-9x16"
        component={Animacao}
        schema={animacaoSchema}
        defaultProps={{ durationInSeconds: 4, audio: "demo/silencio.mp3", clips: [{ src: "demo/rosto.mp4", start: 0, duration: 4 }], words: [{ text: "Cada", start: 0.2, end: 0.5 }, { text: "clipe", start: 0.5, end: 0.9 }, { text: "entra", start: 0.9, end: 1.2 }, { text: "em", start: 1.2, end: 1.35 }, { text: "tela", start: 1.35, end: 1.7 }, { text: "cheia,", start: 1.7, end: 2.1 }, { text: "com", start: 2.3, end: 2.5 }, { text: "a", start: 2.5, end: 2.6 }, { text: "legenda", start: 2.6, end: 3.1 }, { text: "embaixo.", start: 3.1, end: 3.7 }], wordsPerCard: 4, handle: "suamarca", selo: "Clipes de exemplo" }}
        calculateMetadata={animacaoMetadata}
        fps={FPS}
        width={1080}
        height={1920}
        durationInFrames={90}
      />
      {/* Reel em blocos (tela dividida + animação), com abertura e fechamento opcionais: reel único ou slide de carrossel */}
      <Composition
        id="ReelMisto-9x16"
        component={ReelMisto}
        schema={reelMistoSchema}
        defaultProps={{ blocos: [{ tipo: "split" as const, props: { ...splitScreenDemo, skin: "marca" as const } }] }}
        calculateMetadata={reelMistoMetadata}
        fps={FPS}
        width={1080}
        height={1920}
        durationInFrames={240}
      />
      {/* O mesmo reel em blocos no 4:5: o carrossel do Instagram corta tudo que passa de 4:5 */}
      <Composition
        id="ReelMisto-4x5"
        component={ReelMisto}
        schema={reelMistoSchema}
        defaultProps={{ blocos: [{ tipo: "split" as const, props: { ...splitScreenDemo, skin: "marca" as const } }] }}
        calculateMetadata={reelMistoMetadata}
        fps={FPS}
        width={1080}
        height={1350}
        durationInFrames={240}
      />
          {/* Capa de feed: boneco + letreiro ousado (vira 1º quadro e capa do Reel) */}
      <Still id="Capa-9x16" component={Capa} schema={capaSchema} width={1080} height={1920}
        defaultProps={{ imagem: "capas/ilustra.png", topo: 270, desce: 170, fundo: "#FFCC02" /* cor-da-referencia: o amarelo do fundo da ilustração de exemplo */, linhas: [{ texto: "Quanto custa", tamanho: 150 }, { texto: "um vídeo?", tamanho: 150, faixa: MARCA.principal, cor: MARCA.branco }] }} />
          {/* Colagem de papel com sincronia por palavra */}
      <Composition id="Papercraft-9x16" component={Papercraft} schema={papercraftSchema} fps={30} width={1080} height={1920}
        durationInFrames={240} defaultProps={papercraftDemo}
        calculateMetadata={({ props }) => ({ durationInFrames: Math.round(props.durationInSeconds * 30) })} />
    </>
  );
};
