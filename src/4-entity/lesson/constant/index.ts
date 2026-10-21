import type { Lesson } from "../type";

export const categories = [
  "전체",
  "일상 회화",
  "듣기",
  "비즈니스",
  "여행",
  "표현 & 문법",
];

export const lessons: Lesson[] = [
  {
    id: "small-talk",
    title: "어색한 침묵은 이제 그만, 스몰토크 시작하기",
    subtitle: "A little conversation goes a long way.",
    category: "일상 회화",
    level: "A2 · 초급",
    duration: "5 min",
    creator: "Mora Daily",
    initial: "D",
    color: "peach",
    headline: ["Hello,", "small talk."],
    caption: "일상 속 대화의 첫 문장",
    phrases: [
      { english: "How has your day been?", korean: "오늘 하루 어땠어요?" },
      {
        english: "Do you have any plans for the weekend?",
        korean: "주말에 무슨 계획 있어요?",
      },
      {
        english: "It was lovely talking to you.",
        korean: "이야기 나눠서 즐거웠어요.",
      },
    ],
  },
  {
    id: "coffee",
    title: "해외 카페에서 내 취향대로 주문하는 영어",
    subtitle: "Your coffee. Your way.",
    category: "여행",
    level: "A1 · 입문",
    duration: "4 min",
    creator: "Mora Around",
    initial: "A",
    color: "olive",
    headline: ["One coffee,", "please."],
    caption: "카페에서 바로 쓰는 영어",
    phrases: [
      {
        english: "Could I get an iced latte, please?",
        korean: "아이스 라테 한 잔 주시겠어요?",
      },
      {
        english: "Can I have it with oat milk?",
        korean: "오트 밀크로 바꿔 주실 수 있나요?",
      },
      { english: "To go, please.", korean: "포장해 주세요." },
    ],
  },
  {
    id: "meeting",
    title: "회의에서 자신 있게 의견을 말하는 3가지 표현",
    subtitle: "Make yourself heard.",
    category: "비즈니스",
    level: "B1 · 중급",
    duration: "6 min",
    creator: "Mora Work",
    initial: "W",
    color: "lavender",
    headline: ["Speak up.", "Stand out."],
    caption: "나의 생각을 전하는 법",
    phrases: [
      {
        english: "I'd like to suggest a different approach.",
        korean: "다른 접근 방법을 제안하고 싶어요.",
      },
      {
        english: "Could you walk me through that?",
        korean: "그 부분을 차근차근 설명해 주실 수 있나요?",
      },
      {
        english: "Let's take a step back.",
        korean: "한 걸음 물러나서 생각해 봅시다.",
      },
    ],
  },
  {
    id: "listening",
    title: "영어가 들리기 시작하는 순간: 연결되는 소리",
    subtitle: "Listen a little closer.",
    category: "듣기",
    level: "A2 · 초급",
    duration: "7 min",
    creator: "Mora Sounds",
    initial: "S",
    color: "blue",
    headline: ["Tune in.", "Listen closer."],
    caption: "문장으로 익히는 영어의 리듬",
    phrases: [
      { english: "What are you up to?", korean: "뭐 하고 있어요?" },
      { english: "I'm going to head out.", korean: "저는 이제 나갈 거예요." },
      {
        english: "Let me know when you're ready.",
        korean: "준비되면 알려 주세요.",
      },
    ],
  },
  {
    id: "feelings",
    title: "I'm fine 말고, 진짜 내 기분을 말해 볼까요?",
    subtitle: "Find the words for how you feel.",
    category: "일상 회화",
    level: "A2 · 초급",
    duration: "5 min",
    creator: "Mora Daily",
    initial: "D",
    color: "pink",
    headline: ["More than", "“I'm fine.”"],
    caption: "마음을 표현하는 작은 단어들",
    phrases: [
      {
        english: "I'm feeling a bit overwhelmed.",
        korean: "조금 벅찬 기분이에요.",
      },
      {
        english: "That really made my day.",
        korean: "그 덕분에 정말 기분이 좋아졌어요.",
      },
      { english: "I'm looking forward to it.", korean: "기대하고 있어요." },
    ],
  },
  {
    id: "grammar",
    title: "현재완료, 어려운 공식 대신 나의 경험으로",
    subtitle: "Your stories, in a new tense.",
    category: "표현 & 문법",
    level: "B1 · 중급",
    duration: "6 min",
    creator: "Mora Basics",
    initial: "B",
    color: "yellow",
    headline: ["Have you", "ever…?"],
    caption: "경험을 나누는 가장 쉬운 방법",
    phrases: [
      {
        english: "Have you ever been to London?",
        korean: "런던에 가 본 적 있나요?",
      },
      {
        english: "I've always wanted to try that.",
        korean: "늘 그걸 해 보고 싶었어요.",
      },
      {
        english: "I haven't had a chance yet.",
        korean: "아직 기회가 없었어요.",
      },
    ],
  },
  {
    id: "airport",
    title: "공항에서 당황하지 않는 여행 영어",
    subtitle: "Ready for your next adventure.",
    category: "여행",
    level: "A1 · 입문",
    duration: "5 min",
    creator: "Mora Around",
    initial: "A",
    color: "blue",
    headline: ["Next stop:", "anywhere."],
    caption: "출발부터 도착까지",
    phrases: [
      {
        english: "Where is the check-in counter?",
        korean: "체크인 카운터가 어디인가요?",
      },
      {
        english: "Could I have a window seat?",
        korean: "창가 자리로 주실 수 있나요?",
      },
      {
        english: "Which gate should I go to?",
        korean: "어느 게이트로 가야 하나요?",
      },
    ],
  },
  {
    id: "email",
    title: "짧고 명확하게, 업무 이메일의 첫 문장",
    subtitle: "Less hesitation. Better emails.",
    category: "비즈니스",
    level: "B1 · 중급",
    duration: "4 min",
    creator: "Mora Work",
    initial: "W",
    color: "olive",
    headline: ["You've got", "better mail."],
    caption: "메일을 시작하는 자신감",
    phrases: [
      {
        english: "I'm writing to follow up on our conversation.",
        korean: "우리가 나눈 대화에 이어 연락드려요.",
      },
      {
        english: "Please find the document attached.",
        korean: "첨부된 문서를 확인해 주세요.",
      },
      {
        english: "I look forward to hearing from you.",
        korean: "답변 기다리겠습니다.",
      },
    ],
  },
];
