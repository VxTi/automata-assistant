/**
 * @fileoverview ChatConversationInteractivityHook.ts
 * @author Luca Warmenhoven
 * @date Created on Tuesday, October 22 - 17:01
 */
import { useCallback } from "react";
import { StreamedChatResponse } from "llm";

export function useChatInteractivity() {

    const appendIncomingChunk = useCallback((chunk: StreamedChatResponse) => {

    }, []);

}
