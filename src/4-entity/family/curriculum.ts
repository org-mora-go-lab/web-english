export type PlayTheme = "일상" | "장난감" | "그림책" | "노래·몸짓" | "산책";
export type PlayActivity = { id: string; months: string; theme: PlayTheme; icon: string; title: string; phrase: string; meaning: string; scene: string; steps: string; parentTip: string };
export type AgePeriod = { id: string; label: string; focus: string; cue: string };

export const agePeriods: AgePeriod[] = [
  { id: "prep", label: "16–17개월", focus: "준비: 아이의 관심을 따라가기", cue: "따라 말하기보다 함께 보고 반응해요" },
  { id: "18", label: "18–20개월", focus: "인사·요청과 몸짓", cue: "한 단어를 실물과 연결해요" },
  { id: "21", label: "21–23개월", focus: "행동과 선택", cue: "아이의 움직임에 말로 답해요" },
  { id: "24", label: "24–26개월", focus: "두 낱말과 관심 대상", cue: "짧은 표현으로 넓혀요" },
  { id: "27", label: "27–29개월", focus: "생활 순서와 위치", cue: "익숙한 행동을 연결해요" },
  { id: "30", label: "30–32개월", focus: "질문·비교·차례", cue: "대답을 재촉하지 않아요" },
  { id: "33", label: "33–35개월", focus: "역할놀이와 이야기", cue: "가족과 역할을 바꿔 봐요" },
  { id: "36", label: "36개월", focus: "좋아한 놀이 돌아보기", cue: "시험 대신 즐거웠던 순간을 골라요" },
];

export const playActivities: PlayActivity[] = [
  { id: "hello-wave", months: "prep", theme: "일상", icon: "👋", title: "손 흔들며 인사", phrase: "Hi! Bye!", meaning: "안녕! 또 봐!", scene: "가족을 만날 때", steps: "부모가 먼저 손을 흔들며 한 번 말해요. 아이가 바라보면 잠깐 기다려요.", parentTip: "아이가 따라 하지 않아도 괜찮아요." },
  { id: "more-meal", months: "prep", theme: "일상", icon: "🥣", title: "식사 중 더 주세요", phrase: "More? All done?", meaning: "더 줄까? 다 먹었니?", scene: "식사 중", steps: "아이가 더 먹고 싶어 하는 몸짓을 보이면 짧게 말하고 반응을 기다려요.", parentTip: "먹기나 말하기를 강요하지 않아요." },
  { id: "hello-family", months: "18", theme: "일상", icon: "☀️", title: "아침 인사 한마디", phrase: "Hi! Good morning.", meaning: "안녕! 좋은 아침이야.", scene: "아침에 만날 때", steps: "눈을 맞추고 손을 흔들며 천천히 인사해요.", parentTip: "영어 한 번, 한국어로도 자연스럽게 대화해요." },
  { id: "roll-ball", months: "18", theme: "장난감", icon: "⚽", title: "큰 공 굴리기", phrase: "Roll. Go!", meaning: "굴려. 간다!", scene: "바닥에서 공놀이", steps: "큰 공을 천천히 굴리고 멈출 때 말해요.", parentTip: "삼킬 수 없는 큰 공을 사용해요." },
  { id: "in-out", months: "21", theme: "장난감", icon: "🧺", title: "상자에 넣고 꺼내기", phrase: "In. Out.", meaning: "안으로. 밖으로.", scene: "블록 정리 시간", steps: "큰 블록을 상자에 넣으며 In, 꺼내며 Out이라고 말해요.", parentTip: "아이의 속도에 맞춰 멈춰요." },
  { id: "up-down", months: "21", theme: "노래·몸짓", icon: "🙌", title: "손 올리고 내리기", phrase: "Up! Down!", meaning: "위로! 아래로!", scene: "손동작 놀이", steps: "부모가 손을 먼저 올렸다 내리며 짧게 말해요.", parentTip: "아이가 다른 동작을 고르면 그 동작을 따라가요." },
  { id: "big-ball", months: "24", theme: "장난감", icon: "🟠", title: "큰 공 찾아보기", phrase: "Big ball!", meaning: "큰 공이네!", scene: "장난감 고르기", steps: "아이가 고른 물건을 가리키고 두 낱말로 말해요.", parentTip: "정답 맞히기 놀이로 만들지 않아요." },
  { id: "dog-book", months: "24", theme: "그림책", icon: "📖", title: "책 속 강아지", phrase: "Look! A dog.", meaning: "봐! 강아지야.", scene: "그림책 한 장면", steps: "아이가 가리킨 그림 한 곳만 보고 말해요.", parentTip: "읽는 분량보다 함께 보는 시간이 중요해요." },
  { id: "wash-eat", months: "27", theme: "일상", icon: "🫧", title: "손 씻고 식사", phrase: "Wash hands. Then eat.", meaning: "손 씻고, 그다음 먹자.", scene: "식사 전", steps: "손 씻는 동작과 식사 순서를 보여주며 말해요.", parentTip: "익숙한 순서에만 붙여 보세요." },
  { id: "leaf-walk", months: "27", theme: "산책", icon: "🍃", title: "낙엽 찾아보기", phrase: "Find a leaf!", meaning: "나뭇잎을 찾아보자!", scene: "안전한 산책길", steps: "아이가 먼저 본 나뭇잎을 함께 보고 한마디 해요.", parentTip: "도로에서는 놀이보다 안전을 먼저 챙겨요." },
  { id: "where-cup", months: "30", theme: "일상", icon: "🥛", title: "컵 어디 있지?", phrase: "Where is the cup?", meaning: "컵이 어디 있지?", scene: "식탁 준비", steps: "보이는 컵을 함께 찾되, 답을 기다리기만 해도 좋아요.", parentTip: "대답을 요구하지 말고 직접 보여줘도 돼요." },
  { id: "turn-clap", months: "30", theme: "노래·몸짓", icon: "👏", title: "번갈아 손뼉", phrase: "My turn. Your turn.", meaning: "내 차례. 네 차례.", scene: "짧은 몸짓 놀이", steps: "한 번씩 손뼉 치고 잠깐 멈춰요.", parentTip: "아이가 싫어하면 바로 끝내요." },
  { id: "teddy-hungry", months: "33", theme: "장난감", icon: "🧸", title: "배고픈 곰 인형", phrase: "Teddy is hungry.", meaning: "곰 인형이 배고프대.", scene: "인형 역할놀이", steps: "인형에게 먹이는 흉내를 내며 짧게 말해요.", parentTip: "아이에게 역할을 맡기기보다 먼저 보여줘요." },
  { id: "family-story", months: "33", theme: "그림책", icon: "💛", title: "가족 이야기 만들기", phrase: "Grandma is here!", meaning: "할머니가 왔네!", scene: "사진이나 그림책", steps: "가족과 닮은 장면을 보고 한 문장만 더해요.", parentTip: "실제 가족 이야기로 바꿔도 좋아요." },
  { id: "favorite-five", months: "36", theme: "일상", icon: "✨", title: "좋아한 말 다시 쓰기", phrase: "Again? Let's play!", meaning: "또 할까? 놀자!", scene: "가족이 좋아한 놀이", steps: "기록에서 즐거웠던 표현을 골라 다시 놀아요.", parentTip: "할 수 있는 말의 개수를 시험하지 않아요." },
  { id: "family-show", months: "36", theme: "노래·몸짓", icon: "🎵", title: "가족 손뼉 공연", phrase: "Clap, clap, stop!", meaning: "짝짝, 멈춰!", scene: "가족이 함께할 때", steps: "부모가 먼저 노래하듯 말하고 아이의 반응에 따라 멈춰요.", parentTip: "완성보다 함께 웃은 순간을 기억해요." },
];

export function periodForAge(age: number) { return age < 18 ? "prep" : age >= 36 ? "36" : String(18 + Math.floor((age - 18) / 3) * 3); }
export function activityById(id: string) { return playActivities.find(activity => activity.id === id); }
