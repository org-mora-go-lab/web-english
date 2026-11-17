export type AiChatProps = {
  signedIn: boolean;
  embedded?: boolean;
  onClearTopic?: () => void;
  learningTopic?: { key: string; title: string; prompt: string } | null;
};
