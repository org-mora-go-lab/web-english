import type { Lesson } from "@/src/4-entity";

export type LessonPracticeProps = {
  lesson: Lesson;
  onSeek: (seconds: number) => void;
};
