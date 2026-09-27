export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type AssistantResponse = {
  reply: string;
  toolsUsed: string[];
  usedFallback: boolean;
};
