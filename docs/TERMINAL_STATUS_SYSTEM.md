# Terminal Status System

## Overview

The Terminal Status System is a real-time visual feedback component that displays system operations and AI processing phases in a terminal-like interface. It provides users with transparency into what's happening behind the scenes during their conversations with agent_ask.

## Features

### Real-Time Status Updates
- **Socket.IO Integration**: Receives live updates from the backend via WebSocket connection
- **Phase-Based Status**: Tracks different phases of the conversation lifecycle
- **Timestamp Tracking**: Each log entry includes a precise timestamp
- **Auto-Scroll**: Automatically shows the most recent entries (configurable limit)

### Visual Design
- **Terminal Aesthetics**: Black background with green/colored text mimics a command-line interface
- **Color-Coded Phases**: Each system phase has a distinct color for easy recognition
- **Fade-In Animations**: Log entries smoothly appear with staggered animation delays
- **Blinking Cursor**: Authentic terminal feel with a blinking underscore cursor
- **Hover Effects**: Entries highlight on hover for better readability

### User Interaction
- **Collapsible Interface**: Toggle button (🔽/🔼) to show/hide the terminal log
- **Fixed Positioning**: Stays visible at bottom-left corner without blocking content
- **Responsive Design**: Adapts to different screen sizes
- **Smart Visibility**: Only appears when there are status messages to display

## System Phases

The terminal log tracks these operational phases:

| Phase | Color | Description |
|-------|-------|-------------|
| `idle` | Gray | System ready, waiting for input |
| `connecting` | Cyan | Establishing WebSocket connection |
| `sending` | Blue | Transmitting user message to server |
| `searching` | Yellow | Querying external search APIs |
| `inferring` | Purple | AI model processing request |
| `streaming` | Green | Receiving streaming AI response |
| `complete` | Green | Operation completed successfully |
| `error` | Red | Error occurred during processing |

## Usage

### For Users

The Terminal Status System is automatic and requires no user interaction:

1. **Automatic Display**: The terminal log appears automatically when system events occur
2. **Toggle Visibility**: Click the 🔽/🔼 button in the bottom-left corner to show/hide
3. **Read Status**: Watch real-time updates as you interact with agent_ask
4. **Log Limit**: Shows the 5 most recent entries (configurable)

### For Developers

#### Store Integration

```typescript
import { useChatStore } from '../../store/chatStore';

function MyComponent() {
    const {
        systemStatus,        // Array of log entries
        showTerminalLog,     // Visibility state
        toggleTerminalLog,   // Toggle function
        addSystemStatus,     // Add new log entry
        clearSystemStatus    // Clear all logs
    } = useChatStore();

    // Add a status message
    addSystemStatus({
        phase: 'processing',
        message: '[PROCESSING] → Working on your request...',
        details: 'Step 1 of 3',
        metadata: { progress: 33 }
    });
}
```

#### Component Usage

```tsx
import { TerminalLog } from '../components/ui/TerminalLog';

function MyLayout() {
    const { systemStatus } = useChatStore();

    return (
        <div>
            {/* Other content */}

            {/* Terminal log display */}
            {systemStatus.length > 0 && (
                <div className="fixed bottom-20 left-4 max-w-md">
                    <TerminalLog
                        logs={systemStatus}
                        maxLogs={5}  // Optional: defaults to 20
                    />
                </div>
            )}
        </div>
    );
}
```

## Implementation Details

### Data Structure

```typescript
interface SystemStatus {
    id: string;              // Unique identifier (timestamp-based)
    phase: SystemPhase;      // Current operation phase
    message: string;         // Human-readable status message
    details?: string;        // Additional information (optional)
    metadata?: Record<string, any>;  // Extra data (optional)
    timestamp: number;       // Unix timestamp in milliseconds
}

type SystemPhase =
    | 'idle'
    | 'connecting'
    | 'sending'
    | 'searching'
    | 'inferring'
    | 'streaming'
    | 'complete'
    | 'error';
```

### Socket.IO Events

The terminal log listens to these Socket.IO events:

#### Client → Server

- `chat_message`: Sends user message and conversation history

#### Server → Client

- `connect`: Connection established
- `stream_chunk`: Streaming response chunk received
- `stream_complete`: Full response received
- `search_status`: Search operation status update
- `error`: Error occurred

### Color Mapping

```typescript
const phaseColors: Record<SystemPhase, string> = {
    idle: 'text-gray-400',
    connecting: 'text-cyan-400',
    sending: 'text-blue-400',
    searching: 'text-yellow-400',
    inferring: 'text-purple-400',
    streaming: 'text-green-400',
    complete: 'text-green-500',
    error: 'text-red-400',
};
```

## File Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── ui/
│   │       └── TerminalLog.tsx        # Main component
│   ├── store/
│   │   └── chatStore.ts               # State management
│   ├── types/
│   │   └── index.ts                   # TypeScript types
│   └── index.css                      # Animations & styles
└── docs/
    └── TERMINAL_STATUS_SYSTEM.md      # This documentation
```

## Customization

### Adjust Log Limit

Change the number of visible log entries:

```tsx
<TerminalLog logs={systemStatus} maxLogs={10} />
```

### Modify Colors

Edit `phaseColors` in `TerminalLog.tsx`:

```typescript
const phaseColors: Record<SystemPhase, string> = {
    idle: 'text-blue-400',  // Changed from gray
    // ... other phases
};
```

### Animation Speed

Adjust animation duration in `index.css`:

```css
.animate-fade-in {
    animation: fadeIn 0.5s ease-out;  /* Changed from 0.3s */
}

.animate-blink {
    animation: blink 0.5s infinite;  /* Changed from 1s */
}
```

### Stagger Delay

Modify the animation delay per log entry in `TerminalLog.tsx`:

```tsx
style={{ animationDelay: `${index * 100}ms` }}  /* Changed from 50ms */
```

## Performance Considerations

- **Log Limiting**: Only displays the most recent N logs (default: 20 in component, 5 in ChatInterface)
- **Efficient Re-renders**: React keys based on unique log IDs
- **CSS Animations**: Hardware-accelerated transforms for smooth performance
- **Conditional Rendering**: Component only renders when logs exist

## Accessibility

- **Font Monospace**: Uses monospace font for terminal authenticity
- **High Contrast**: Green/colored text on black background for readability
- **Hover States**: Visual feedback on interactive elements
- **Title Attributes**: Toggle button includes descriptive title

## Browser Compatibility

- Modern browsers with CSS animation support
- WebSocket support for Socket.IO
- ES6+ JavaScript support

## Future Enhancements

Potential improvements for future versions:

1. **Export Logs**: Button to download terminal log as text file
2. **Search/Filter**: Search within log entries
3. **Log Persistence**: Save logs to localStorage for session recovery
4. **Copy to Clipboard**: Individual log entry or full log copy
5. **Dark/Light Mode**: Theme-aware terminal styling
6. **Sound Effects**: Optional audio feedback for status changes
7. **Log Levels**: Support for debug, info, warn, error levels
8. **Timestamp Display**: Show human-readable timestamps

## Troubleshooting

### Terminal Not Appearing

**Issue**: Terminal log doesn't show when expected

**Solutions**:
1. Check browser console for Socket.IO connection errors
2. Verify backend server is running on port 8000
3. Ensure `systemStatus.length > 0` condition is met
4. Check `showTerminalLog` state in store

### Animations Not Working

**Issue**: Fade-in animations don't play

**Solutions**:
1. Verify CSS is properly imported in `index.css`
2. Check browser supports CSS animations
3. Look for CSS conflicts in dev tools

### Socket Connection Fails

**Issue**: WebSocket connection errors

**Solutions**:
1. Confirm backend server is running
2. Check CORS configuration on backend
3. Verify Socket.IO client version compatibility
4. Review browser network tab for connection errors

## Related Documentation

- [Socket.IO Documentation](https://socket.io/docs/)
- [React Animation Best Practices](https://react.dev/learn/adding-interactivity)
- [Zustand Store Management](https://zustand-demo.pmnd.rs/)
- [TailwindCSS Animation Utilities](https://tailwindcss.com/docs/animation)

## Version History

- **v1.0.0** (2025-01-21): Initial implementation
  - Real-time status tracking
  - Terminal-style UI
  - Collapsible interface
  - Fade-in animations
  - Blinking cursor

## License

Part of the agent_ask project. See project LICENSE for details.
