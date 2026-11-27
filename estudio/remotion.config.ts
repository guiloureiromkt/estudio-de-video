/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// Saída no formato que todo player toca: yuv420p em faixa limitada (bt709).
// Sem isso o render sai yuvj420p (faixa cheia) e o player do app no celular só toca o áudio (28/09/2026).
Config.setPixelFormat("yuv420p");
Config.setColorSpace("bt709");
