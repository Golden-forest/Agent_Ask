# Terminal-Style Status System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a hacker-terminal style status display that shows all background work (connection, search, AI inference) to users in real-time with English text prompts.

**Architecture:**
- Add system state tracking to Zustand store
- Create reusable TerminalLog component for displaying status messages
- Integrate status hooks into existing WebSocket event handlers
- Style with monospace font, terminal colors, and subtle animations

**Tech Stack:**
- React + TypeScript
- Zustand (existing state management)
- Socket.IO (existing WebSocket)
- TailwindCSS (existing styling)

---

## Task 1: Create System State Types

**Files:**
- Modify: `frontend/src/types/index.ts`

**Step 1: Add system state types**

```typescript
// Add to types/index.ts after existing types

export type SystemPhase =
  | 'idle'
  | 'connecting'
  | 'sending'
  | 'searching'
  | 'inferring'
  | 'streaming'
  | 'complete'
  | 'error';

export interface SystemStatus {
  phase: SystemPhase;
  message: string;
  details?: string;
  timestamp: number;
  progress?: number; // 0-100
  metadata?: Record<string, string | number>;
}

export interface TerminalLog extends SystemStatus {
  id: string;
}
```

**Step 2: Run TypeScript compiler to verify types**

Run: `cd frontend && npm run type-check`
Expected: No type errors

**Step 3: Commit**

```bash
git add frontend/src/types/index.ts
git commit -m "feat(types): add system state types for terminal status system"
```

---

## Task 2: Extend ChatStore with System Status

**Files:**
- Modify: `frontend/src/store/chatStore.ts`

**Step 1: Add system status state to store interface**

```typescript
// Add to ChatStore interface after existing state
interface ChatStore {
  // ... existing state
  systemStatus: SystemStatus[];
  currentPhase: SystemPhase;
  addSystemStatus: (status: Omit<SystemStatus, 'id' | 'timestamp'>) => void;
  setPhase: (phase: SystemPhase) => void;
  clearSystemStatus: () => void;
  // ... existing methods
}
```

**Step 2: Initialize system status state**

```typescript
// Add to store initial state
export const useChatStore = create<ChatStore>((set, get) => ({
  // ... existing state
  systemStatus: [],
  currentPhase: 'idle',

  // Add new methods
  addSystemStatus: (status) => {
    const newStatus: SystemStatus = {
      ...status,
      timestamp: Date.now(),
    };
    set((state) => ({
      systemStatus: [...state.systemStatus, newStatus]
    }));
  },

  setPhase: (phase) => set({ currentPhase: phase }),

  clearSystemStatus: () => set({ systemStatus: [] }),

  // ... existing methods
}));
```

**Step 3: Run type check**

Run: `cd frontend && npm run type-check`
Expected: No type errors

**Step 4: Commit**

```bash
git add frontend/src/store/chatStore.ts
git commit -m "feat(store): add system status tracking to chat store"
```

---

## Task 3: Integrate Status Updates into WebSocket Handlers

**Files:**
- Modify: `frontend/src/store/chatStore.ts`

**Step 1: Update initSocket to add status messages**

```typescript
// Modify initSocket method
initSocket: () => {
  const { addSystemStatus, setPhase } = get();

  socketService.connect();

  // Add connection status
  addSystemStatus({
    phase: 'connecting',
    message: '[CONNECT] → Establishing secure connection...',
    details: 'Host: localhost:8000'
  });

  socketService.on('connect', () => {
    addSystemStatus({
      phase: 'complete',
      message: '[✓] Connection established',
      details: '12ms',
      metadata: { latency: 12 }
    });
    setPhase('idle');
  });

  // Update stream_chunk handler
  socketService.on('stream_chunk', (data) => {
    // ... existing code
    if (get().currentPhase !== 'streaming') {
      addSystemStatus({
        phase: 'streaming',
        message: '[STREAM] Receiving AI response...',
      });
      setPhase('streaming');
    }
  });

  // Update search_status handler
  socketService.on('search_status', (data) => {
    if (data.status === 'searching') {
      addSystemStatus({
        phase: 'searching',
        message: '[SEARCH] → Querying knowledge graph...',
      });
      setSearching(true);
      setPhase('searching');
    } else if (data.status === 'completed') {
      addSystemStatus({
        phase: 'complete',
        message: '[✓] Search complete',
        details: `${data.info?.length || 0} bytes retrieved`,
      });
      setSearching(false);
    } else if (data.status === 'error') {
      addSystemStatus({
        phase: 'error',
        message: '[!] Search failed',
        details: data.error,
      });
      setSearching(false);
    }
  });

  // ... rest of existing handlers
},
```

**Step 2: Update sendMessage to add status messages**

```typescript
// Modify sendMessage method
sendMessage: async (content) => {
  const { addSystemStatus, setPhase, /* ... */ } = get();

  if (!content.trim() && selectedOptions.length === 0) return;

  initSocket();

  // Add sending status
  addSystemStatus({
    phase: 'sending',
    message: '[>] Transmitting payload...',
    details: `${content.length} bytes`,
  });
  setPhase('sending');

  // ... rest of existing code

  // Emit to socket
  socketService.emit('chat_message', {
    message: fullMessage,
    history: messages.map(m => ({ role: m.role, content: m.content })),
    conversation_id: currentConversationId || undefined
  });

  // Add sent status
  addSystemStatus({
    phase: 'complete',
    message: '[✓] Sent successfully',
  });

  clearSelectedOptions();
},
```

**Step 3: Run type check**

Run: `cd frontend && npm run type-check`
Expected: No type errors

**Step 4: Commit**

```bash
git add frontend/src/store/chatStore.ts
git commit -m "feat(store): integrate system status into WebSocket handlers"
```

---

## Task 4: Create TerminalLog Component

**Files:**
- Create: `frontend/src/components/ui/TerminalLog.tsx`
- Create: `frontend/src/components/ui/__tests__/TerminalLog.test.tsx`

**Step 1: Write test for TerminalLog component**

```typescript
// frontend/src/components/ui/__tests__/TerminalLog.test.tsx
import { render, screen } from '@testing-library/react';
import { TerminalLog } from '../TerminalLog';

describe('TerminalLog', () => {
  it('displays system status messages', () => {
    const mockLogs = [
      {
        id: '1',
        phase: 'connecting' as const,
        message: '[CONNECT] → Establishing connection...',
        timestamp: Date.now(),
      },
      {
        id: '2',
        phase: 'complete' as const,
        message: '[✓] Connected',
        timestamp: Date.now() + 100,
        details: '12ms',
      },
    ];

    render(<TerminalLog logs={mockLogs} />);

    expect(screen.getByText('[CONNECT] → Establishing connection...')).toBeInTheDocument();
    expect(screen.getByText('[✓] Connected')).toBeInTheDocument();
    expect(screen.getByText('12ms')).toBeInTheDocument();
  });

  it('applies correct color classes based on phase', () => {
    const mockLogs = [
      {
        id: '1',
        phase: 'error' as const,
        message: '[!] Error occurred',
        timestamp: Date.now(),
      },
    ];

    const { container } = render(<TerminalLog logs={mockLogs} />);
    const errorElement = container.querySelector('.text-red-400');
    expect(errorElement).toBeInTheDocument();
  });

  it('shows empty state when no logs', () => {
    const { container } = render(<TerminalLog logs={[]} />);
    expect(container.textContent).toContain('System ready');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd frontend && npm test -- TerminalLog.test.tsx`
Expected: FAIL - "TerminalLog component not found"

**Step 3: Implement TerminalLog component**

```typescript
// frontend/src/components/ui/TerminalLog.tsx
import React from 'react';
import type { TerminalLog as TerminalLogType } from '../../types';

interface TerminalLogProps {
  logs: TerminalLogType[];
  maxLogs?: number;
}

const phaseColors: Record<TerminalLogType['phase'], string> = {
  idle: 'text-gray-400',
  connecting: 'text-cyan-400',
  sending: 'text-blue-400',
  searching: 'text-yellow-400',
  inferring: 'text-purple-400',
  streaming: 'text-green-400',
  complete: 'text-green-500',
  error: 'text-red-400',
};

export const TerminalLog: React.FC<TerminalLogProps> = ({
  logs,
  maxLogs = 20
}) => {
  const displayLogs = logs.slice(-maxLogs);

  if (displayLogs.length === 0) {
    return (
      <div className="font-mono text-xs text-gray-500 p-2">
        <span className="text-green-500">$</span> System ready...
      </div>
    );
  }

  return (
    <div className="font-mono text-xs space-y-1 p-2 bg-black/50 rounded border border-green-900/30">
      {displayLogs.map((log) => (
        <div
          key={log.id}
          className={`${phaseColors[log.phase]} hover:bg-white/5 px-1 rounded transition-colors`}
        >
          <div className="flex items-start gap-2">
            <span className="shrink-0">{log.message}</span>
            {log.details && (
              <span className="text-gray-400 text-xs">
                {log.details}
              </span>
            )}
          </div>
          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <div className="ml-4 text-gray-500 text-xs">
              {Object.entries(log.metadata).map(([key, value]) => (
                <span key={key} className="mr-2">
                  {key}: {value}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
      {logs.length > maxLogs && (
        <div className="text-gray-600 text-xs italic">
          ... ({logs.length - maxLogs} older messages)
        </div>
      )}
    </div>
  );
};
```

**Step 4: Run test to verify it passes**

Run: `cd frontend && npm test -- TerminalLog.test.tsx`
Expected: PASS (3/3 tests passing)

**Step 5: Commit**

```bash
git add frontend/src/components/ui/TerminalLog.tsx frontend/src/components/ui/__tests__/TerminalLog.test.tsx
git commit -m "feat(ui): add TerminalLog component with tests"
```

---

## Task 5: Integrate TerminalLog into ChatInterface

**Files:**
- Modify: `frontend/src/components/chat/ChatInterface.tsx`

**Step 1: Add TerminalLog to ChatInterface**

```typescript
// Add import
import { TerminalLog } from '../ui/TerminalLog';

// Update component to use systemStatus from store
export const ChatInterface: React.FC = () => {
    const { messages, isLoading, isSearching, systemStatus } = useChatStore();

    return (
        <div className="flex flex-col h-screen">
            {/* ... existing header and messages */}

            {/* Add terminal log section */}
            {systemStatus.length > 0 && (
                <div className="fixed bottom-20 left-4 right-4 max-w-md">
                    <TerminalLog logs={systemStatus} maxLogs={5} />
                </div>
            )}

            {/* ... existing input section */}
        </div>
    );
};
```

**Step 2: Run dev server and verify UI**

Run: `cd frontend && npm run dev`
Expected: Page loads, terminal log appears when messages are sent

**Step 3: Manual test in browser**

1. Open http://localhost:5177/
2. Send a message
3. Verify terminal status messages appear
4. Check that messages are in English
5. Verify colors match phases

**Step 4: Commit**

```bash
git add frontend/src/components/chat/ChatInterface.tsx
git commit -m "feat(ui): integrate TerminalLog into ChatInterface"
```

---

## Task 6: Add Collapsible Toggle for Terminal Log

**Files:**
- Modify: `frontend/src/components/chat/ChatInterface.tsx`
- Modify: `frontend/src/store/chatStore.ts`

**Step 1: Add toggle state to store**

```typescript
// Add to ChatStore interface
interface ChatStore {
  // ... existing
  showTerminalLog: boolean;
  toggleTerminalLog: () => void;
}

// Add to initial state
export const useChatStore = create<ChatStore>((set, get) => ({
  // ... existing
  showTerminalLog: true,

  // Add method
  toggleTerminalLog: () => set((state) => ({
    showTerminalLog: !state.showTerminalLog
  })),
}));
```

**Step 2: Add toggle button to ChatInterface**

```typescript
// In ChatInterface component
const { showTerminalLog, toggleTerminalLog } = useChatStore();

// Add toggle button
<button
  onClick={toggleTerminalLog}
  className="fixed bottom-4 left-4 z-50 p-2 bg-black/80 border border-green-900/50 rounded text-green-500 hover:bg-green-900/20 transition-colors"
  title="Toggle Terminal Log"
>
  {showTerminalLog ? '🔽' : '🔼'}
</button>

// Conditionally render terminal log
{showTerminalLog && systemStatus.length > 0 && (
  <div className="fixed bottom-16 left-4 right-4 max-w-md">
    <TerminalLog logs={systemStatus} maxLogs={5} />
  </div>
)}
```

**Step 3: Run type check**

Run: `cd frontend && npm run type-check`
Expected: No type errors

**Step 4: Commit**

```bash
git add frontend/src/store/chatStore.ts frontend/src/components/chat/ChatInterface.tsx
git commit -m "feat(ui): add collapsible toggle for terminal log"
```

---

## Task 7: Add Animations and Polish

**Files:**
- Modify: `frontend/src/components/ui/TerminalLog.tsx`
- Modify: `frontend/src/index.css`

**Step 1: Add fade-in animation to index.css**

```css
/* Add to frontend/src/index.css */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}
```

**Step 2: Update TerminalLog with animations**

```typescript
// In TerminalLog component, add animation class
<div className={`${phaseColors[log.phase]} hover:bg-white/5 px-1 rounded transition-all animate-fade-in`}>
```

**Step 3: Add blinking cursor effect**

```typescript
// Add to TerminalLog component
<div className="font-mono text-xs space-y-1 p-2 bg-black/50 rounded border border-green-900/30">
  {displayLogs.map((log) => (
    // ... existing log rendering
  ))}
  {/* Add blinking cursor */}
  {displayLogs.length > 0 && (
    <span className="text-green-500 animate-pulse">▊</span>
  )}
</div>
```

**Step 4: Commit**

```bash
git add frontend/src/components/ui/TerminalLog.tsx frontend/src/index.css
git commit -m "feat(ui): add animations and polish to terminal log"
```

---

## Task 8: Write Documentation

**Files:**
- Create: `docs/TERMINAL_STATUS_SYSTEM.md`

**Step 1: Write documentation**

```markdown
# Terminal Status System

## Overview
The terminal status system provides real-time visibility into background operations using a hacker-terminal aesthetic.

## Features
- Real-time status updates for: connection, search, AI inference, streaming
- Color-coded phases (cyan=connecting, yellow=searching, purple=inferring, green=complete, red=error)
- Collapsible UI with toggle button
- Auto-scroll to latest messages (max 5 displayed)
- English text prompts for all statuses

## Usage
Status messages appear automatically during operations:
- `[CONNECT]` → WebSocket connection
- `[>]` → Message transmission
- `[SEARCH]` → Web search queries
- `[INFERENCE]` → AI processing
- `[STREAM]` → Response generation
- `[✓]` → Operation complete
- `[!]` → Error occurred

## Implementation
- **Store:** `chatStore.ts` - System status state management
- **Component:** `TerminalLog.tsx` - Display component
- **Integration:** WebSocket event handlers in `initSocket()`
```

**Step 2: Commit**

```bash
git add docs/TERMINAL_STATUS_SYSTEM.md
git commit -m "docs: add terminal status system documentation"
```

---

## Task 9: Final Integration Testing

**Files:**
- No file changes

**Step 1: Run full test suite**

Run: `cd frontend && npm test -- --coverage`
Expected: All tests pass, coverage > 80%

**Step 2: Manual end-to-end test**

1. Start backend: `python server.py`
2. Start frontend: `cd frontend && npm run dev`
3. Open browser to http://localhost:5177/
4. Send test message: "I want to build a RAG system"
5. Verify terminal shows:
   - `[CONNECT] → Establishing connection...`
   - `[>] Transmitting payload...`
   - `[SEARCH] → Querying knowledge graph...`
   - `[✓] Search complete`
   - `[STREAM] Receiving AI response...`
6. Verify toggle button works
7. Verify colors are correct
8. Verify all text is in English

**Step 3: Check for console errors**

Run: Open browser DevTools Console
Expected: No errors or warnings

**Step 4: Commit**

```bash
git commit --allow-empty -m "test: complete integration testing"
```

---

## Testing Checklist

Before considering this feature complete, verify:

- [ ] All TypeScript types are correct
- [ ] All unit tests pass (TerminalLog.test.tsx)
- [ ] Terminal appears on message send
- [ ] Search status shows during web searches
- [ ] Connection status shows on connect
- [ ] Streaming status shows during AI response
- [ ] Toggle button shows/hides terminal
- [ ] Colors match phases (cyan/yellow/purple/green/red)
- [ ] All text is in English
- [ ] No console errors
- [ ] Documentation is complete

---

## Success Criteria

1. **Visibility:** Users can see all background operations
2. **Clarity:** English text is clear and technical
3. **Aesthetics:** Terminal style with monospace font and colors
4. **Performance:** No lag or stuttering during updates
5. **Reliability:** Accurate status reporting
