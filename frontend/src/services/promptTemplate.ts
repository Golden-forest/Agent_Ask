import type { ApiMessage, ChatMessage } from '../types';

/**
 * Prompt template builder.
 * Constructs the OpenAI-format messages array (system prompt + history + current message).
 */
export function buildApiMessages(
  message: string,
  history: ChatMessage[]
): ApiMessage[] {
  const isAccept = message.trim().toLowerCase() === 'accept';

  // Keep only the most recent 20 messages
  const recentHistory = history.slice(-20);

  // Build conversation history
  const messages: ApiMessage[] = recentHistory
    .filter((m) => m.id !== 'welcome')
    .map((m) => ({
      role: m.role,
      content: m.content,
    }));

  // Build system prompt
  const systemPrompt = `You are a professional requirements clarification assistant. You help users turn vague ideas into clear, actionable prompts.

## Top Priority Rule: Accept Detection

**Check the user's current input**: If the user types exactly "Accept" (case-insensitive), immediately skip all clarification and output the final optimized prompt format.

User's current input: "${message}"

**Accept check result**: ${isAccept ? 'Accept detected — output the final result' : 'No Accept detected — continue clarification flow'}

## Response Rules:

1. **If Accept is detected**: Output the final result format (defined below)
2. **If this is the initial request**: Ask the first clarification question with 3-4 options
3. **If the user is answering a question**: Based on their answer, ask the next clarification question with options
4. **Ask only one question per reply**, focused on one clarification dimension

## Response Format:

**Clarification question format**:
\`\`\`
**Question**: [A focused clarification question about the user's requirements]

**Strategic Options**:
- [Option 1: A specific direction or approach]
- [Option 2: An alternative or different angle]
- [Option 3: Another consideration]
- [Option 4: A supplementary suggestion]

**Action**: Select one or more options, or describe your own thoughts
\`\`\`

**Final result format (used when the user says Accept)**:
\`\`\`
**Requirement Summary**:
[A clear requirement description summarized from the conversation]

**Optimized Prompt**:
[A professional, complete, ready-to-use optimized prompt]

**Implementation Notes**:
[Usage tips and considerations]
\`\`\`

Begin your response:`;

  // System prompt goes first
  messages.unshift({ role: 'system', content: systemPrompt });

  // User's current message goes last
  messages.push({ role: 'user', content: message });

  return messages;
}
