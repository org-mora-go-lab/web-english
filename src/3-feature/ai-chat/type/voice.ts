import type { ChatMode, SavedConversation } from "./chat-state";

export type AiVoiceOptions = {
  conversationId: string; revision: number; mode: ChatMode; voice: "cat" | "marin" | "cedar";
  onTranscript: (text: string) => void;
  onConversation: (conversation: SavedConversation) => void;
  onError: (message: string) => void;
  onNotice: (message: string) => void;
};

export type AiVoiceCall = {
  controllers: Set<AbortController>; pc: RTCPeerConnection | null; media: MediaStream | null;
  audio: HTMLAudioElement | null; sessionId: string; observerId: string;
  channel: RTCDataChannel | null;
  sender: RTCRtpSender | null; ready: boolean; refreshing: boolean; expiresAt: number;
  inputBusy: boolean; responseBusy: boolean; outputBusy: boolean; pending: Set<string>; finishedUsers: Set<string>;
  latestUser: string; responseUsers: Map<string, string>; warmRevision: number; contextRevision: number; activated: boolean;
  timer?: ReturnType<typeof setTimeout>; warmTimer?: ReturnType<typeof setTimeout>;
};
export type AiVoiceResources = {
  media: MediaStream | null; primary: AiVoiceCall | null; spare: AiVoiceCall | null; retiring: AiVoiceCall | null;
  muted: boolean; advancing: boolean;
};
