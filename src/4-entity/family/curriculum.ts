import { legacyActivities } from "./legacy-activities";
import { monthlyActivities } from "./monthly-activities";
import type { AgeMonth, PlayActivity } from "./type";

export const ageMonths: AgeMonth[] = [
  { age: 16, focus: "함께 바라보고 인사하기", cue: "익숙한 사물 이름과 부모의 몸짓을 함께 만나요." },
  { age: 17, focus: "만지고 움직이며 소리 듣기", cue: "공, 인형, 그림책을 부모와 함께 천천히 탐색해요." },
  { age: 18, focus: "인사와 짧은 요청 만나기", cue: "일상의 한 장면에 짧은 영어 한마디를 더해요." },
  { age: 19, focus: "고르고 넣으며 함께 놀기", cue: "아이의 시선과 손짓을 선택으로 받아 주세요." },
  { age: 20, focus: "익숙한 행동에 말 더하기", cue: "안기, 옷 입기, 산책의 작은 행동을 말로 들려줘요." },
  { age: 21, focus: "동작과 위치를 함께 보기", cue: "부모가 하는 행동을 짧게 말하고 반응을 기다려요." },
  { age: 22, focus: "생활 순서와 두 가지 선택", cue: "씻고 닦기, 위아래, 두 장난감으로 이야기를 나눠요." },
  { age: 23, focus: "인형과 그림책으로 상황 놀이", cue: "먹이기와 인사하기를 부모가 먼저 보여줘요." },
  { age: 24, focus: "좋아하는 대상으로 짧은 대화", cue: "아이가 좋아하는 물건과 행동을 짧은 표현으로 이어가요." },
];

export function supportedAge(age: number) { return Math.min(24, Math.max(16, Math.trunc(Number.isFinite(age) ? age : 16))); }

const reusedMonths: Record<string, string> = { prep: "16", "18": "18", "21": "21", "24": "24" };
export const playActivities: PlayActivity[] = [
  ...legacyActivities.filter(item => item.months in reusedMonths).map(item => ({ ...item, months: reusedMonths[item.months] })),
  ...monthlyActivities,
].sort((a, b) => Number(a.months) - Number(b.months));

// Archived activities remain available only for existing records and chat visuals.
export const allPlayActivities = [...playActivities, ...legacyActivities.filter(item => !playActivities.some(active => active.id === item.id))];
export function activitiesForAge(age: number) { return playActivities.filter(item => item.months === String(supportedAge(age))); }
export function activityById(id: string) { return allPlayActivities.find(activity => activity.id === id); }
