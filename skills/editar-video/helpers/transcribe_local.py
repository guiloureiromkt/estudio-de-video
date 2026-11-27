"""Local GPU transcription for video-use — drop-in replacement for ElevenLabs Scribe.

Emits the SAME JSON shape Scribe returns, because everything downstream
(pack_transcripts.py, timeline_view.py, render.py) reads only:

    {"language_code": str, "text": str,
     "words": [{"text", "start", "end", "type", "speaker_id"}, ...]}

`type` is "word" or "spacing". Spacing entries matter: pack_transcripts uses the
gaps between words to decide where a phrase ends, so they are emitted, not skipped.

Runs under the venv created in install.md (faster-whisper + ctranslate2):

    python helpers/transcribe_local.py <audio.wav> <out.json>

With a CUDA GPU it uses large-v3 in float16; without one, small in int8 on the CPU
(measured: 30 s of speech in about 11 s on a laptop CPU).

Known gap vs Scribe: no diarization. Every word gets speaker_id "speaker_0".
For single-speaker footage that is equivalent; for multi-speaker interviews the
speaker split is lost (video-use will still cut, it just can't group by speaker).
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

MIN_GAP = 0.02               # segundos: abaixo disso não vale emitir spacing


def pick_device() -> tuple[str, str, str]:
    """Placa de vídeo (CUDA) se houver; senão CPU com um modelo menor.

    VIDEO_USE_WHISPER_MODEL troca o modelo nos dois casos.
    """
    import os
    try:
        import ctranslate2
        has_cuda = ctranslate2.get_cuda_device_count() > 0
    except Exception:
        has_cuda = False
    if has_cuda:
        return os.environ.get("VIDEO_USE_WHISPER_MODEL", "large-v3"), "cuda", "float16"
    return os.environ.get("VIDEO_USE_WHISPER_MODEL", "small"), "cpu", "int8"


def transcribe(audio: Path, language: str | None) -> dict:
    from faster_whisper import WhisperModel

    model_name, device, compute = pick_device()
    model = WhisperModel(model_name, device=device, compute_type=compute)
    segments, info = model.transcribe(
        str(audio),
        language=language,
        word_timestamps=True,
        vad_filter=True,
    )

    words: list[dict] = []
    text_parts: list[str] = []
    prev_end: float | None = None

    for seg in segments:
        for w in seg.words or []:
            token = (w.word or "").strip()
            if not token:
                continue
            start, end = float(w.start), float(w.end)
            if prev_end is not None and start - prev_end >= MIN_GAP:
                words.append({
                    "text": " ",
                    "start": round(prev_end, 3),
                    "end": round(start, 3),
                    "type": "spacing",
                    "speaker_id": "speaker_0",
                })
            words.append({
                "text": token,
                "start": round(start, 3),
                "end": round(end, 3),
                "type": "word",
                "speaker_id": "speaker_0",
            })
            text_parts.append(token)
            prev_end = end

    return {
        "language_code": info.language,
        "language_probability": round(float(info.language_probability), 4),
        "text": " ".join(text_parts),
        "words": words,
        "_provider": f"faster-whisper/{model_name}/{device}",
    }


def main() -> None:
    ap = argparse.ArgumentParser(description="Local GPU transcription (Scribe-compatible output)")
    ap.add_argument("audio", type=Path)
    ap.add_argument("out", type=Path)
    ap.add_argument("--language", default=None)
    args = ap.parse_args()

    if not args.audio.exists():
        sys.exit(f"audio not found: {args.audio}")

    payload = transcribe(args.audio, args.language)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(payload, indent=2, ensure_ascii=False))
    n = sum(1 for w in payload["words"] if w["type"] == "word")
    print(f"  local: {n} words, lang={payload['language_code']}")


if __name__ == "__main__":
    main()
