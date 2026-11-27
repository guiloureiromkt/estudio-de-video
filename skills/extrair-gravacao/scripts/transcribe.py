#!/usr/bin/env python3
"""
transcribe.py — gravacao -> transcricao timestampada em Markdown.

Dois caminhos (auto):
  1. Se existe um .vtt/.srt ao lado (ou --vtt): empacota os cues por TURNO de
     falante (Zoom/Meet exportam "Nome: texto") -> blocos [MM:SS-MM:SS] Nome: fala.
  2. Senao: extrai o audio e roda faster-whisper -> blocos de ~--block-sec
     segundos, SEM rotulo de falante (avisa). Placa de video NVIDIA se houver
     (large-v3), senao CPU (small). --model troca o modelo.

Uso:
  python transcribe.py --rec "caminho.mp4" --out "saida-transcript.md" [--lang pt]
                       [--vtt "caminho.vtt"] [--block-sec 40] [--model large-v3]
"""
import os, re, sys, json, time, argparse, subprocess, tempfile
from pathlib import Path


def ts(sec):
    sec = int(round(sec)); return f"{sec//60:02d}:{sec%60:02d}"


# ------------------------------------------------------------ VTT / SRT
def parse_time(t):
    t = t.replace(",", ".").strip()
    p = t.split(":")
    if len(p) == 3:
        h, m, s = p
    else:
        h, m, s = 0, p[0], p[1]
    return int(h) * 3600 + int(m) * 60 + float(s)


def read_cues(path):
    """Devolve [(start, end, speaker|None, text)] de um .vtt/.srt."""
    raw = Path(path).read_text(encoding="utf-8", errors="ignore")
    cues = []
    for block in re.split(r"\n\s*\n", raw):
        m = re.search(r"(\d{1,2}:\d{2}[:.]\d{2}[.,]?\d*)\s*-->\s*(\d{1,2}:\d{2}[:.]\d{2}[.,]?\d*)", block)
        if not m:
            continue
        start, end = parse_time(m.group(1)), parse_time(m.group(2))
        lines = block.split("\n")
        txt = " ".join(l for l in lines[lines.index(m.string[m.start():].split("\n")[0]) + 1:] if l.strip()) \
            if False else " ".join(l.strip() for l in lines if "-->" not in l and not re.match(r"^\d+$", l.strip()) and "WEBVTT" not in l)
        txt = re.sub(r"<[^>]+>", "", txt).strip()  # tira tags <v ..>
        if not txt:
            continue
        spk = None
        sm = re.match(r"^([^:]{1,40}):\s*(.*)$", txt)
        if sm:
            spk, txt = sm.group(1).strip(), sm.group(2).strip()
        cues.append((start, end, spk, txt))
    return cues


def pack_turns(cues):
    """Junta cues consecutivos do mesmo falante num bloco (por turno)."""
    out, cur = [], None
    for start, end, spk, txt in cues:
        if cur and cur[2] == spk:
            cur[1] = end; cur[3] += " " + txt
        else:
            if cur:
                out.append(cur)
            cur = [start, end, spk, txt]
    if cur:
        out.append(cur)
    lines = []
    for start, end, spk, txt in out:
        who = f"{spk}: " if spk else ""
        lines.append(f"[{ts(start)}-{ts(end)}] {who}{txt}")
    return lines


# ------------------------------------------------------------ whisper
def pick_device(model_name):
    """Placa de video (CUDA) se houver; senao CPU com modelo menor."""
    try:
        import ctranslate2
        has_cuda = ctranslate2.get_cuda_device_count() > 0
    except Exception:
        has_cuda = False
    if has_cuda:
        return model_name or "large-v3", "cuda", "float16"
    return model_name or "small", "cpu", "int8"


def whisper_transcribe(rec, lang, block_sec, model_name, out_path=None):
    """Transcreve na maquina.

    Licao aprendida: sem vad_filter e sem
    condition_on_previous_text=False, o large-v3 entra em LOOP DE REPETICAO num
    trecho de silencio e mo GPU indefinidamente -- 16h sem escrever uma linha, e
    sem erro nenhum. Como o script so gravava no fim, dava pra confundir loop com
    "ainda rodando". Por isso, aqui: VAD ligado, contexto anterior desligado, e
    escrita INCREMENTAL com progresso a cada bloco.
    """
    from faster_whisper import WhisperModel
    with tempfile.TemporaryDirectory() as td:
        wav = os.path.join(td, "a.wav")
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", rec,
                        "-vn", "-ac", "1", "-ar", "16000", wav], check=True)
        model_name, device, compute = pick_device(model_name)
        print(f"[transcribe] faster-whisper '{model_name}' em {device}", flush=True)
        model = WhisperModel(model_name, device=device, compute_type=compute)
        segments, _info = model.transcribe(
            wav, language=lang, word_timestamps=False,
            vad_filter=True, vad_parameters=dict(min_silence_duration_ms=500),
            condition_on_previous_text=False, beam_size=5)

        t0 = time.time()
        parcial = open(out_path + ".parcial", "w", encoding="utf-8") if out_path else None
        lines, buf, b_start, b_end = [], [], None, None
        for seg in segments:                     # streaming: NAO usar list(segments)
            if b_start is None:
                b_start = seg.start
            buf.append(seg.text.strip()); b_end = seg.end
            if b_end - b_start >= block_sec:
                linha = f"[{ts(b_start)}-{ts(b_end)}] " + " ".join(buf)
                lines.append(linha)
                if parcial:
                    parcial.write(linha + "\n"); parcial.flush()
                print(f"[transcribe] {ts(b_end)} de audio | {len(lines)} blocos | "
                      f"{time.time()-t0:.0f}s", flush=True)
                buf, b_start = [], None
        if buf:
            linha = f"[{ts(b_start)}-{ts(b_end)}] " + " ".join(buf)
            lines.append(linha)
            if parcial:
                parcial.write(linha + "\n")
        if parcial:
            parcial.close()
            try:
                os.remove(out_path + ".parcial")
            except OSError:
                pass
    return lines


def find_sidecar(rec):
    stem = Path(rec).with_suffix("")
    for ext in (".vtt", ".srt", ".transcript.vtt"):
        for cand in (Path(str(stem) + ext), Path(str(rec) + ext)):
            if cand.exists():
                return str(cand)
    # qualquer .vtt na mesma pasta com nome parecido
    for f in Path(rec).parent.glob("*.vtt"):
        if Path(rec).stem[:12] in f.stem:
            return str(f)
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--rec", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--lang", default="pt")
    ap.add_argument("--vtt", default=None)
    ap.add_argument("--block-sec", type=int, default=40)
    ap.add_argument("--model", default=None, help="padrao: large-v3 com placa de video, small sem")
    a = ap.parse_args()

    vtt = a.vtt or find_sidecar(a.rec)
    if vtt:
        print(f"[transcribe] usando legenda com falantes: {vtt}")
        lines = pack_turns(read_cues(vtt))
        fonte = f"VTT/SRT ({Path(vtt).name}) — COM rotulo de falante"
    else:
        print("[transcribe] sem VTT -> faster-whisper")
        lines = whisper_transcribe(a.rec, a.lang, a.block_sec, a.model, a.out)
        fonte = "faster-whisper — SEM rotulo de falante (revisar quem fala)"

    words = sum(len(l.split()) for l in lines)
    header = (f"# Transcricao — {Path(a.rec).name}\n\n"
              f"> Fonte: {fonte}. Blocos = [MM:SS-MM:SS]. ~{words} palavras.\n\n")
    Path(a.out).write_text(header + "\n".join(lines) + "\n", encoding="utf-8")
    print(f"[transcribe] OK -> {a.out} ({len(lines)} blocos · ~{words} palavras)")


if __name__ == "__main__":
    main()
