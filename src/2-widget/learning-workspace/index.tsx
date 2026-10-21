"use client";

import {
  ArrowDown,
  ArrowRight,
  Bookmark,
  Check,
  CheckCheck,
  ChevronRight,
  Compass,
  GraduationCap,
  History,
  Home,
  Menu,
  Play,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { LessonPractice } from "@/src/3-feature";
import type { Lesson } from "@/src/4-entity";
import { categories, lessons, useLibrary } from "@/src/4-entity";

const navigation = [
  { name: "홈", icon: Home },
  { name: "둘러보기", icon: Compass },
  { name: "저장한 레슨", icon: Bookmark },
  { name: "최근 학습", icon: History },
  { name: "완료한 레슨", icon: CheckCheck },
];

export function LearningWorkspace() {
  const lessonTrigger = useRef<HTMLElement | null>(null);
  const [view, setView] = useState("홈");
  const [category, setCategory] = useState("전체");
  const [query, setQuery] = useState("");
  const [sidebar, setSidebar] = useState(false);
  const [selected, setSelected] = useState<Lesson | null>(null);
  const { library, hydrate, update } = useLibrary();
  const [notice, setNotice] = useState("");
  useEffect(() => {
    hydrate();
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
    setSidebar(false);
  }
  const visible = (
    view === "최근 학습"
      ? library.history
          .map((id) => lessons.find((lesson) => lesson.id === id)!)
          .filter(Boolean)
      : lessons
  ).filter(
    (lesson) =>
      (category === "전체" || lesson.category === category) &&
      (view !== "저장한 레슨" || library.saved.includes(lesson.id)) &&
      (view !== "완료한 레슨" || library.completed.includes(lesson.id)) &&
      `${lesson.title} ${lesson.subtitle} ${lesson.category} ${lesson.headline.join(" ")} ${lesson.phrases.map((phrase) => `${phrase.english} ${phrase.korean}`).join(" ")}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  return (
    <div className={`learning-workspace ${sidebar ? "menu-open" : ""}`}>
      <a className="skip-link" href="#content">
        본문으로 건너뛰기
      </a>
      <header className="topbar">
        <div className="brand-group">
          <button
            className="icon-button menu-toggle"
            aria-label="메뉴 열기/닫기"
            aria-expanded={sidebar}
            onClick={() => setSidebar(!sidebar)}
          >
            <Menu size={22} />
          </button>
          <button
            className="brand"
            aria-label="Mora English 홈"
            onClick={() => navigate("홈")}
          >
            <span className="brand-mark">
              <Play size={16} fill="white" />
            </span>
            <strong>
              mora<span>english</span>
            </strong>
            <sup>EN</sup>
          </button>
        </div>
        <form
          className="search"
          role="search"
          onSubmit={(event) => event.preventDefault()}
        >
          <input
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
            onClick={() => navigate("완료한 레슨")}
          >
            M
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
      <aside className="sidebar">
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
          <div className="progress">
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
          <span>© {new Date().getFullYear()} Mora English · v1.0.0</span>
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
        {view === "홈" && !query && category === "전체" && (
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
              <button onClick={() => openLesson(lessons[0])}>
                오늘의 레슨 시작하기 <ArrowRight size={17} />
              </button>
              <span className="hero-footnote">
                부담 없이 시작하는 하루 한 레슨
              </span>
            </div>
            <div className="hero-art" aria-hidden="true">
              <span className="art-orbit orbit-one" />
              <span className="art-orbit orbit-two" />
              <div className="art-label">
                A LITTLE ENGLISH,
                <br />A WHOLE NEW WORLD.
              </div>
              <div className="speech-card speech-first">
                Hello,
                <br />
                <span>new possibilities.</span>
                <span className="card-star">✳</span>
              </div>
              <div className="speech-card speech-second">
                <span className="wave-bars">▂ ▆ ▃ █ ▅ ▂ ▆ ▃</span>
                <span>Listen. Speak. Grow.</span>
                <span className="art-play">
                  <Play size={16} fill="currentColor" />
                </span>
              </div>
              <span className="floating-star">✦</span>
              <span className="art-small">one day at a time ↗</span>
            </div>
          </section>
        )}
        <section className="lesson-section" aria-label="레슨 목록">
          <div className="section-heading">
            <div>
              <h2>
                {query
                  ? "검색 결과"
                  : view === "홈"
                    ? "오늘, 이런 영어 어때요?"
                    : view === "둘러보기"
                      ? "나에게 맞는 영어 찾기"
                      : view}
              </h2>
              <p>
                {query
                  ? `“${query}” · ${visible.length}개의 레슨`
                  : view === "홈"
                    ? "일상에 바로 꺼내 쓸 수 있는 짧은 레슨을 만나보세요."
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
                      <span>mora original</span>
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
                      <Play size={27} fill="white" />
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
                      <p>
                        {lesson.creator}
                        <span className="verified">✓</span>
                      </p>
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
              <h3>{query ? "일치하는 레슨이 없어요" : "아직 레슨이 없어요"}</h3>
              <p>
                {query
                  ? "다른 단어나 카테고리로 다시 찾아보세요."
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
            if (!library.completed.includes(selected.id))
              updateLibrary({
                ...library,
                completed: [...library.completed, selected.id],
              });
          }}
        />
      )}
    </div>
  );
}
