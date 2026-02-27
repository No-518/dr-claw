import type { ChatMessage } from '../types/types';

export interface UserItem {
  kind: 'user';
  message: ChatMessage;
}

export interface StandaloneItem {
  kind: 'standalone';
  message: ChatMessage;
}

export interface AgentTurnItem {
  kind: 'agent-turn';
  finalMessage: ChatMessage | null;
  intermediateMessages: ChatMessage[];
  toolCount: number;
  toolNames: string[];
  isActivelyStreaming: boolean;
}

export type GroupedItem = UserItem | StandaloneItem | AgentTurnItem;

/**
 * Groups chat messages into agent turns.
 * Messages between two user messages form a single agent turn.
 * The last text-only assistant message in a turn is the "final" message shown directly;
 * everything else is intermediate (collapsed by default).
 */
export function groupMessagesIntoTurns(
  messages: ChatMessage[],
  isLoading: boolean
): GroupedItem[] {
  const items: GroupedItem[] = [];
  let currentTurnMessages: ChatMessage[] = [];

  const flushTurn = (isLastTurn: boolean) => {
    if (currentTurnMessages.length === 0) return;

    const activelyStreaming = isLastTurn && isLoading;

    // Find the last assistant message that is pure text (not tool use, not thinking-only)
    let finalIndex = -1;
    for (let i = currentTurnMessages.length - 1; i >= 0; i--) {
      const msg = currentTurnMessages[i];
      if (
        msg.type === 'assistant' &&
        !msg.isToolUse &&
        !msg.isThinking &&
        msg.content &&
        msg.content.trim().length > 0
      ) {
        finalIndex = i;
        break;
      }
    }

    const toolNames: string[] = [];
    const toolNamesSet = new Set<string>();
    let toolCount = 0;

    for (const msg of currentTurnMessages) {
      if (msg.isToolUse && msg.toolName) {
        toolCount++;
        if (!toolNamesSet.has(msg.toolName)) {
          toolNamesSet.add(msg.toolName);
          toolNames.push(msg.toolName);
        }
      }
    }

    // If there's only one message and it's the final text message, standalone
    if (
      currentTurnMessages.length === 1 &&
      finalIndex === 0 &&
      toolCount === 0
    ) {
      items.push({ kind: 'standalone', message: currentTurnMessages[0] });
      currentTurnMessages = [];
      return;
    }

    const finalMessage = finalIndex >= 0 ? currentTurnMessages[finalIndex] : null;
    const intermediateMessages =
      finalIndex >= 0
        ? currentTurnMessages.filter((_, i) => i !== finalIndex)
        : [...currentTurnMessages];

    items.push({
      kind: 'agent-turn',
      finalMessage,
      intermediateMessages,
      toolCount,
      toolNames,
      isActivelyStreaming: activelyStreaming,
    });

    currentTurnMessages = [];
  };

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (msg.type === 'user' && !msg.isSkillContent) {
      flushTurn(false);
      items.push({ kind: 'user', message: msg });
    } else {
      currentTurnMessages.push(msg);
    }
  }

  // Flush remaining non-user messages as the last turn
  flushTurn(true);

  return items;
}
