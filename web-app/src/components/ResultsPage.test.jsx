import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ResultsPage from './ResultsPage';

// Mock fetch
global.fetch = vi.fn();

// Mock URL constructor
global.URL = class {
  constructor(url) {
    this.href = url;
    this.hostname = url.split('/')[2] || 'example.com';
  }
};

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('ResultsPage Component', () => {
  const mockUser = { email: 'test@example.com', id: '123' };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock URL search params
    Object.defineProperty(window, 'location', {
      value: { search: '?q=test+query' },
      writable: true
    });
  });

  it('renders results page with search query', () => {
    renderWithRouter(<ResultsPage user={mockUser} />);

    expect(screen.getByText('Results for "test query"')).toBeInTheDocument();
    expect(screen.getByText('Back to Search')).toBeInTheDocument();
  });

  it('loads and displays results with thumbnails', async () => {
    const mockResults = [
      {
        id: '1',
        title: 'Test Video Result',
        summary: 'This is a test summary',
        original_url: 'https://youtube.com/watch?v=test',
        thumbnail: 'https://img.youtube.com/vi/test/maxresdefault.jpg',
        type: 'video',
        created_at: new Date().toISOString(),
        word_count: 150
      }
    ];

    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ summaries: mockResults })
    });

    renderWithRouter(<ResultsPage user={mockUser} />);

    await waitFor(() => {
      expect(screen.getByText('Test Video Result')).toBeInTheDocument();
      expect(screen.getByText('This is a test summary')).toBeInTheDocument();
    });

    // Check for video thumbnail
    const img = screen.getByAltText('Test Video Result');
    expect(img).toBeInTheDocument();
    expect(img.src).toContain('youtube.com');
  });

  it('handles batch selection and processing', async () => {
    const user = userEvent.setup();
    const mockResults = [
      {
        id: '1',
        title: 'Test Result 1',
        summary: 'Summary 1',
        original_url: 'https://example.com/1',
        thumbnail: 'https://via.placeholder.com/320x180',
        type: 'article',
        created_at: new Date().toISOString(),
        word_count: 100
      },
      {
        id: '2',
        title: 'Test Result 2',
        summary: 'Summary 2',
        original_url: 'https://example.com/2',
        thumbnail: 'https://via.placeholder.com/320x180',
        type: 'article',
        created_at: new Date().toISOString(),
        word_count: 100
      }
    ];

    global.fetch.mockResolvedValue({
      json: () => Promise.resolve({ summaries: mockResults })
    });

    renderWithRouter(<ResultsPage user={mockUser} />);

    await waitFor(() => {
      expect(screen.getByText('Test Result 1')).toBeInTheDocument();
    });

    // Select items
    const items = screen.getAllByText(/Test Result/);
    await user.click(items[0].closest('div'));
    await user.click(items[1].closest('div'));

    // Check selection indicators
    expect(screen.getAllByRole('img', { hidden: true }).length).toBeGreaterThan(0);

    // Check batch process button
    expect(screen.getByText('Process 2 Items')).toBeInTheDocument();
  });

  it('filters results by type', async () => {
    const user = userEvent.setup();
    const mockResults = [
      {
        id: '1',
        title: 'Video Result',
        summary: 'Video summary',
        original_url: 'https://youtube.com/watch?v=test',
        thumbnail: 'https://img.youtube.com/vi/test/maxresdefault.jpg',
        type: 'video',
        created_at: new Date().toISOString(),
        word_count: 100
      },
      {
        id: '2',
        title: 'Article Result',
        summary: 'Article summary',
        original_url: 'https://example.com/article',
        thumbnail: 'https://via.placeholder.com/320x180',
        type: 'article',
        created_at: new Date().toISOString(),
        word_count: 100
      }
    ];

    global.fetch.mockResolvedValue({
      json: () => Promise.resolve({ summaries: mockResults })
    });

    renderWithRouter(<ResultsPage user={mockUser} />);

    await waitFor(() => {
      expect(screen.getByText('Video Result')).toBeInTheDocument();
      expect(screen.getByText('Article Result')).toBeInTheDocument();
    });

    // Filter by videos
    const videoFilter = screen.getByText('Videos (1)');
    await user.click(videoFilter);

    await waitFor(() => {
      expect(screen.getByText('Video Result')).toBeInTheDocument();
      expect(screen.queryByText('Article Result')).not.toBeInTheDocument();
    });

    // Filter by articles
    const articleFilter = screen.getByText('Articles (1)');
    await user.click(articleFilter);

    await waitFor(() => {
      expect(screen.queryByText('Video Result')).not.toBeInTheDocument();
      expect(screen.getByText('Article Result')).toBeInTheDocument();
    });
  });

  it('displays loading state', () => {
    global.fetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    renderWithRouter(<ResultsPage user={mockUser} />);

    expect(screen.getByText('Loading results...')).toBeInTheDocument();
  });

  it('handles empty results', async () => {
    global.fetch.mockResolvedValue({
      json: () => Promise.resolve({ summaries: [] })
    });

    renderWithRouter(<ResultsPage user={mockUser} />);

    await waitFor(() => {
      expect(screen.getByText('🔍')).toBeInTheDocument();
      expect(screen.getByText('No results found')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    global.fetch.mockRejectedValue(new Error('API Error'));

    renderWithRouter(<ResultsPage user={mockUser} />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load results:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('navigates back to search', async () => {
    const user = userEvent.setup();
    const mockNavigate = vi.fn();
    vi.mock('react-router-dom', async () => ({
      ...await vi.importActual('react-router-dom'),
      useNavigate: () => mockNavigate
    }));

    renderWithRouter(<ResultsPage user={mockUser} />);

    const backButton = screen.getByText('Back to Search');
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('loads recent results when no search query', () => {
    // Mock no search query
    Object.defineProperty(window, 'location', {
      value: { search: '' },
      writable: true
    });

    global.fetch.mockResolvedValue({
      json: () => Promise.resolve({ summaries: [] })
    });

    renderWithRouter(<ResultsPage user={mockUser} />);

    expect(screen.getByText('Recent Summaries')).toBeInTheDocument();
  });
});