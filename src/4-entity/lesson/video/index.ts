import manifest from "@/public/media/lessons/manifest.json";
import songManifest from "@/public/media/singalong/manifest.json";

export const lessonVideos: Record<string, {
  src: string; poster: string; captions: string; seconds: number; label: string;
  segments: { kind: string; text: string; korean: string; start: number; end: number }[];
}> = { ...manifest, ...songManifest };
