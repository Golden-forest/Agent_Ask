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

  it('limits displayed logs to maxLogs', () => {
    const mockLogs = Array.from({ length: 25 }, (_, i) => ({
      id: `${i}`,
      phase: 'complete' as const,
      message: `[✓] Operation ${i}`,
      timestamp: Date.now() + i,
    }));

    const { container } = render(<TerminalLog logs={mockLogs} maxLogs={20} />);

    // Should show "older messages" indicator
    expect(container.textContent).toContain('5 older messages');
  });

  it('displays metadata when present', () => {
    const mockLogs = [
      {
        id: '1',
        phase: 'complete' as const,
        message: '[✓] Connection established',
        timestamp: Date.now(),
        metadata: {
          latency: 12,
          protocol: 'websocket',
        },
      },
    ];

    const { container } = render(<TerminalLog logs={mockLogs} />);

    expect(container.textContent).toContain('latency: 12');
    expect(container.textContent).toContain('protocol: websocket');
  });
});
