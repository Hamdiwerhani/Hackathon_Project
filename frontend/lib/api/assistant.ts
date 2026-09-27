import { postJson } from "./http";
import type { AssistantResponse, ChatMessage } from "@/types";

export function askAssistant(message: string, history: ChatMessage[]): Promise<AssistantResponse> {
  return postJson<AssistantResponse>("/api/assistant", { message, history });
}
