import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../services/fileParser', () => ({
    extractText: vi.fn(),
}));

import { useChatStore } from '../chatStore';
import { socketService } from '../../services/socket';

describe('chatStore Accept flow', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('keeps Accept exact while adding current selections to history', async () => {
        const emitSpy = vi.spyOn(socketService, 'emit').mockImplementation(() => undefined);

        useChatStore.setState({
            messages: [
                {
                    id: 'welcome',
                    role: 'assistant',
                    content: 'Welcome',
                    timestamp: new Date(),
                },
            ],
            selectedOptions: ['Visual polish', 'Mobile responsiveness'],
            attachedFiles: [],
            isLoading: false,
            _socketInitialized: true,
        });

        await useChatStore.getState().sendMessage('Accept');

        const call = emitSpy.mock.calls.find(([event]) => event === 'chat_message');
        expect(call).toBeDefined();

        const payload = call?.[1];
        expect(payload?.message).toBe('Accept');
        expect(payload?.history.at(-1)?.content).toBe(
            'Current selected options to accept: Visual polish; Mobile responsiveness',
        );
        expect(useChatStore.getState().messages.at(-1)?.content).toBe(
            'Accept\n\nVisual polish\nMobile responsiveness',
        );
    });
});
