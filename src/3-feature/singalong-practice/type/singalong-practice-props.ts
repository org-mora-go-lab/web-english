import type { Lesson } from "@/src/4-entity";

export type SingalongPracticeProps = { lesson: Lesson; onSeek: (seconds: number) => void };
