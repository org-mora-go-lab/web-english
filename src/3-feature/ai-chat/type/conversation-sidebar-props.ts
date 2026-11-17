import type { ChatProject, ConversationSummary } from "./chat-state";

export type ConversationSidebarProps = {
  signedIn: boolean;
  projects: ChatProject[];
  conversations: ConversationSummary[];
  activeConversationId: string;
  openingConversationId?: string;
  busy: boolean;
  newChatDisabled?: boolean;
  loading: boolean;
  error: string;
  onNewChat: () => void;
  onOpenConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onMoveConversation: (id: string, projectId: string | null) => void;
  onCreateProject: (name: string) => Promise<boolean>;
  onRenameProject: (id: string, name: string) => Promise<boolean>;
  onDeleteProject: (id: string) => void;
};
