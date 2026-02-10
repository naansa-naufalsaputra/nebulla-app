import { vi } from 'vitest';

// Mock Gemini Service
export const mockGeminiService = {
    transcribeHandwriting: vi.fn(),
    askAssistant: vi.fn(),
    askAssistantStream: vi.fn(),
    solveMath: vi.fn(),
    brainstorm: vi.fn(),
    analyzeNote: vi.fn(),
    generateSuggestions: vi.fn(),
    animateDiagram: vi.fn(),
};

// Mock successful responses
export const setupSuccessfulGeminiResponses = () => {
    mockGeminiService.transcribeHandwriting.mockResolvedValue('Transcribed text');
    mockGeminiService.askAssistant.mockResolvedValue({
        text: 'AI response',
        links: []
    });
    mockGeminiService.solveMath.mockResolvedValue('Solution: 42');
    mockGeminiService.brainstorm.mockResolvedValue('Creative ideas...');
    mockGeminiService.analyzeNote.mockResolvedValue({
        summary: 'Note summary',
        actionItems: ['Action 1', 'Action 2'],
        topics: ['Topic 1', 'Topic 2']
    });
    mockGeminiService.generateSuggestions.mockResolvedValue([
        'Suggestion 1',
        'Suggestion 2',
        'Suggestion 3'
    ]);
};

// Mock rate limit error (429)
export const setupRateLimitError = () => {
    const error = new Error('429 Too Many Requests');
    (error as any).status = 429;
    mockGeminiService.askAssistant.mockRejectedValue(error);
};

// Mock streaming response
export async function* mockStreamGenerator(chunks: string[]) {
    for (const chunk of chunks) {
        yield chunk;
    }
}

export const setupStreamingResponse = (chunks: string[]) => {
    mockGeminiService.askAssistantStream.mockReturnValue(mockStreamGenerator(chunks));
};

// Reset mocks
export const resetGeminiMocks = () => {
    vi.clearAllMocks();
    Object.values(mockGeminiService).forEach(mock => mock.mockClear());
};
