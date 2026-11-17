export function cleanConversationTitle(value: string) {
  return Array.from(value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().replace(/^["“”'`#\s]+|["“”'`\s]+$/g, "")).slice(0, 40).join("").trim();
}

export function contentConversationTitle(text: string) {
  const title = /^영어 학습 콘텐츠\s*[“"「『]([^”"」』]+)[”"」』]/.exec(text)?.[1];
  return title ? cleanConversationTitle(title) : "";
}

function familiarTopic(text: string) {
  if (/공놀이|공을 굴|roll.{0,15}ball/i.test(text)) return "공놀이 영어";
  if (/talk(?:ing)? about my day|오늘 하루|오늘 있었던 일/i.test(text)) return "하루 이야기 영어";
  if (/손.{0,4}씻|wash.{0,15}hands/i.test(text)) return "손 씻기 영어";
  if (/simple greeting|영어로.{0,5}인사/i.test(text)) return "영어 인사 연습";
  return "";
}

export function initialConversationTitle(firstQuestion: string, generated?: string) {
  return contentConversationTitle(firstQuestion) || (generated ? cleanConversationTitle(generated) : "") || familiarTopic(firstQuestion)
    || cleanConversationTitle(firstQuestion.split(/[\n.!?]/)[0].replace(/^(?:I'd like to |I want to |Please |저는 |오늘은 )/i, "")) || "영어 놀이 대화";
}

/** Repair old automatic titles, preserving independently stored titles. */
export function legacyConversationTitle(firstQuestion: string, stored: string) {
  return contentConversationTitle(firstQuestion) || (stored === firstQuestion.slice(0, 60) ? familiarTopic(firstQuestion) : "") || stored;
}
