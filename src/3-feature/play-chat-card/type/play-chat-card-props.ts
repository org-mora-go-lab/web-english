import type { PlayActivity } from "@/src/4-entity/family";

export type PlayChatCardProps = {
  activity?: PlayActivity | null;
  onStartToday?: () => void;
  onRecord?: () => void;
  disabled?: boolean;
};
