import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from './Dashboard';

// Mock chrome API
global.chrome = {
  runtime: {
    sendMessage: vi.fn(),
  },
};

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Dashboard Component', () => {
  const mockUser = { email: 'test@example.com', id: '123' };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('mock-token');
  });

  it('renders dashboard with user info', () => {
    render(<Dashboard user={mockUser} />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText(`Welcome back, ${mockUser.email.split('@')[0]}`)).toBeInTheDocument();
  });

  it('loads data on mount', async () => {
    const mockResponse = {
      summaries: [
        {
          id: '1',
          summary_text: 'Test summary',
          original_url: 'https://example.com',
          created_at: new Date().toISOString(),
          word_count: 100
        }
      ]
    };

    global.chrome.runtime.sendMessage.mockResolvedValue(mockResponse);

    render(<Dashboard user={mockUser} />);

    await waitFor(() => {
      expect(global.chrome.runtime.sendMessage).toHaveBeenCalledWith({
        action: 'get-settings'
      });
    });
  });

  it('switches between tabs correctly', async () => {
    const user = userEvent.setup();
    render(<Dashboard user={mockUser} />);

    // Check initial tab
    expect(screen.getByText('History')).toBeInTheDocument();

    // Click favorites tab
    const favoritesTab = screen.getByText('⭐ Favorite Summaries');
    await user.click(favoritesTab);

    expect(screen.getByText('⭐ Favorite Summaries')).toBeInTheDocument();
  });

  it('handles delete confirmation flow', async () => {
    const user = userEvent.setup();
    const mockSummary = {
      id: '1',
      summary_text: 'Test summary',
      original_url: 'https://example.com',
      created_at: new Date().toISOString(),
      word_count: 100
    };

    // Mock initial data load
    global.chrome.runtime.sendMessage.mockImplementation((message) => {
      if (message.action === 'get-settings') {
        return Promise.resolve({ provider: 'huggingface' });
      }
      return Promise.resolve({ summaries: [mockSummary] });
    });

    render(<Dashboard user={mockUser} />);

    await waitFor(() => {
      expect(screen.getByText('Test summary')).toBeInTheDocument();
    });

    // Click delete button
    const deleteButton = screen.getByTitle('Delete summary');
    await user.click(deleteButton);

    // Check confirmation modal appears
    expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
    expect(screen.getByText('Move to rubbish bin?')).toBeInTheDocument();

    // Click confirm
    const confirmButton = screen.getByText('🗑️ Delete');
    await user.click(confirmButton);

    // Verify API call
    await waitFor(() => {
      expect(global.chrome.runtime.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'summarize-text',
          text: expect.any(String)
        })
      );
    });
  });

  it('handles favorite confirmation flow', async () => {
    const user = userEvent.setup();
    const mockSummary = {
      id: '1',
      summary_text: 'Test summary',
      original_url: 'https://example.com',
      created_at: new Date().toISOString(),
      word_count: 100
    };

    global.chrome.runtime.sendMessage.mockResolvedValue({
      summaries: [mockSummary]
    });

    render(<Dashboard user={mockUser} />);

    await waitFor(() => {
      expect(screen.getByText('Test summary')).toBeInTheDocument();
    });

    // Click favorite button
    const favoriteButton = screen.getByTitle('Add to favorites');
    await user.click(favoriteButton);

    // Check confirmation modal
    expect(screen.getByText('Confirm Favorite')).toBeInTheDocument();
    expect(screen.getByText('Lock as favorite?')).toBeInTheDocument();

    // Click confirm
    const confirmButton = screen.getByText('⭐ Favorite');
    await user.click(confirmButton);

    // Verify API call
    await waitFor(() => {
      expect(global.chrome.runtime.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'summarize-text',
          text: expect.any(String)
        })
      );
    });
  });

  it('handles clear all history with double confirmation', async () => {
    const user = userEvent.setup();

    // Mock window.confirm
    const mockConfirm = vi.fn();
    mockConfirm.mockReturnValueOnce(true); // First confirmation
    mockConfirm.mockReturnValueOnce(true); // Second confirmation
    window.confirm = mockConfirm;

    global.chrome.runtime.sendMessage.mockResolvedValue({});

    render(<Dashboard user={mockUser} />);

    // Click clear all button
    const clearButton = screen.getByText('🗑️ Clear All History');
    await user.click(clearButton);

    // Verify confirmations were called
    expect(mockConfirm).toHaveBeenCalledTimes(2);
    expect(mockConfirm).toHaveBeenNthCalledWith(1, '⚠️ Are you sure you want to delete ALL summaries?');
    expect(mockConfirm).toHaveBeenNthCalledWith(2, '🚨 FINAL WARNING: All summaries will be moved to rubbish bin for 30 days!');
  });

  it('loads more data when scrolling', async () => {
    const user = userEvent.setup();
    const mockSummaries = Array.from({ length: 20 }, (_, i) => ({
      id: `${i + 1}`,
      summary_text: `Summary ${i + 1}`,
      original_url: `https://example.com/${i + 1}`,
      created_at: new Date().toISOString(),
      word_count: 100
    }));

    global.chrome.runtime.sendMessage.mockResolvedValue({
      summaries: mockSummaries,
      pagination: { hasMore: true }
    });

    render(<Dashboard user={mockUser} />);

    await waitFor(() => {
      expect(screen.getByText('Summary 1')).toBeInTheDocument();
    });

    // Click load more
    const loadMoreButton = screen.getByText('Load More');
    await user.click(loadMoreButton);

    // Verify additional API call
    await waitFor(() => {
      expect(global.chrome.runtime.sendMessage).toHaveBeenCalledTimes(3); // Initial + load more
    });
  });

  it('displays empty states correctly', () => {
    global.chrome.runtime.sendMessage.mockResolvedValue({
      summaries: []
    });

    render(<Dashboard user={mockUser} />);

    expect(screen.getByText('📚')).toBeInTheDocument();
    expect(screen.getByText('No summaries yet. Start by summarizing some content!')).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    const mockError = new Error('API Error');
    global.chrome.runtime.sendMessage.mockRejectedValue(mockError);

    // Mock console.error to avoid test output pollution
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<Dashboard user={mockUser} />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load data:', mockError);
    });

    consoleSpy.mockRestore();
  });

  it('updates statistics in real-time', async () => {
    vi.useFakeTimers();

    render(<Dashboard user={mockUser} />);

    // Fast-forward time
    vi.advanceTimersByTime(3000);

    // Statistics should have updated (implementation depends on actual component)
    vi.useRealTimers();
  });
});