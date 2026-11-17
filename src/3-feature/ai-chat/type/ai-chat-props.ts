import type { ReactNode } from "react";

export type AiChatProps = {
  signedIn: boolean;
  embedded?: boolean;
  onContentTarget?: (target: HTMLElement | null) => void;
  sidebarTarget?: HTMLElement | null;
  onSidebarNavigate?: () => void;
  welcomeVisual?: ReactNode;
  renderLearningVisual?: (activityId: string) => ReactNode;
  onClearTopic?: () => void;
  learningTopic?: { key: string; title: string; prompt: string; activityId?: string } | null;
};
