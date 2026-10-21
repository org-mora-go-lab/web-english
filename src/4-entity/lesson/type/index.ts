export type Lesson = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  level: string;
  duration: string;
  creator: string;
  initial: string;
  color: string;
  headline: string[];
  caption: string;
  goal: string;
  scenario: string;
  tip: string;
  vocabulary: { word: string; meaning: string }[];
  dialogue: { speaker: string; english: string; korean: string }[];
  quiz: {
    question: string;
    options: string[];
    answer: number;
    explanation: string;
  };
  phrases: { english: string; korean: string }[];
};
