export type PlayTheme = "일상" | "장난감" | "그림책" | "노래·몸짓" | "산책";
export type PlayActivity = { id: string; months: string; theme: PlayTheme; icon: string; title: string; phrase: string; meaning: string; scene: string; steps: string; parentTip: string };
export type AgeMonth = { age: number; focus: string; cue: string };
