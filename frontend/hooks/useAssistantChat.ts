"use client";

import { useMutation } from "@tanstack/react-query";
import { askAssistant } from "@/lib/api";
import type { ChatMessage } from "@/types";

/** Sends one message + prior history to ARIA. Call `mutateAsync(message, history)`
 * via the wrapper below, or `mutate` if you don't need the promise result. */
export function useAssistantChat() {
  return useMutation({
    mutationFn: ({ message, history }: { message: string; history: ChatMessage[] }) =>
      askAssistant(message, history),
  });
}
