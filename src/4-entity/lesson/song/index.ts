import plans from "@/public/media/singalong/plans.json";

import type { Lesson } from "../type";

export const songs: Lesson[] = plans.map(plan => ({
  id: plan.id, kind: "song", animal: plan.animal, animalName: plan.name,
  title: plan.title, subtitle: `${plan.name}'s little sing-along · ${plan.topic}`,
  category: "동물 동요", level: "2세+ · 함께 놀아요", duration: "1 min",
  creator: "Mora Little Friends", initial: plan.name[0], color: "olive",
  headline: [plan.name, plan.lyrics[0]], caption: plan.topic,
  goal: `${plan.korean} ${plan.name}와 짧은 영어 노래를 부르고 ${plan.meaning} 놀이를 해요.`,
  scenario: "아이와 나란히 앉아 노래를 듣고, 쉬운 동작을 함께 따라 해 보세요. 잠깐 멈추고 아이가 반응할 시간을 주세요.",
  tip: "단어를 정확히 말하지 않아도 괜찮아요. 아이가 좋아하는 소리와 동작을 함께 반복하며 즐겨 주세요.",
  vocabulary: [{ word: plan.animal, meaning: plan.korean }, { word: plan.word, meaning: plan.meaning }, { word: "hello", meaning: "안녕" }],
  phrases: [...plan.lyrics.map((english, index) => ({ english, korean: plan.translations[index] })), { english: plan.play, korean: `함께 해 봐요: ${plan.meaning}` }],
  dialogue: plan.lyrics.map((english, index) => ({ speaker: plan.name, english, korean: plan.translations[index] })),
  quiz: { question: "이번 노래의 동물 친구는 누구인가요?", options: [plan.korean, "다른 동물 친구", "노래를 한 번 더 들어요"], answer: 0, explanation: `${plan.korean} ${plan.name}와 함께 노래했어요.` },
}));
