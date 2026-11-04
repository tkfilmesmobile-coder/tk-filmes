import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// yuv420p (não yuvj420p): abre em qualquer player, no Windows, no WhatsApp e no Instagram
Config.setPixelFormat("yuv420p");
// 3D (Three.js) renderiza com WebGL: ANGLE no Chrome headless
Config.setChromiumOpenGlRenderer("angle");
