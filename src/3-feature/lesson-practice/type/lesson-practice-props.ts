import type { Lesson } from "@/src/4-entity";

export type LessonPracticeProps = {
  lesson: Lesson;
  saved: boolean;
  completed: boolean;
  onClose: () => void;
  onSave: () => void;
  onComplete: () => void;
};
