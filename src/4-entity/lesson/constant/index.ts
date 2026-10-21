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
      {
        english: "How has your day been?",
        korean: "오늘 하루 어땠어요?",
      },
      {
        english: "Do you have any plans for the weekend?",
        korean: "주말에 무슨 계획 있어요?",
      },
      {
        english: "It was lovely talking to you.",
        korean: "이야기 나눠서 즐거웠어요.",
      },
      {
        english: "How was your weekend?",
        korean: "주말 어떻게 보내셨어요?",
      },
      {
        english: "I tried a new café near my place.",
        korean: "집 근처 새 카페에 가 봤어요.",
      },
    ],
    goal: "처음 만난 사람에게 질문하고 자연스럽게 대화를 마무리할 수 있어요.",
    scenario:
      "월요일 아침, 공유 오피스의 주방에서 처음 만난 동료와 커피를 기다립니다.",
    tip: "질문 뒤에는 내 이야기도 한 문장 덧붙여 보세요. 상대가 답할 여유를 주면 대화가 자연스럽게 이어집니다.",
    vocabulary: [
      {
        word: "small talk",
        meaning: "가볍게 나누는 일상 대화",
      },
      {
        word: "catch up",
        meaning: "그동안의 이야기를 나누다",
      },
      {
        word: "weekend plans",
        meaning: "주말 계획",
      },
    ],
    dialogue: [
      {
        speaker: "Alex",
        english: "How was your weekend?",
        korean: "주말 어떻게 보내셨어요?",
      },
      {
        speaker: "Jin",
        english: "Pretty good. I tried a new café near my place.",
        korean: "꽤 좋았어요. 집 근처 새 카페에 가 봤어요.",
      },
      {
        speaker: "Alex",
        english: "That sounds nice. Do you have any plans for next weekend?",
        korean: "좋았겠네요. 다음 주말에는 무슨 계획 있어요?",
      },
      {
        speaker: "Jin",
        english: "Not yet. Do you have any recommendations?",
        korean: "아직요. 추천해 주실 만한 게 있나요?",
      },
    ],
    quiz: {
      question: "처음 만난 동료에게 주말 이야기를 시작하려면?",
      options: [
        "How was your weekend?",
        "What time does the meeting start?",
        "How long is your lunch break?",
      ],
      answer: 0,
      explanation:
        "How was your weekend?는 부담 없이 일상 이야기를 시작하는 질문입니다.",
    },
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
      {
        english: "To go, please.",
        korean: "포장해 주세요.",
      },
      {
        english: "Could you make it decaf?",
        korean: "디카페인으로 만들어 주시겠어요?",
      },
      {
        english: "That's all, thank you.",
        korean: "이게 전부예요. 감사합니다.",
      },
    ],
    goal: "음료 종류·우유·포장 여부를 원하는 대로 주문할 수 있어요.",
    scenario:
      "뉴욕의 작은 카페에서 우유 대신 오트 밀크를 넣은 아이스 라테를 포장 주문합니다.",
    tip: "Could I get…? 뒤에 음료 이름을 붙이면 정중한 주문이 됩니다. 우유를 바꿀 때는 with oat milk를 덧붙여 보세요.",
    vocabulary: [
      {
        word: "oat milk",
        meaning: "오트 밀크",
      },
      {
        word: "to go",
        meaning: "포장해서",
      },
      {
        word: "decaf",
        meaning: "카페인을 제거한",
      },
    ],
    dialogue: [
      {
        speaker: "Barista",
        english: "Hi! What can I get for you?",
        korean: "안녕하세요! 무엇을 드릴까요?",
      },
      {
        speaker: "You",
        english: "Could I get an iced latte with oat milk, please?",
        korean: "오트 밀크를 넣은 아이스 라테 한 잔 주시겠어요?",
      },
      {
        speaker: "Barista",
        english: "Of course. For here or to go?",
        korean: "물론이죠. 매장에서 드시나요, 포장하시나요?",
      },
      {
        speaker: "You",
        english: "To go, please. That's all, thank you.",
        korean: "포장해 주세요. 이게 전부예요. 감사합니다.",
      },
    ],
    quiz: {
      question: "음료를 포장해 달라고 말하려면?",
      options: [
        "For here, please.",
        "To go, please.",
        "With oat milk, please.",
      ],
      answer: 1,
      explanation:
        "To go는 포장, for here는 매장에서 먹거나 마신다는 뜻입니다.",
    },
  },
  {
    id: "meeting",
    title: "회의에서 자신 있게 의견을 말하는 5가지 표현",
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
      {
        english: "I see your point, but we may need more time.",
        korean: "무슨 말씀인지 알겠지만 시간이 더 필요할 수 있어요.",
      },
      {
        english: "What if we start with a smaller scope?",
        korean: "더 작은 범위로 시작하면 어떨까요?",
      },
    ],
    goal: "회의에서 다른 의견을 정중히 제안하고 추가 설명을 요청할 수 있어요.",
    scenario:
      "제품 출시 회의에서 일정이 촉박하다고 생각해 더 작은 범위로 먼저 시작하자고 제안합니다.",
    tip: "반대 의견을 바로 단정하기보다 I see your point를 먼저 말하면 상대의 의견을 존중하면서 대안을 제안할 수 있어요.",
    vocabulary: [
      {
        word: "approach",
        meaning: "접근 방법",
      },
      {
        word: "walk someone through",
        meaning: "차근차근 설명하다",
      },
      {
        word: "scope",
        meaning: "업무나 프로젝트의 범위",
      },
    ],
    dialogue: [
      {
        speaker: "Mina",
        english: "Let's launch all the features next Friday.",
        korean: "다음 주 금요일에 모든 기능을 출시합시다.",
      },
      {
        speaker: "You",
        english: "I see your point, but we may need more time.",
        korean: "무슨 말씀인지 알겠지만 시간이 더 필요할 수 있어요.",
      },
      {
        speaker: "Mina",
        english: "What would you suggest?",
        korean: "어떤 방법을 제안하시겠어요?",
      },
      {
        speaker: "You",
        english: "What if we start with a smaller scope?",
        korean: "더 작은 범위로 시작하면 어떨까요?",
      },
    ],
    quiz: {
      question: "동료에게 과정을 차근차근 설명해 달라고 요청하려면?",
      options: [
        "Could we move on to the next item?",
        "Could we take a short break?",
        "Could you walk me through that?",
      ],
      answer: 2,
      explanation:
        "walk someone through는 어떤 과정이나 내용을 단계별로 설명한다는 뜻입니다.",
    },
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
      {
        english: "What are you up to?",
        korean: "뭐 하고 있어요?",
      },
      {
        english: "I'm going to head out.",
        korean: "저는 이제 나갈 거예요.",
      },
      {
        english: "Let me know when you're ready.",
        korean: "준비되면 알려 주세요.",
      },
      {
        english: "Do you want to grab a bite?",
        korean: "간단히 뭐 좀 먹을래요?",
      },
      {
        english: "I'll be there in a minute.",
        korean: "금방 갈게요.",
      },
    ],
    goal: "빠른 일상 대화에서 단어가 연결되는 부분을 문장 단위로 익힐 수 있어요.",
    scenario:
      "친구의 음성 메시지를 듣고 지금 무엇을 하는지, 언제 만날지 확인합니다.",
    tip: "단어마다 끊어 읽지 말고 let me know / when you’re ready처럼 의미 단위로 따라 읽어 보세요. 기기 음성은 실제 대화의 모든 축약 발음을 재현하지 않을 수 있습니다.",
    vocabulary: [
      {
        word: "head out",
        meaning: "밖으로 나가다, 출발하다",
      },
      {
        word: "up to",
        meaning: "무엇을 하고 있는",
      },
      {
        word: "ready",
        meaning: "준비된",
      },
    ],
    dialogue: [
      {
        speaker: "Sam",
        english: "What are you up to?",
        korean: "뭐 하고 있어요?",
      },
      {
        speaker: "You",
        english: "I'm finishing some work.",
        korean: "일을 조금 마무리하고 있어요.",
      },
      {
        speaker: "Sam",
        english: "Do you want to grab a bite?",
        korean: "간단히 뭐 좀 먹을래요?",
      },
      {
        speaker: "You",
        english: "Sure. I'll be there in a minute.",
        korean: "좋아요. 금방 갈게요.",
      },
    ],
    quiz: {
      question: "친구가 I’m going to head out이라고 하면?",
      options: [
        "조금 더 여기에 머무른다.",
        "이제 출발하려 한다.",
        "일을 계속할 것이다.",
      ],
      answer: 1,
      explanation:
        "head out은 밖으로 나가거나 어떤 곳을 향해 출발한다는 표현입니다.",
    },
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
      {
        english: "I'm looking forward to it.",
        korean: "기대하고 있어요.",
      },
      {
        english: "I'm relieved that it's over.",
        korean: "끝나서 안심이에요.",
      },
      {
        english: "I'm a bit tired, but I'm doing okay.",
        korean: "조금 피곤하지만 괜찮아요.",
      },
    ],
    goal: "기분을 구체적으로 설명하고 상대의 좋은 소식에 반응할 수 있어요.",
    scenario:
      "바쁜 하루를 보낸 뒤 친구에게 피곤한 마음과 기대 중인 주말 약속을 이야기합니다.",
    tip: "a bit은 감정을 조금 부드럽게 전달해요. I’m a bit tired처럼 부담 없이 현재 상태를 설명해 보세요.",
    vocabulary: [
      {
        word: "overwhelmed",
        meaning: "할 일이 많아 벅찬",
      },
      {
        word: "relieved",
        meaning: "안도하는",
      },
      {
        word: "look forward to",
        meaning: "기대하다",
      },
    ],
    dialogue: [
      {
        speaker: "Friend",
        english: "How are you feeling today?",
        korean: "오늘 기분이 어때요?",
      },
      {
        speaker: "You",
        english: "I'm feeling a bit overwhelmed.",
        korean: "조금 벅찬 기분이에요.",
      },
      {
        speaker: "Friend",
        english: "Let's take a break this weekend.",
        korean: "이번 주말에 좀 쉬어요.",
      },
      {
        speaker: "You",
        english: "That sounds great. I'm looking forward to it.",
        korean: "정말 좋네요. 기대하고 있어요.",
      },
    ],
    quiz: {
      question: "힘든 일이 끝나서 안도할 때 어울리는 표현은?",
      options: ["I'm confused.", "I'm bored.", "I'm relieved."],
      answer: 2,
      explanation: "relieved는 걱정이나 부담이 사라져 안도하는 감정입니다.",
    },
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
      {
        english: "I've never tried surfing.",
        korean: "서핑을 해 본 적이 없어요.",
      },
      {
        english: "I've visited London twice.",
        korean: "런던에 두 번 가 봤어요.",
      },
    ],
    goal: "Have you ever…?로 경험을 묻고 아직 해 보지 않은 일을 말할 수 있어요.",
    scenario:
      "새 친구와 여행 경험을 나누며 서로 가 보고 싶은 도시를 이야기합니다.",
    tip: "경험 자체는 Have you ever…?로 묻고, 특정 시점의 이야기는 When did you go?처럼 과거형으로 이어 가세요.",
    vocabulary: [
      {
        word: "ever",
        meaning: "지금까지 한 번이라도",
      },
      {
        word: "yet",
        meaning: "아직, 벌써",
      },
      {
        word: "a chance to",
        meaning: "~할 기회",
      },
    ],
    dialogue: [
      {
        speaker: "You",
        english: "Have you ever been to London?",
        korean: "런던에 가 본 적 있나요?",
      },
      {
        speaker: "Friend",
        english: "Yes, I've visited London twice.",
        korean: "네, 런던에 두 번 가 봤어요.",
      },
      {
        speaker: "You",
        english: "When did you go?",
        korean: "언제 갔어요?",
      },
      {
        speaker: "Friend",
        english: "Last summer. Have you been there?",
        korean: "지난여름이요. 가 본 적 있어요?",
      },
    ],
    quiz: {
      question: "아직 기회가 없었다고 말하려면?",
      options: [
        "I had a chance yesterday.",
        "I haven't had a chance yet.",
        "I'd like another chance.",
      ],
      answer: 1,
      explanation:
        "현재까지 경험이 없음을 haven’t had로, 아직이라는 의미를 yet으로 표현합니다.",
    },
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
      {
        english: "Is this bag included in my allowance?",
        korean: "이 가방은 제 수하물 허용량에 포함되나요?",
      },
      {
        english: "What time does boarding start?",
        korean: "탑승은 몇 시에 시작하나요?",
      },
    ],
    goal: "체크인 위치와 탑승구를 묻고 원하는 좌석을 요청할 수 있어요.",
    scenario:
      "첫 해외여행을 떠나며 공항에서 체크인하고 위탁 수하물 규정을 확인합니다.",
    tip: "탑승구는 변경될 수 있어요. 실제 여행에서는 안내 화면과 항공사 공지를 함께 확인하세요. 이 레슨은 질문 표현을 연습합니다.",
    vocabulary: [
      {
        word: "check-in counter",
        meaning: "탑승 수속 카운터",
      },
      {
        word: "boarding pass",
        meaning: "탑승권",
      },
      {
        word: "checked bag",
        meaning: "위탁 수하물",
      },
    ],
    dialogue: [
      {
        speaker: "Agent",
        english: "May I see your passport, please?",
        korean: "여권을 보여 주시겠어요?",
      },
      {
        speaker: "You",
        english: "Here you go. Could I have a window seat?",
        korean: "여기 있습니다. 창가 자리로 주실 수 있나요?",
      },
      {
        speaker: "Agent",
        english: "Of course. Here is your boarding pass.",
        korean: "물론이죠. 여기 탑승권입니다.",
      },
      {
        speaker: "You",
        english: "Thank you. What time does boarding start?",
        korean: "감사합니다. 탑승은 몇 시에 시작하나요?",
      },
    ],
    quiz: {
      question: "탑승권에 해당하는 영어는?",
      options: ["boarding pass", "window seat", "checked bag"],
      answer: 0,
      explanation:
        "boarding pass는 탑승권, window seat는 창가 좌석, checked bag은 위탁 수하물입니다.",
    },
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
      {
        english: "Could you share your feedback by Friday?",
        korean: "금요일까지 의견을 보내 주실 수 있나요?",
      },
      {
        english: "Please let me know if you have any questions.",
        korean: "궁금한 점이 있으면 알려 주세요.",
      },
    ],
    goal: "이메일의 목적·첨부파일·답변 요청을 간결하게 전달할 수 있어요.",
    scenario:
      "고객과의 미팅 후 논의한 제안서를 이메일로 보내고 금요일까지 검토를 부탁합니다.",
    tip: "요청할 때는 무엇을 언제까지 원하는지 함께 적으세요. by Friday는 금요일까지라는 마감 표현입니다.",
    vocabulary: [
      {
        word: "follow up on",
        meaning: "후속으로 확인하다",
      },
      {
        word: "attached",
        meaning: "첨부된",
      },
      {
        word: "review",
        meaning: "검토하다",
      },
    ],
    dialogue: [
      {
        speaker: "Sender",
        english: "I'm writing to follow up on our conversation.",
        korean: "앞서 나눈 대화에 이어 연락드립니다.",
      },
      {
        speaker: "Sender",
        english: "Please find the proposal attached.",
        korean: "첨부된 제안서를 확인해 주세요.",
      },
      {
        speaker: "Sender",
        english: "Could you share your feedback by Friday?",
        korean: "금요일까지 의견을 보내 주실 수 있나요?",
      },
      {
        speaker: "Recipient",
        english: "Thank you. I'll review it and get back to you.",
        korean: "감사합니다. 검토 후 회신드리겠습니다.",
      },
    ],
    quiz: {
      question: "첨부된 파일을 확인해 달라고 요청하는 문장은?",
      options: [
        "Could you send me the document?",
        "I'll attach it in my next email.",
        "Please find the document attached.",
      ],
      answer: 2,
      explanation:
        "Please find … attached는 첨부파일을 안내할 때 쓰는 표현입니다.",
    },
  },
  {
    id: "weekend",
    title: "약속 잡기부터 일정 바꾸기까지, 주말 계획 영어",
    subtitle: "Make time for a good conversation.",
    category: "일상 회화",
    level: "A2 · 초급",
    duration: "5 min",
    creator: "Mora Daily",
    initial: "D",
    color: "yellow",
    headline: ["Got plans?", "Let’s meet."],
    caption: "부담 없이 약속을 제안하는 법",
    goal: "만날 시간과 장소를 정하고 일정 변경을 정중하게 요청할 수 있어요.",
    scenario:
      "친구와 토요일 점심 약속을 잡다가 갑자기 일정이 생겨 시간을 바꿉니다.",
    tip: "Does … work for you?는 시간이나 장소가 괜찮은지 확인하는 표현이에요. 상대가 편한 대안을 고를 수 있도록 제안하세요.",
    vocabulary: [
      {
        word: "available",
        meaning: "시간이 되는",
      },
      {
        word: "reschedule",
        meaning: "일정을 다시 잡다",
      },
      {
        word: "work for you",
        meaning: "일정이나 조건이 괜찮다",
      },
    ],
    phrases: [
      {
        english: "Are you free this Saturday?",
        korean: "이번 토요일에 시간 있어요?",
      },
      {
        english: "Would you like to grab lunch?",
        korean: "같이 점심 먹을래요?",
      },
      {
        english: "Does noon work for you?",
        korean: "정오가 괜찮으세요?",
      },
      {
        english: "Could we reschedule for Sunday?",
        korean: "일요일로 약속을 바꿀 수 있을까요?",
      },
      {
        english: "Let's meet outside the station.",
        korean: "역 밖에서 만나요.",
      },
    ],
    dialogue: [
      {
        speaker: "You",
        english: "Are you free this Saturday?",
        korean: "이번 토요일에 시간 있어요?",
      },
      {
        speaker: "Friend",
        english: "Yes. Would you like to grab lunch?",
        korean: "네. 같이 점심 먹을래요?",
      },
      {
        speaker: "You",
        english: "That sounds great. Does noon work for you?",
        korean: "좋아요. 정오가 괜찮으세요?",
      },
      {
        speaker: "Friend",
        english: "Perfect. Let's meet outside the station.",
        korean: "좋아요. 역 밖에서 만나요.",
      },
    ],
    quiz: {
      question: "약속 시간을 바꾸고 싶을 때 사용할 표현은?",
      options: [
        "Could we reschedule?",
        "Are you free tomorrow?",
        "Where should we meet?",
      ],
      answer: 0,
      explanation: "reschedule은 이미 정한 일정을 다시 잡는다는 뜻입니다.",
    },
  },
  {
    id: "hotel",
    title: "호텔 체크인: 예약 확인부터 필요한 것 요청하기",
    subtitle: "Feel at home, away from home.",
    category: "여행",
    level: "A1 · 입문",
    duration: "5 min",
    creator: "Mora Around",
    initial: "A",
    color: "peach",
    headline: ["Check in.", "Settle in."],
    caption: "편안한 여행을 위한 호텔 영어",
    goal: "예약자 이름을 말하고 조식 시간과 추가 수건을 요청할 수 있어요.",
    scenario:
      "늦은 저녁 호텔에 도착해 예약을 확인하고 다음 날 조식 시간을 묻습니다.",
    tip: "예약자 이름을 말할 때 under the name …을 사용해요. 요금이나 제공 서비스는 호텔마다 다르므로 질문으로 확인하세요.",
    vocabulary: [
      {
        word: "reservation",
        meaning: "예약",
      },
      {
        word: "under the name",
        meaning: "~라는 이름으로",
      },
      {
        word: "extra towels",
        meaning: "추가 수건",
      },
    ],
    phrases: [
      {
        english: "I have a reservation under the name Kim.",
        korean: "Kim이라는 이름으로 예약했어요.",
      },
      {
        english: "What time is breakfast served?",
        korean: "조식은 몇 시에 제공되나요?",
      },
      {
        english: "Is breakfast included?",
        korean: "조식이 포함되어 있나요?",
      },
      {
        english: "Could I have some extra towels?",
        korean: "수건을 추가로 받을 수 있을까요?",
      },
      {
        english: "What time is check-out?",
        korean: "체크아웃은 몇 시인가요?",
      },
    ],
    dialogue: [
      {
        speaker: "Receptionist",
        english: "Welcome! Do you have a reservation?",
        korean: "어서 오세요! 예약하셨나요?",
      },
      {
        speaker: "You",
        english: "I have a reservation under the name Kim.",
        korean: "Kim이라는 이름으로 예약했어요.",
      },
      {
        speaker: "Receptionist",
        english: "Here is your room key. You're in room 305.",
        korean: "여기 객실 키입니다. 305호예요.",
      },
      {
        speaker: "You",
        english: "Thank you. What time is breakfast served?",
        korean: "감사합니다. 조식은 몇 시에 제공되나요?",
      },
    ],
    quiz: {
      question: "예약자 이름을 알리는 표현은?",
      options: [
        "in room three oh five",
        "under the name Kim",
        "at nine in the morning",
      ],
      answer: 1,
      explanation: "예약자 이름은 under the name 뒤에 붙여 말합니다.",
    },
  },
  {
    id: "deadline",
    title: "일정 조율과 진행 상황 공유를 위한 업무 영어",
    subtitle: "Keep everyone on the same page.",
    category: "비즈니스",
    level: "B1 · 중급",
    duration: "6 min",
    creator: "Mora Work",
    initial: "W",
    color: "blue",
    headline: ["On track.", "In sync."],
    caption: "마감과 진행 상황을 명확하게",
    goal: "진행 상태를 설명하고 필요한 시간이나 도움을 구체적으로 요청할 수 있어요.",
    scenario:
      "디자인 검토가 늦어져 팀에 상황을 알리고 마감 하루 연장을 요청합니다.",
    tip: "일정 변경을 요청할 때 이유와 새로운 마감을 함께 제안하세요. by Thursday는 목요일까지라는 뜻입니다.",
    vocabulary: [
      {
        word: "on track",
        meaning: "계획대로 진행 중인",
      },
      {
        word: "deadline",
        meaning: "마감",
      },
      {
        word: "extend",
        meaning: "연장하다",
      },
    ],
    phrases: [
      {
        english: "We're on track to finish by Thursday.",
        korean: "목요일까지 마칠 수 있도록 계획대로 진행 중이에요.",
      },
      {
        english: "I'm waiting for the final review.",
        korean: "최종 검토를 기다리고 있어요.",
      },
      {
        english: "Could we extend the deadline by one day?",
        korean: "마감을 하루 연장할 수 있을까요?",
      },
      {
        english: "I'll send you an update this afternoon.",
        korean: "오늘 오후에 진행 상황을 공유하겠습니다.",
      },
      {
        english: "Is there anything I can help with?",
        korean: "제가 도울 수 있는 일이 있을까요?",
      },
    ],
    dialogue: [
      {
        speaker: "Lead",
        english: "How is the project going?",
        korean: "프로젝트는 어떻게 진행되고 있나요?",
      },
      {
        speaker: "You",
        english: "I'm waiting for the final review.",
        korean: "최종 검토를 기다리고 있어요.",
      },
      {
        speaker: "You",
        english: "Could we extend the deadline by one day?",
        korean: "마감을 하루 연장할 수 있을까요?",
      },
      {
        speaker: "Lead",
        english: "Yes. Please send me an update this afternoon.",
        korean: "네. 오늘 오후에 진행 상황을 알려 주세요.",
      },
    ],
    quiz: {
      question: "마감을 하루 연장해 달라는 문장은?",
      options: [
        "Could we keep the original deadline?",
        "Could we move the deadline forward by one day?",
        "Could we extend the deadline by one day?",
      ],
      answer: 2,
      explanation:
        "extend the deadline은 마감을 연장하다, by one day는 하루만큼이라는 의미입니다.",
    },
  },
  {
    id: "numbers",
    title: "fifteen과 fifty, 시간과 숫자를 정확히 확인하기",
    subtitle: "Hear the detail. Get it right.",
    category: "듣기",
    level: "A1 · 입문",
    duration: "4 min",
    creator: "Mora Sounds",
    initial: "S",
    color: "yellow",
    headline: ["Fifteen?", "Or fifty?"],
    caption: "헷갈리면 다시 확인하는 숫자 영어",
    goal: "들은 숫자와 시간을 되물어 잘못 이해한 내용을 바로잡을 수 있어요.",
    scenario:
      "전화로 예약 시간을 듣다가 fifteen과 fifty가 헷갈려 다시 확인합니다.",
    tip: "못 들었다면 추측하기보다 Did you say…?로 확인하세요. 음성의 강세를 듣고 숫자를 직접 따라 읽어 보세요.",
    vocabulary: [
      {
        word: "fifteen",
        meaning: "15",
      },
      {
        word: "fifty",
        meaning: "50",
      },
      {
        word: "half past",
        meaning: "~시 30분",
      },
    ],
    phrases: [
      {
        english: "Did you say fifteen or fifty?",
        korean: "15라고 하셨나요, 50이라고 하셨나요?",
      },
      {
        english: "Could you say that again?",
        korean: "다시 말씀해 주시겠어요?",
      },
      {
        english: "The appointment is at half past two.",
        korean: "예약은 두 시 반입니다.",
      },
      {
        english: "That's two thirty, right?",
        korean: "두 시 삼십 분이라는 말씀이죠?",
      },
      {
        english: "Let me write that down.",
        korean: "그걸 적어 둘게요.",
      },
    ],
    dialogue: [
      {
        speaker: "Staff",
        english: "Your appointment is at two fifteen.",
        korean: "예약은 두 시 십오 분입니다.",
      },
      {
        speaker: "You",
        english: "Did you say two fifteen or two fifty?",
        korean: "두 시 십오 분인가요, 두 시 오십 분인가요?",
      },
      {
        speaker: "Staff",
        english: "Two fifteen. A quarter past two.",
        korean: "두 시 십오 분이요. 두 시에서 15분 지난 시간이에요.",
      },
      {
        speaker: "You",
        english: "Got it. Let me write that down.",
        korean: "알겠습니다. 적어 둘게요.",
      },
    ],
    quiz: {
      question: "half past two는 몇 시인가요?",
      options: ["2시 15분", "2시 30분", "2시 50분"],
      answer: 1,
      explanation: "half past는 정각에서 30분 지난 시간입니다.",
    },
  },
  {
    id: "clarify",
    title: "못 알아들었을 때 대화를 이어 가는 확인 표현",
    subtitle: "It’s okay to ask again.",
    category: "듣기",
    level: "A2 · 초급",
    duration: "4 min",
    creator: "Mora Sounds",
    initial: "S",
    color: "lavender",
    headline: ["Say that", "again?"],
    caption: "이해한 척하지 않아도 괜찮아요",
    goal: "다시 말하기·천천히 말하기를 요청하고 이해한 내용을 확인할 수 있어요.",
    scenario: "온라인 통화에서 상대방의 말이 빨라 중요한 내용을 놓쳤습니다.",
    tip: "I didn’t catch that은 상대를 탓하지 않고 못 들었다고 말하는 자연스러운 표현이에요.",
    vocabulary: [
      {
        word: "catch",
        meaning: "말을 알아듣다",
      },
      {
        word: "mean",
        meaning: "뜻하다",
      },
      {
        word: "a little more slowly",
        meaning: "조금 더 천천히",
      },
    ],
    phrases: [
      {
        english: "Sorry, I didn't catch that.",
        korean: "죄송해요. 잘 못 들었어요.",
      },
      {
        english: "Could you speak a little more slowly?",
        korean: "조금 더 천천히 말씀해 주시겠어요?",
      },
      {
        english: "What do you mean by that?",
        korean: "그게 무슨 뜻인가요?",
      },
      {
        english: "Do you mean the meeting is tomorrow?",
        korean: "회의가 내일이라는 말씀이신가요?",
      },
      {
        english: "Thanks for explaining.",
        korean: "설명해 주셔서 감사합니다.",
      },
    ],
    dialogue: [
      {
        speaker: "Colleague",
        english: "We're moving the meeting to tomorrow.",
        korean: "회의를 내일로 옮길 거예요.",
      },
      {
        speaker: "You",
        english: "Sorry, I didn't catch that.",
        korean: "죄송해요. 잘 못 들었어요.",
      },
      {
        speaker: "Colleague",
        english: "The meeting will be tomorrow, not today.",
        korean: "회의는 오늘이 아니라 내일이에요.",
      },
      {
        speaker: "You",
        english: "Got it. Thanks for explaining.",
        korean: "이해했어요. 설명해 주셔서 감사합니다.",
      },
    ],
    quiz: {
      question: "상대방이 조금 더 천천히 말해 주기를 원한다면?",
      options: [
        "Could you speak a little more slowly?",
        "Could you speak a little louder?",
        "Could you repeat the last word?",
      ],
      answer: 0,
      explanation: "speak more slowly는 더 천천히 말하다라는 뜻입니다.",
    },
  },
  {
    id: "requests",
    title: "Can you와 Could you: 부탁을 부드럽게 만드는 법",
    subtitle: "A little kindness in every request.",
    category: "표현 & 문법",
    level: "A2 · 초급",
    duration: "5 min",
    creator: "Mora Basics",
    initial: "B",
    color: "olive",
    headline: ["Could you,", "please?"],
    caption: "정중한 부탁의 기본 패턴",
    goal: "Could you + 동사로 도움을 요청하고 허락을 구할 수 있어요.",
    scenario:
      "도서관에서 옆 사람에게 콘센트를 사용할 수 있는지 묻고 문을 잡아 달라고 부탁합니다.",
    tip: "Could you…?는 상대의 행동을 부탁하고, Could I…?는 내가 어떤 일을 해도 되는지 허락을 구해요.",
    vocabulary: [
      {
        word: "request",
        meaning: "부탁, 요청",
      },
      {
        word: "outlet",
        meaning: "전기 콘센트",
      },
      {
        word: "hold the door",
        meaning: "문을 잡아 주다",
      },
    ],
    phrases: [
      {
        english: "Could you help me with this?",
        korean: "이것 좀 도와주시겠어요?",
      },
      {
        english: "Could you hold the door, please?",
        korean: "문을 잡아 주시겠어요?",
      },
      {
        english: "Could I use this outlet?",
        korean: "이 콘센트를 사용해도 될까요?",
      },
      {
        english: "Would you mind moving your bag?",
        korean: "가방을 옮겨 주실 수 있을까요?",
      },
      {
        english: "Thank you. I really appreciate it.",
        korean: "감사합니다. 정말 큰 도움이 됐어요.",
      },
    ],
    dialogue: [
      {
        speaker: "You",
        english: "Excuse me. Could I use this outlet?",
        korean: "실례합니다. 이 콘센트를 사용해도 될까요?",
      },
      {
        speaker: "Student",
        english: "Of course. Let me move my bag.",
        korean: "물론이죠. 제 가방을 옮길게요.",
      },
      {
        speaker: "You",
        english: "Thank you. I really appreciate it.",
        korean: "감사합니다. 정말 큰 도움이 됐어요.",
      },
      {
        speaker: "Student",
        english: "You're welcome.",
        korean: "천만에요.",
      },
    ],
    quiz: {
      question: "내가 창문을 열어도 되는지 허락을 구하려면?",
      options: [
        "Could I open the window?",
        "Could you open the window?",
        "Would you close the window?",
      ],
      answer: 0,
      explanation:
        "Could I…?는 내가 해도 되는지, Could you…?는 상대가 해 줄 수 있는지 묻습니다.",
    },
  },
  {
    id: "time-prepositions",
    title: "at, on, in: 약속 시간을 말할 때 쓰는 전치사",
    subtitle: "Right time. Right words.",
    category: "표현 & 문법",
    level: "A1 · 입문",
    duration: "4 min",
    creator: "Mora Basics",
    initial: "B",
    color: "pink",
    headline: ["At nine.", "On Monday."],
    caption: "시간 표현에 꼭 필요한 세 단어",
    goal: "시각·요일·월에 알맞은 전치사를 붙여 일정을 설명할 수 있어요.",
    scenario:
      "다음 달 시작하는 스터디 일정을 친구에게 설명하고 월요일 저녁 약속을 확인합니다.",
    tip: "구체적인 시각에는 at, 요일·날짜에는 on, 월·연도·대부분의 시간대에는 in을 써요. at night 같은 예외도 함께 익혀 보세요.",
    vocabulary: [
      {
        word: "at nine",
        meaning: "9시에",
      },
      {
        word: "on Monday",
        meaning: "월요일에",
      },
      {
        word: "in November",
        meaning: "11월에",
      },
    ],
    phrases: [
      {
        english: "The class starts at nine.",
        korean: "수업은 9시에 시작해요.",
      },
      {
        english: "Let's meet on Monday.",
        korean: "월요일에 만나요.",
      },
      {
        english: "The course begins in November.",
        korean: "과정은 11월에 시작해요.",
      },
      {
        english: "I usually study in the evening.",
        korean: "저는 보통 저녁에 공부해요.",
      },
      {
        english: "I'm available on Friday afternoon.",
        korean: "금요일 오후에 시간이 돼요.",
      },
    ],
    dialogue: [
      {
        speaker: "Friend",
        english: "When does the course begin?",
        korean: "과정이 언제 시작하나요?",
      },
      {
        speaker: "You",
        english: "It begins in November.",
        korean: "11월에 시작해요.",
      },
      {
        speaker: "Friend",
        english: "What time is the first class?",
        korean: "첫 수업은 몇 시인가요?",
      },
      {
        speaker: "You",
        english: "It's at nine on Monday.",
        korean: "월요일 9시예요.",
      },
    ],
    quiz: {
      question: "요일 Monday 앞에 알맞은 전치사는?",
      options: ["at", "on", "in"],
      answer: 1,
      explanation: "요일과 날짜 앞에는 on을 사용합니다.",
    },
  },
];
