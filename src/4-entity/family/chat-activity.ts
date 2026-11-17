import { playActivities } from "./curriculum";

/** Restore a trusted catalogue visual from the topic marker saved in user messages. */
export function activityFromChatText(text: string) {
  const marker = text.match(/\[MORA_PLAY:([a-z0-9-]+)\]/);
  if (marker) return playActivities.find(activity => activity.id === marker[1]);
  // Keep topic conversations created before explicit catalogue markers readable.
  const title = text.match(/^영어 학습 콘텐츠 “([^”]+)”로 대화를 시작해 주세요\./)?.[1];
  return title ? playActivities.find(activity => activity.title === title) : undefined;
}
