"use client";

import {
  ArrowDown,
  ArrowRight,
  Bookmark,
  BookOpen,
  Check,
  CheckCheck,
  ChevronRight,
  Compass,
  GraduationCap,
  History,
  Home,
  Menu,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { CharacterWelcome, LessonPractice } from "@/src/3-feature";
import type { Lesson } from "@/src/4-entity";
import { categories, lessons, useLibrary } from "@/src/4-entity";

const navigation = [
  { name: "홈", icon: Home },
  { name: "둘러보기", icon: Compass },
  { name: "저장한 레슨", icon: Bookmark },
  { name: "최근 학습", icon: History },
  { name: "완료한 레슨", icon: CheckCheck },
];

function subscribeMobile(callback: () => void) {
  const media = window.matchMedia("(max-width: 700px)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
function isMobile() {
  return window.matchMedia("(max-width: 700px)").matches;
}

export function LearningWorkspace() {
  const lessonTrigger = useRef<HTMLElement | null>(null);
  const resultsHeading = useRef<HTMLHeadingElement | null>(null);
  const mobile = useSyncExternalStore(subscribeMobile, isMobile, () => false);
  const [view, setView] = useState("홈");
  const [category, setCategory] = useState("전체");
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("전체");
  const [sort, setSort] = useState("추천순");
  const [sidebar, setSidebar] = useState(false);
  const [selected, setSelected] = useState<Lesson | null>(null);
  const { library, ready, hydrate, update } = useLibrary();
  const [notice, setNotice] = useState("");
  useEffect(() => {
    hydrate();
    function sync(event: StorageEvent) {
      if (event.key === "mora-english-library" || event.key === null) hydrate();
    }
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [hydrate]);
  function updateLibrary(next: typeof library) {
    if (!update(next))
      setNotice("저장 공간을 사용할 수 없어 이번 세션에서만 유지됩니다.");
  }
  function toggleSaved(id: string) {
    updateLibrary({
      ...library,
      saved: library.saved.includes(id)
        ? library.saved.filter((item) => item !== id)
        : [...library.saved, id],
    });
  }
  function openLesson(lesson: Lesson) {
    lessonTrigger.current = document.activeElement as HTMLElement;
    setSelected(lesson);
    updateLibrary({
      ...library,
      history: [lesson.id, ...library.history.filter((id) => id !== lesson.id)],
    });
  }
  function closeLesson() {
    setSelected(null);
    requestAnimationFrame(() => lessonTrigger.current?.focus());
  }
  function navigate(name: string) {
    setView(name);
    setCategory("전체");
    setQuery("");
    setLevel("전체");
    setSidebar(false);
  }
  const visible = (
    view === "최근 학습"
      ? library.history
          .map((id) => lessons.find((lesson) => lesson.id === id)!)
          .filter(Boolean)
      : lessons
  )
    .filter(
      (lesson) =>
        (category === "전체" || lesson.category === category) &&
        (level === "전체" || lesson.level.startsWith(level)) &&
        (view !== "저장한 레슨" || library.saved.includes(lesson.id)) &&
        (view !== "완료한 레슨" || library.completed.includes(lesson.id)) &&
        `${lesson.title} ${lesson.subtitle} ${lesson.category} ${lesson.goal} ${lesson.scenario} ${lesson.headline.join(" ")} ${lesson.vocabulary.map((item) => `${item.word} ${item.meaning}`).join(" ")} ${lesson.phrases.map((phrase) => `${phrase.english} ${phrase.korean}`).join(" ")}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
    )
    .sort((a, b) =>
      sort === "짧은순"
        ? parseInt(a.duration) - parseInt(b.duration)
        : sort === "제목순"
          ? a.title.localeCompare(b.title, "ko")
          : 0,
    );
  const today =
    lessons.find((lesson) => !library.completed.includes(lesson.id)) ||
    lessons[0];
  return (
    <div
      className={`learning-workspace ${sidebar ? "menu-open" : ""}`}
      inert={!ready}
      aria-busy={!ready}
    >
      <a className="skip-link" href="#content">
        본문으로 건너뛰기
      </a>
      <header className="topbar">
        <div className="brand-group">
          <button
            className="icon-button menu-toggle"
            aria-label="메뉴 열기/닫기"
            aria-expanded={mobile ? sidebar : !sidebar}
            onClick={() => setSidebar(!sidebar)}
          >
            <Menu size={22} />
          </button>
          <button
            className="brand"
            aria-label="Mora English 홈"
            onClick={() => navigate("홈")}
          >
            <strong>
              mora<span>english</span>
            </strong>
            <sup>EN</sup>
          </button>
        </div>
        <form
          className="search"
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            resultsHeading.current?.focus();
          }}
        >
          <input
            disabled={!ready}
            aria-label="레슨 검색"
            placeholder="오늘은 어떤 영어를 배워볼까요?"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {query && (
            <button
              type="button"
              aria-label="검색 지우기"
              onClick={() => setQuery("")}
            >
              <X size={16} />
            </button>
          )}
          <button aria-label="검색" type="submit">
            <Search size={21} />
          </button>
        </form>
        <div className="header-right">
          <span className="daily-note">
            <span /> A little, every day
          </span>
          <button
            className="profile"
            aria-label="나의 완료한 레슨"
            title="학습 완료 현황 보기"
            onClick={() => navigate("완료한 레슨")}
          >
            <GraduationCap size={19} />
          </button>
        </div>
      </header>
      {sidebar && (
        <button
          className="menu-backdrop"
          aria-label="메뉴 닫기"
          onClick={() => setSidebar(false)}
        />
      )}
      <aside className="sidebar" inert={mobile ? !sidebar : sidebar}>
        <nav aria-label="주 메뉴">
          {navigation.map(({ name, icon: Icon }, index) => (
            <button
              className={`${view === name ? "active" : ""} ${index === 2 ? "section-start" : ""}`}
              key={name}
              aria-current={view === name ? "page" : undefined}
              onClick={() => navigate(name)}
            >
              <Icon size={20} strokeWidth={view === name ? 2.3 : 1.6} />
              <span>{name}</span>
              {name === "저장한 레슨" && library.saved.length > 0 && (
                <small>{library.saved.length}</small>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-card">
          <span className="mini-spark">
            <Sparkles size={19} />
          </span>
          <strong>작은 습관, 큰 변화</strong>
          <p>
            하루 한 레슨으로
            <br />
            영어와 조금 더 가까이.
          </p>
          <span className="progress-label">
            학습한 레슨{" "}
            <b>
              {library.completed.length} / {lessons.length}
            </b>
          </span>
          <div
            className="progress"
            role="progressbar"
            aria-label="학습 완료 진행률"
            aria-valuemin={0}
            aria-valuemax={lessons.length}
            aria-valuenow={library.completed.length}
          >
            <span
              style={{
                width: `${(library.completed.length / lessons.length) * 100}%`,
              }}
            />
          </div>
        </div>
        <footer>
          <span>mora-go-lab</span>
          <p>Made for your everyday English.</p>
          <span>© {new Date().getFullYear()} Mora English · v1.0.2</span>
        </footer>
      </aside>
      <main id="content" tabIndex={-1}>
        <div className="category-bar" aria-label="레슨 카테고리">
          {categories.map((name) => (
            <button
              key={name}
              className={category === name ? "selected" : ""}
              aria-pressed={category === name}
              onClick={() => setCategory(name)}
            >
              {name}
            </button>
          ))}
        </div>
        {view === "홈" &&
          !query.trim() &&
          category === "전체" &&
          level === "전체" && (
            <section className="hero">
              <div className="hero-copy">
                <span className="eyebrow">
                  <span /> YOUR EVERYDAY ENGLISH
                </span>
                <h1>
                  영어가 일상이 되는
                  <br />
                  <span>작은 시작.</span>
                </h1>
                <p>
                  좋아하는 주제로, 나의 속도로.
                  <br />
                  오늘의 5분이 내일의 자신감이 되도록.
                </p>
                <button onClick={() => openLesson(today)}>
                  오늘의 레슨 시작하기 <ArrowRight size={17} />
                </button>
                <span className="hero-footnote">
                  {today.category} · {today.duration} · 핵심 문장 5개
                </span>
              </div>
              <CharacterWelcome suspended={selected !== null} />
            </section>
          )}
        <section className="lesson-section" aria-label="레슨 목록">
          <div className="section-heading">
            <div>
              <h2 ref={resultsHeading} tabIndex={-1}>
                {query.trim()
                  ? "검색 결과"
                  : view === "홈"
                    ? "오늘, 이런 영어 어때요?"
                    : view === "둘러보기"
                      ? "나에게 맞는 영어 찾기"
                      : view}
              </h2>
              <p>
                {query.trim()
                  ? `“${query}” · ${visible.length}개의 레슨`
                  : view === "홈"
                    ? `학습용 예시 레슨 ${lessons.length}개 · 상황별 핵심 문장 ${lessons.reduce((count, lesson) => count + lesson.phrases.length, 0)}개`
                    : `${visible.length}개의 레슨 · 조금씩, 꾸준히 함께해요.`}
              </p>
            </div>
            <span className="section-hint">
              {view === "홈" ? (
                <>
                  나를 위한 추천 <ArrowDown size={14} />
                </>
              ) : (
                <>
                  <GraduationCap size={17} /> MY ENGLISH JOURNEY
                </>
              )}
            </span>
          </div>
          <div className="lesson-toolbar">
            <span>상황을 이해하고, 문장으로 말해 보세요.</span>
            <div>
              <label>
                난이도
                <select
                  disabled={!ready}
                  aria-label="레슨 난이도"
                  value={level}
                  onChange={(event) => setLevel(event.target.value)}
                >
                  <option value="전체">전체 난이도</option>
                  <option value="A1">A1 · 입문</option>
                  <option value="A2">A2 · 초급</option>
                  <option value="B1">B1 · 중급</option>
                </select>
              </label>
              <label>
                정렬
                <select
                  disabled={!ready}
                  aria-label="레슨 정렬"
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                >
                  <option>추천순</option>
                  <option>짧은순</option>
                  <option>제목순</option>
                </select>
              </label>
              {(category !== "전체" || level !== "전체" || query.trim()) && (
                <button
                  onClick={() => {
                    setCategory("전체");
                    setLevel("전체");
                    setQuery("");
                  }}
                >
                  필터 초기화
                </button>
              )}
            </div>
          </div>
          {visible.length ? (
            <div className="lesson-grid">
              {visible.map((lesson, index) => (
                <article className="lesson-card" key={lesson.id}>
                  <button
                    className={`thumbnail ${lesson.color}`}
                    aria-label={`${lesson.title} 레슨 열기`}
                    onClick={() => openLesson(lesson)}
                  >
                    <span className="thumbnail-label">
                      {lesson.category.toUpperCase()}
                      <span>문장 레슨</span>
                    </span>
                    <span className="thumbnail-headline" lang="en">
                      {lesson.headline.map((line) => (
                        <span key={line}>{line}</span>
                      ))}
                    </span>
                    <span
                      className={`thumbnail-symbol symbol-${index % 4}`}
                      aria-hidden="true"
                    >
                      {["✳", "◔", "↗", "≋"][index % 4]}
                    </span>
                    <span className="thumbnail-caption">{lesson.caption}</span>
                    <span className="duration">{lesson.duration}</span>
                    <span className="hover-play">
                      <BookOpen size={27} />
                    </span>
                    {library.completed.includes(lesson.id) && (
                      <span className="completed-badge">
                        <Check size={12} /> 완료
                      </span>
                    )}
                  </button>
                  <div className="lesson-info">
                    <span className={`creator-avatar ${lesson.color}`}>
                      {lesson.initial}
                    </span>
                    <div>
                      <button
                        className="lesson-title"
                        onClick={() => openLesson(lesson)}
                      >
                        {lesson.title}
                      </button>
                      <p>{lesson.creator}</p>
                      <p className="lesson-goal">{lesson.goal}</p>
                      <span className="lesson-meta">
                        {lesson.level} <span>·</span> 문장{" "}
                        {lesson.phrases.length}개
                      </span>
                    </div>
                    <button
                      className={`save-button ${library.saved.includes(lesson.id) ? "saved" : ""}`}
                      aria-label={`${lesson.title} ${library.saved.includes(lesson.id) ? "저장 취소" : "저장"}`}
                      aria-pressed={library.saved.includes(lesson.id)}
                      onClick={() => toggleSaved(lesson.id)}
                    >
                      <Bookmark
                        size={18}
                        fill={
                          library.saved.includes(lesson.id)
                            ? "currentColor"
                            : "none"
                        }
                      />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty">
              <Search size={32} />
              <h3>
                {query.trim() || category !== "전체" || level !== "전체"
                  ? "일치하는 레슨이 없어요"
                  : "아직 레슨이 없어요"}
              </h3>
              <p>
                {query.trim() || category !== "전체" || level !== "전체"
                  ? "다른 단어나 카테고리로 다시 찾아보세요."
                  : view === "저장한 레슨"
                    ? "카드의 북마크 버튼으로 다시 보고 싶은 레슨을 모아 보세요."
                    : view === "최근 학습"
                      ? "레슨을 열면 이곳에 최근 본 순서로 모아 드려요."
                      : view === "완료한 레슨"
                        ? "레슨을 연습한 뒤 학습 완료 버튼으로 나의 진도를 남겨 보세요."
                        : "관심 있는 레슨을 탐색하며 나만의 영어 습관을 만들어 보세요."}
              </p>
              <button onClick={() => navigate("둘러보기")}>
                모든 레슨 둘러보기 <ChevronRight size={16} />
              </button>
            </div>
          )}
        </section>
        <div className="bottom-note">
          <span className="brand-mini">m.</span>
          <p>Perfect doesn&apos;t happen in a day. Progress does.</p>
          <span>오늘도 한 걸음 더.</span>
        </div>
      </main>
      {notice && (
        <div className="notice" role="status">
          {notice}
          <button aria-label="알림 닫기" onClick={() => setNotice("")}>
            <X size={16} />
          </button>
        </div>
      )}
      {selected && (
        <LessonPractice
          key={selected.id}
          lesson={selected}
          saved={library.saved.includes(selected.id)}
          completed={library.completed.includes(selected.id)}
          onClose={closeLesson}
          onSave={() => toggleSaved(selected.id)}
          onComplete={() => {
            updateLibrary({
              ...library,
              completed: library.completed.includes(selected.id)
                ? library.completed.filter((id) => id !== selected.id)
                : [...library.completed, selected.id],
            });
          }}
        />
      )}
    </div>
  );
}
